import Base from '../base'
import fs from 'fs'
import { QueryOptions, Variable, fetchVariables } from '../../api/variables'
import { Flags } from '@oclif/core'

export default class GenerateTypes extends Base {
  static hidden = false
  static description = 'Generate Variable Types from the management API'
  static flags = {
      ...Base.flags,
      'output-dir': Flags.string({
          description: 'Directory to output the generated types to',
          default: '.'
      }),
      'watch': Flags.boolean({
          description: 'Watch for changes to variables and regenerate types',
          default: false
      }),
      'react': Flags.boolean({
          description: 'Generate types for use with React',
          default: false
      }),
  }
  authRequired = true
  lastUpdatedVariableDate?: Date = undefined

  public async run(): Promise<void> {
      const { flags } = await this.parse(GenerateTypes)

      if (flags['watch']) {
          this.subscribeSubscribeToVariableChanges()
      } else {
          this.generateTypes()
      }
  }

  async subscribeSubscribeToVariableChanges(): Promise<void> {
      this.writer.statusMessage('Watching for changes to variables')
      setInterval(async () => {
          await this.requireProject()
          const queryOptions: QueryOptions = {
              perPage: 1,
              sortBy: 'updatedAt',
              sortOrder: 'desc',
          }
          const variables = await fetchVariables(this.token, this.projectKey, queryOptions)
          
          if (this.haveVariablesChanged(variables[0])) {
              this.generateTypes()
          }
      }, 3000)
  }

  haveVariablesChanged(lastModifiedVariable: Variable): boolean {
      if (this.lastUpdatedVariableDate === undefined || lastModifiedVariable.updatedAt > this.lastUpdatedVariableDate) {
          this.lastUpdatedVariableDate = lastModifiedVariable.updatedAt
          return true
      }
      return false
  }

  async generateTypes(): Promise<void> {
      const { flags } = await this.parse(GenerateTypes)

      const variables = await fetchVariables(this.token, this.projectKey)
      let fileOutput = this.getTypesString(variables, flags['react'])
      if (flags['react']) {
          fileOutput += this.getReactOverridesString()
      }

      try {
          if (!fs.existsSync(flags['output-dir'])){
              fs.mkdirSync(flags['output-dir'], { recursive: true })
          }
          fs.writeFileSync(`${flags['output-dir']}/dvcVariableTypes.d.ts`, fileOutput)
          this.writer.successMessage(`Generated new types to ${flags['output-dir']}/dvcVariableTypes.ts`)
      } catch (err) {
          let message
          if (err instanceof Error) message = err.message
          this.writer.failureMessage(`Unable to write to ${flags['output-dir']}/dvcVariableTypes.ts` + `: ${message}`)
      }
  }

  getVariableKeyAndtype(variable: Variable): string {
      return `'${variable.key}': ${this.getVariableType(variable)}`
  }

  getVariableType(variable: Variable): string {
      if (variable.validationSchema && variable.validationSchema.schemaType === 'enum') {
          const enumValues = variable.validationSchema.enumValues
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

  getTypesString(variables: Variable[], react: boolean): string {
      const types = 
          'type DVCJSON = string[] | number[] | boolean[] | { [key: string]: string | boolean | number }\n\n' +
          `${!react ? 'export' : ''} type DVCVariableTypes = {\n` +
          `${variables.map((variable) => `\t${this.getVariableKeyAndtype(variable)}`).join('\n')}` +
          '\n}'
      return types
  }

  getReactOverridesString(): string {
      const reactOverrides = 
          '\n\n' +
          'declare module \'@devcycle/devcycle-react-sdk\' {\n' +
          '\timport { DVCVariable, DVCVariableValue } from \'@devcycle/devcycle-js-sdk\'\n' +
          '\texport * from \'@devcycle/devcycle-react-sdk\'\n' +
          '\n' +
          '\texport function useVariableValue<\n' +
          '\t\tK extends string & keyof DVCVariableTypes,\n' +
          '\t\tT extends DVCVariableValue & DVCVariableTypes[K],\n' +
          '\t>(key: K, defaultValue: T): DVCVariable<T>[\'value\']\n' +
          '\n' +
          '\texport function useVariable<\n' +
          '\t\tK extends string & keyof DVCVariableTypes,\n' +
          '\t\tT extends DVCVariableValue & DVCVariableTypes[K],\n' +
          '\t>(key: K, defaultValue: T): DVCVariable<T>\n' +
           '}'
      return reactOverrides
  }

}
