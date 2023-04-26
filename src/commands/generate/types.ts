import Base from '../base'
import fs from 'fs'
import { Variable, fetchVariables } from '../../api/variables'
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
  }
  authRequired = true

  public async run(): Promise<void> {
      const { flags } = await this.parse(GenerateTypes)
      await this.requireProject()

      const variables = await fetchVariables(this.token, this.projectKey)
      const typesString =
      'type DVCJSON = string[] | number[] | boolean[] | { [key: string]: string | boolean | number }\n\n' +
      'export type DVCVariableTypes = {\n' +
        `${variables.map((variable) => `\t${this.getVariableKeyAndtype(variable)}`).join('\n')}` +
      '\n}'

      try {
          if (!fs.existsSync(flags['output-dir'])){
              fs.mkdirSync(flags['output-dir'], { recursive: true })
          }
          fs.writeFileSync(`${flags['output-dir']}/dvcVariableTypes.ts`, typesString)
      } catch (err) {
          console.error('Unable to create output directory: ', err)
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
}
