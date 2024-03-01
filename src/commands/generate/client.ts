import Base from '../base'
import fs from 'fs'
import { fetchAllVariables } from '../../api/variables'
import { Flags } from '@oclif/core'
import { Project, Variable } from '../../api/schemas'
import { OrganizationMember, fetchOrganizationMembers } from '../../api/members'
import { camelCase, upperCase, upperFirst } from 'lodash'
import aesjs from 'aes-js'
import GenerateTypes from './types'

const reactImports = () => {
    const reactSDK = '@devcycle/react-client-sdk'
    return `import {
    useVariableValue as _useVariableValue,
} from '${reactSDK}'
import { DVCJSON } from '@devcycle/types'
import { DVCVariableValue } from '@devcycle/js-client-sdk'

type ObfuscatedKey<T extends string> = T & { __brand: 'DevCycleObfuscatedKey' }

export const useVariableValue = <K extends string, T extends DVCVariableValue>(
    key: ObfuscatedKey<K>, defaultValue: T
) => {
    return _useVariableValue(key, defaultValue)
}
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

    orgMembers: OrganizationMember[] = []

    public async run(): Promise<void> {
        const { flags } = await this.parse(GenerateClient)
        const { project, headless, obfuscate } = flags
        this.project = await this.requireProject(project, headless)

        const variables = await fetchAllVariables(this.authToken, this.projectKey)
        this.orgMembers = await fetchOrganizationMembers(this.authToken)
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

        return `export const ${methodName} = (defaultValue: ${GenerateTypes.getVariableType(variable)}) => client.variableValue('${hashedKey}', defaultValue)`
    }

    private getVariableMethodReact(variable: Variable, obfuscate: boolean) {
        const methodName = camelCase(variable.key)
        const constantName = upperCase(variable.key).replace(/\s/g, '_')
        const hookName = `use${upperFirst(methodName)}`
        this.checkDuplicateMethod(hookName, variable.key)

        this.methodNames[hookName] = variable.key

        const hashedKey = obfuscate ? this.encryptKey(variable.key) : variable.key

        return `
${GenerateTypes.getVariableInfoComment(variable, this.orgMembers, true, false, true)}
export const ${constantName} = '${hashedKey}' as ObfuscatedKey<'${variable.key}'>
export const ${hookName} = (defaultValue: ${GenerateTypes.getVariableType(variable)}) => useVariableValue(${constantName}, defaultValue)`
    }

    private checkDuplicateMethod(methodName: string, key: string) {
        if (this.methodNames[methodName]) {
            throw new Error(`Duplicate method name generated from variable key ${key}, variable ${this.methodNames[methodName]} resolves to the same method name! Please archive and replace one of the variables to ensure there are no naming collisions.`)
        }
    }

    private encryptKey(variableKey: string) {
        //@ts-ignore
        const key = this.project.settings.obfuscation.key
        const textBytes = aesjs.utils.utf8.toBytes(variableKey)
        const aesCtr = new aesjs.ModeOfOperation.ctr(key)
        const encryptedBytes = aesCtr.encrypt(textBytes)
        return `dvc_obfs_${aesjs.utils.hex.fromBytes(encryptedBytes)}`
    }
}
