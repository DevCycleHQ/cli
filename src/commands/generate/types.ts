import Base from '../base'
import fs from 'fs'
import { fetchAllVariables } from '../../api/variables'
import { Flags } from '@oclif/core'
import { Feature, Project, Variable, CustomProperty } from '../../api/schemas'
import { OrganizationMember, fetchOrganizationMembers } from '../../api/members'
import { upperCase } from 'lodash'
import { createHash } from 'crypto'
import path from 'path'
import {
    fetchAllCompletedOrArchivedFeatures,
    fetchFeatures,
} from '../../api/features'
import { fetchCustomProperties } from '../../api/customProperties'
import {
    blockComment,
    findCreatorName,
    generateCustomDataType,
    getRecommendedValueForStale,
    getVariableType,
    isVariableDeprecated,
    isVariableStale,
    nextImports,
    reactImports,
    reactOverrides,
    sanitizeDescription,
} from '../../utils/types'

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
            deprecated: {
                message:
                    'The React SDK since v1.30.0 does not require this flag. Its types can be augmented automatically',
            },
        }),
        nextjs: Flags.boolean({
            description: 'Generate types for use with Next.js',
            deprecated: {
                message:
                    'The Next.js SDK since v2.7.0 does not require this flag. Its types can be augmented automatically',
            },
        }),
        'no-declaration': Flags.boolean({
            description:
                'Do not generate a "declare module" statement that automatically overrides SDK types.',
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
            hidden: true, // Hide this flag as it's being removed
        }),
        'include-descriptions': Flags.boolean({
            description:
                'Include variable descriptions in the variable information comment',
            default: true,
        }),
        'strict-custom-data': Flags.boolean({
            description: 'Generate stricter custom data types',
            default: true,
        }),
        obfuscate: Flags.boolean({
            description: 'Obfuscate the variable keys.',
            default: false,
        }),
        'include-deprecation-warnings': Flags.boolean({
            description:
                'Include @deprecated tags for variables of completed features',
            default: true,
        }),
    }
    authRequired = true
    methodNames: Record<string, string[]> = {}
    orgMembers: OrganizationMember[]
    includeDescriptions = false
    obfuscate = false
    project: Project
    outputDir: string
    includeDeprecationWarnings = true
    noDeclaration = false
    features: Feature[] = []
    customProperties: CustomProperty[]

    public async run(): Promise<void> {
        const { flags } = await this.parse(GenerateTypes)
        const {
            project,
            headless,
            'include-descriptions': includeDescriptions,
            obfuscate,
            'output-dir': outputDir,
            'no-declaration': noDeclaration,
            'include-deprecation-warnings': includeDeprecationWarnings,
        } = flags
        this.includeDescriptions = includeDescriptions
        this.obfuscate = obfuscate
        this.outputDir = outputDir
        this.includeDeprecationWarnings = includeDeprecationWarnings
        this.project = await this.requireProject(project, headless)
        this.customProperties = await fetchCustomProperties(
            this.authToken,
            this.projectKey,
        )
        this.noDeclaration = noDeclaration

        if (this.project.settings.obfuscation.required) {
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

        if (this.project.settings?.staleness?.enabled) {
            const [completedFeatures, staleFeatures] = await Promise.all([
                fetchAllCompletedOrArchivedFeatures(
                    this.authToken,
                    this.projectKey,
                ),
                fetchFeatures(this.authToken, this.projectKey, {
                    staleness: 'all',
                }),
            ])
            this.features = [...completedFeatures, ...staleFeatures]
        } else {
            this.features = await fetchAllCompletedOrArchivedFeatures(
                this.authToken,
                this.projectKey,
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
            flags['nextjs'],
            flags['old-repos'],
            flags['strict-custom-data'],
        )

        try {
            if (!fs.existsSync(flags['output-dir'])) {
                fs.mkdirSync(flags['output-dir'], { recursive: true })
            }
            fs.writeFileSync(
                `${flags['output-dir']}/dvcVariableTypes.ts`,
                typesString,
            )
            this.updateFileLocation()
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
        next: boolean,
        oldRepos: boolean,
        strictCustomData: boolean,
    ) {
        const typeLines = variables.map((variable) =>
            this.getTypeDefinitionLine(variable),
        )
        const definitionLines = variables.map((variable) =>
            this.getVariableDefinition(variable),
        )

        let imports = ''
        if (react) {
            imports = reactImports(oldRepos, strictCustomData)
        } else if (next) {
            imports = nextImports(strictCustomData)
        } else {
            // Add a default import for non-React, non-Next.js cases
            imports = oldRepos
                ? `export type DevCycleJSON = { [key: string]: string | boolean | number }\n\n`
                : `import { DevCycleJSON${!strictCustomData ? ', DVCCustomDataJSON' : ''} } from '@devcycle/js-client-sdk'\n\n`
        }

        let types =
            imports +
            this.generateDeclareModuleStatement() +
            generateCustomDataType(this.customProperties, strictCustomData) +
            (react || next ? reactOverrides : '') +
            'export type DVCVariableTypes = {\n' +
            typeLines.join('\n') +
            '\n}'
        types += '\n' + definitionLines.join('\n')
        types += '\n' + ''
        return types
    }

    private generateDeclareModuleStatement() {
        if (this.noDeclaration) {
            return ''
        }
        return (
            `declare module '@devcycle/types' {\n` +
            `   interface CustomVariableDefinitions extends DVCVariableTypes {}\n` +
            `}\n\n`
        )
    }

    private getTypeDefinitionLine(variable: Variable) {
        if (this.obfuscate) {
            return `    ${this.getVariableKeyAndType(variable)}`
        }
        return (
            `${this.getVariableInfoComment(variable, true)}\n` +
            `    ${this.getVariableKeyAndType(variable)}`
        )
    }

    private getVariableKeyAndType(variable: Variable) {
        return `'${
            this.obfuscate ? this.encryptKey(variable) : variable.key
        }': ${getVariableType(variable)}`
    }

    private getVariableInfoComment(variable: Variable, indent: boolean) {
        const descriptionText =
            this.includeDescriptions && variable.description
                ? `${sanitizeDescription(variable.description)}`
                : ''

        const creator = variable._createdBy
            ? findCreatorName(this.orgMembers, variable._createdBy)
            : 'Unknown User'
        const createdDate = variable.createdAt.split('T')[0]

        const deprecationInfo = isVariableDeprecated(variable, this.features)

        const isDeprecated =
            this.includeDeprecationWarnings && deprecationInfo.deprecated
        const deprecationWarning = isDeprecated
            ? `@deprecated This variable is part of ${deprecationInfo.feature?.status} feature "${deprecationInfo.feature?.name}" and should be cleaned up.\n`
            : ''

        let staleWarning = ''
        if (this.project.settings?.staleness?.enabled) {
            const staleInfo = isVariableStale(variable, this.features)
            const recommendedValue = getRecommendedValueForStale(
                variable,
                staleInfo.feature as Feature,
            )

            const formatRecommendedValueForComment = (
                recommendedValue: string,
            ) => {
                if (recommendedValue) {
                    try {
                        const parsed = JSON.parse(recommendedValue)
                        if (typeof parsed === 'object' && parsed !== null) {
                            const indentation = indent ? '    ' : ''
                            const jsonString = JSON.stringify(parsed, null, 4)
                            return (
                                '\n' +
                                jsonString
                                    .split('\n')
                                    .map((line) =>
                                        line ? indentation + line : line,
                                    )
                                    .join('\n') +
                                '\n'
                            )
                        }
                    } catch {
                        return recommendedValue
                    }
                }
                return recommendedValue
            }

            const formattedRecommendedValue =
                formatRecommendedValueForComment(recommendedValue)
            staleWarning = staleInfo.stale
                ? `@stale This variable is part of "${staleInfo.feature?.name}" feature with stale reason: ${staleInfo.feature?.staleness?.reason}. ${recommendedValue ? `Recommended value to set it to: ${formattedRecommendedValue}` : ''}\n`
                : ''
        }

        return blockComment(
            descriptionText,
            creator,
            createdDate,
            indent,
            !this.obfuscate ? variable.key : undefined,
            deprecationWarning,
            staleWarning,
        )
    }

    private getVariableDefinition(variable: Variable) {
        const constantName = this.getVariableGeneratedName(variable)

        const hashedKey = this.obfuscate
            ? this.encryptKey(variable)
            : variable.key

        return `
${this.getVariableInfoComment(variable, false)}\n
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
        return `dvc_obfs_${createHash('sha256')
            .update(variable._id)
            .digest('hex')}`
    }

    private updateFileLocation() {
        if (!this.repoConfig) {
            return
        }
        const outputPath = this.repoConfig.typeGenerator?.outputPath
        const newOutputPath = path.join(this.outputDir, '/dvcVariableTypes.ts')
        if (outputPath !== newOutputPath) {
            this.updateRepoConfig({
                typeGenerator: {
                    ...this.repoConfig.typeGenerator,
                    outputPath: newOutputPath,
                },
            })
            this.writer.successMessage(
                outputPath
                    ? `Updated configured types output path to ${newOutputPath}`
                    : `Stored configured types output path as ${newOutputPath}`,
            )
        }
    }
}
