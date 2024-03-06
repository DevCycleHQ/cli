import Base from '../base'
import fs from 'fs'
import { fetchAllVariables } from '../../api/variables'
import { Flags } from '@oclif/core'
import { Project, Variable } from '../../api/schemas'
import { OrganizationMember, fetchOrganizationMembers } from '../../api/members'
import { upperCase } from 'lodash'

const reactImports = (oldRepos: boolean) => {
    const jsRepo = oldRepos
        ? '@devcycle/devcycle-js-sdk'
        : '@devcycle/js-client-sdk'
    const reactRepo = oldRepos
        ? '@devcycle/devcycle-react-sdk'
        : '@devcycle/react-client-sdk'
    return `import { DVCVariable, DVCVariableValue } from '${jsRepo}'
import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue
} from '${reactRepo}'

`
}
const reactOverrides = `
export type UseVariableValue = <
    K extends string & keyof DVCVariableTypes
>(
    key: K,
    defaultValue: DVCVariableTypes[K]
) => DVCVariableTypes[K]

export const useVariableValue: UseVariableValue = originalUseVariableValue

export type UseVariable = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: DVCVariableTypes[K]
) => DVCVariable<T>

export const useVariable: UseVariable = originalUseVariable`

export default class GenerateTypes extends Base {
    static hidden = false
    static description = 'Generate Variable Types from the management API'
    static flags = {
        ...Base.flags,
        'output-dir': Flags.string({
            description: 'Directory to output the generated types to',
            default: '.',
        }),
        react: Flags.boolean({
            description: 'Generate types for use with React',
            default: false,
        }),
        'old-repos': Flags.boolean({
            description:
                'Generate types for use with old DevCycle repos ' +
                '(@devcycle/devcycle-react-sdk, @devcycle/devcycle-js-sdk)',
            default: false,
        }),
        'inline-comments': Flags.boolean({
            description:
                'Inline variable informaton comment on the same line as the type definition',
            default: false,
        }),
        'include-descriptions': Flags.boolean({
            description:
                'Include variable descriptions in the variable information comment',
            default: true,
        }),
        obfuscate: Flags.boolean({
            description: 'Obfuscate the variable keys.',
            default: false,
        }),
    }
    authRequired = true
    methodNames: Record<string, string[]> = {}
    orgMembers: OrganizationMember[]
    includeDescriptions = false
    inlineComments = false
    obfuscate = false
    project: Project

    public async run(): Promise<void> {
        const { flags } = await this.parse(GenerateTypes)
        const {
            project,
            headless,
            'include-descriptions': includeDescriptions,
            'inline-comments': inlineComments,
            obfuscate,
        } = flags
        this.includeDescriptions = includeDescriptions
        this.inlineComments = inlineComments
        this.obfuscate = obfuscate
        this.project = await this.requireProject(project, headless)

        if (
            this.project.settings.obfuscation.enabled &&
            this.project.settings.obfuscation.required
        ) {
            if (!this.obfuscate) {
                this.writer.infoMessage(
                    'Obfuscation is required for this project, setting --obfuscate flag to true',
                )
            }
            this.obfuscate = true
        }

        if (this.obfuscate) {
            this.writer.infoMessage(
                'Writing types with obfuscated variable keys',
            )
        }

        const variables = await fetchAllVariables(
            this.authToken,
            this.projectKey,
        )
        this.orgMembers = await fetchOrganizationMembers(this.authToken)
        const typesString = await this.getTypesString(
            variables,
            flags['react'],
            flags['old-repos'],
        )

        try {
            if (!fs.existsSync(flags['output-dir'])) {
                fs.mkdirSync(flags['output-dir'], { recursive: true })
            }
            fs.writeFileSync(
                `${flags['output-dir']}/dvcVariableTypes.ts`,
                typesString,
            )
            this.writer.successMessage(
                `Generated new types to ${flags['output-dir']}/dvcVariableTypes.ts`,
            )
        } catch (err) {
            let message
            if (err instanceof Error) message = err.message
            this.writer.failureMessage(
                `Unable to write to ${flags['output-dir']}/dvcVariableTypes.ts` +
                    `: ${message}`,
            )
        }
    }

    private async getTypesString(
        variables: Variable[],
        react: boolean,
        oldRepos: boolean,
    ) {
        const typeLines = variables.map((variable) =>
            this.getTypeDefinitionLine(variable),
        )
        const definitionLines = variables.map((variable) =>
            this.getVariableDefinition(variable),
        )

        let types =
            (react ? reactImports(oldRepos) : '') +
            'type DVCJSON = { [key: string]: string | boolean | number }\n\n' +
            'export type DVCVariableTypes = {\n' +
            typeLines.join('\n') +
            '\n}'
        types += '\n' + definitionLines.join('\n')
        types += '\n' + ''
        if (react) {
            types += reactOverrides
        }
        return types
    }

    private getTypeDefinitionLine(variable: Variable) {
        if (this.obfuscate) {
            return `    ${this.getVariableKeyAndType(variable)}`
        }
        if (this.inlineComments) {
            return (
                `    ${this.getVariableKeyAndType(variable)}` +
                `${this.getVariableInfoComment(variable, true)}`
            )
        }
        return (
            `${this.getVariableInfoComment(variable, true)}\n` +
            `    ${this.getVariableKeyAndType(variable)}`
        )
    }

    private getVariableKeyAndType(variable: Variable) {
        return `'${this.obfuscate ? this.encryptKey(variable) : variable.key}': ${getVariableType(variable)}`
    }

    private getVariableInfoComment(variable: Variable, indent: boolean) {
        return getVariableInfoComment(
            variable,
            this.orgMembers,
            this.includeDescriptions,
            this.inlineComments,
            this.obfuscate,
            indent,
        )
    }

    private getVariableDefinition(variable: Variable) {
        const constantName = this.getVariableGeneratedName(variable)

        const hashedKey = this.obfuscate
            ? this.encryptKey(variable)
            : variable.key

        return `
${this.getVariableInfoComment(variable, false)}
export const ${constantName} = '${hashedKey}' as const`
    }

    getVariableGeneratedName(variable: Variable) {
        let constantName = upperCase(variable.key).replace(/\s/g, '_')

        if (this.methodNames[constantName]?.length) {
            constantName = `${constantName}_${this.methodNames[constantName].length}`
        }

        this.methodNames[constantName] ||= []
        this.methodNames[constantName].push(variable.key)

        return constantName
    }

    private encryptKey(variable: Variable) {
        return `dvc_obfs_${variable._id}`
    }
}

export function getVariableInfoComment(
    variable: Variable,
    orgMembers: OrganizationMember[],
    includeDescriptions: boolean,
    inlineComments: boolean,
    includeKey: boolean,
    indent: boolean,
) {
    const descriptionText =
        includeDescriptions && variable.description
            ? `${sanitizeDescription(variable.description)}`
            : ''

    const creator = variable._createdBy
        ? findCreatorName(orgMembers, variable._createdBy)
        : 'Unknown User'
    const createdDate = variable.createdAt.split('T')[0]
    const creationInfo = `created by ${creator} on ${createdDate}`

    return inlineComments
        ? inlineComment(descriptionText, creationInfo)
        : blockComment(
              descriptionText,
              creator,
              createdDate,
              indent,
              includeKey ? variable.key : undefined,
          )
}

export function sanitizeDescription(description: string) {
    // Remove newlines, tabs, and carriage returns for proper display
    return description.replace(/[\r\n\t]/g, ' ').trim()
}

export function findCreatorName(
    orgMembers: OrganizationMember[],
    creatorId: string,
) {
    return (
        orgMembers.find((member) => member.user_id === creatorId)?.name ||
        'Unknown User'
    )
}

export function inlineComment(description: string, creationInfo: string) {
    const descriptionText = description ? `(${description}) ` : ''
    return ` // ${descriptionText}${creationInfo}`
}

export function blockComment(
    description: string,
    creator: string,
    createdDate: string,
    indent: boolean,
    key?: string,
) {
    const indentString = indent ? '    ' : ''
    return (
        indentString +
        '/**\n' +
        (key ? `    key: ${key}\n` : '') +
        (description !== ''
            ? `${indentString}    description: ${description}\n`
            : '') +
        `${indentString}    created by: ${creator}\n` +
        `${indentString}    created on: ${createdDate}\n` +
        indentString +
        '*/'
    )
}

export function getVariableType(variable: Variable) {
    if (
        variable.validationSchema &&
        variable.validationSchema.schemaType === 'enum'
    ) {
        // TODO fix the schema so it doesn't think enumValues is an object
        const enumValues = variable.validationSchema.enumValues as
            | string[]
            | number[]
        if (enumValues === undefined || enumValues.length === 0) {
            return variable.type.toLocaleLowerCase()
        }
        return enumValues.map((value) => `'${value}'`).join(' | ')
    }
    if (variable.type === 'JSON') {
        return 'DVCJSON'
    }
    return variable.type.toLocaleLowerCase()
}
