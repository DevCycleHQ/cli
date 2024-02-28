import Base from '../base'
import fs from 'fs'
import { fetchAllVariables } from '../../api/variables'
import { Flags } from '@oclif/core'
import { Project, Variable } from '../../api/schemas'
import { OrganizationMember, fetchOrganizationMembers } from '../../api/members'
import { camelCase, upperFirst } from 'lodash'
import aesjs from 'aes-js'

const reactImports = () => {
    const reactSDK = '@devcycle/react-client-sdk'
    return `import {
    useVariableValue
} from '${reactSDK}'
import { DVCJSON } from '@devcycle/types'

`
}

export default class GenerateClient extends Base {
    static hidden = false
    static description = 'Generate Variable Types from the management API'
    static flags = {
        ...Base.flags,
        'output-dir': Flags.string({
            description: 'Directory to output the generated types to',
            default: '.'
        }),
        'react': Flags.boolean({
            description: 'Generate types for use with React',
            default: false
        }),
        'obfuscate': Flags.boolean({
            description: 'Obfuscate the variable keys',
            default: false
        })
    }
    authRequired = true

    methodNames : Record<string, string> = {}

    project: Project

    public async run(): Promise<void> {
        const { flags } = await this.parse(GenerateClient)
        const { project, headless, obfuscate } = flags
        this.project = await this.requireProject(project, headless)

        const variables = await fetchAllVariables(this.authToken, this.projectKey)
        const orgMembers = await fetchOrganizationMembers(this.authToken)
        const typesString = await this.getTypesString(variables, flags['react'], obfuscate)
        //@ts-ignore
        const shouldObfuscate = obfuscate || this.project.settings.obfuscation?.required
        //@ts-ignore
        if (shouldObfuscate && !this.project.settings.obfuscation?.key) {
            throw new Error('Cannot generate obfuscated DevCycle client, project does not have an obfuscation key set!')
        }

        try {
            if (!fs.existsSync(flags['output-dir'])) {
                fs.mkdirSync(flags['output-dir'], { recursive: true })
            }
            fs.writeFileSync(`${flags['output-dir']}/devcycleClient.ts`, typesString)
            this.writer.successMessage(`Generated new client to ${flags['output-dir']}/devcycleClient.ts`)
        } catch (err) {
            let message
            if (err instanceof Error) message = err.message
            this.writer.failureMessage(`Unable to write to ${flags['output-dir']}/dvcVariableTypes.ts` + `: ${message}`)
        }
    }

    private async getTypesString(
        variables: Variable[],
        react: boolean,
        obfuscate: boolean
    ) {
        const functionPromises = variables.map((variable) => react ? this.getVariableMethodReact(variable, obfuscate) : this.getVariableMethod(variable, obfuscate))
        const functionLines = await Promise.all(functionPromises)
        const types = (react ? reactImports() : '') + functionLines.join('\n')
        return types
    }

    private getVariableMethod(variable: Variable, obfuscate: boolean) {
        const methodName = camelCase(variable.key)
        this.checkDuplicateMethod(methodName, variable.key)

        this.methodNames[methodName] = variable.key

        const hashedKey = obfuscate ? this.encryptKey(variable.key) : variable.key

        return `export const ${methodName} = (defaultValue: ${this.getVariableType(variable)}) => client.variableValue('${hashedKey}', defaultValue)`
    }

    private getVariableMethodReact(variable: Variable, obfuscate: boolean) {
        const methodName = camelCase(variable.key)
        const hookName = `use${upperFirst(methodName)}`
        this.checkDuplicateMethod(hookName, variable.key)

        this.methodNames[hookName] = variable.key

        const hashedKey = obfuscate ? this.encryptKey(variable.key) : variable.key

        return `export const ${hookName} = (defaultValue: ${this.getVariableType(variable)}) => useVariableValue('${hashedKey}', defaultValue)`
    }

    private checkDuplicateMethod(methodName: string, key: string) {
        if (this.methodNames[methodName]) {
            throw new Error(`Duplicate method name generated from variable key ${key}, variable ${this.methodNames[methodName]} resolves to the same method name! Please archive and replace one of the variables to ensure there are no naming collisions.`)
        }
    }

    private getVariableType(variable: Variable) {
        if (variable.validationSchema && variable.validationSchema.schemaType === 'enum') {
            // TODO fix the schema so it doesn't think enumValues is an object
            const enumValues = variable.validationSchema.enumValues as string[] | number []
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

    private async getVariableInfoComment(variable: Variable, orgMembers: OrganizationMember[]) {
        const { flags } = await this.parse(GenerateClient)
        const { 'include-descriptions': includeDescriptions, 'inline-comments': inlineComments } = flags

        const descriptionText = includeDescriptions && variable.description
            ? `${this.sanitizeDescription(variable.description)}`
            : ''

        const creator = variable._createdBy ? this.findCreatorName(orgMembers, variable._createdBy) : 'Unknown User'
        const createdDate = variable.createdAt.split('T')[0]
        const creationInfo = `created by ${creator} on ${createdDate}`

        return inlineComments
            ? this.inlineComment(descriptionText, creationInfo)
            : this.blockComment(descriptionText, creator, createdDate)
    }

    private sanitizeDescription(description: string) {
        // Remove newlines, tabs, and carriage returns for proper display
        return description.replace(/[\r\n\t]/g, ' ').trim()
    }

    private findCreatorName(orgMembers: OrganizationMember[], creatorId: string) {
        return orgMembers.find((member) => member.user_id === creatorId)?.name || 'Unknown User'
    }

    private inlineComment(description: string, creationInfo: string) {
        const descriptionText = description ? `(${description}) ` : ''
        return ` // ${descriptionText}${creationInfo}`
    }

    private blockComment(description: string, creator: string, createdDate: string) {
        return (
            '    /*\n' +
            (description !== '' ? `    description: ${description}\n` : '') +
            `    created by: ${creator}\n` +
            `    created on: ${createdDate}\n` +
            '    */'
        )
    }

    private encryptKey(variableKey: string) {
        //@ts-ignore
        const key = this.project.settings.obfuscation.key
        const textBytes = aesjs.utils.utf8.toBytes(variableKey)
        const aesCtr = new aesjs.ModeOfOperation.ctr(key)
        const encryptedBytes = aesCtr.encrypt(textBytes)
        return aesjs.utils.hex.fromBytes(encryptedBytes)
    }
}
