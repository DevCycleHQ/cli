import { Flags } from '@oclif/core'
import { fetchVariables } from '../../api/variables'
import Base from '../base'

export default class DetailedVariables extends Base {
    static hidden = false
    static flags = {
        ...Base.flags,
        'keys': Flags.string({
            description: 'Comma-separated list of variable keys to fetch details for',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedVariables)
        const keys = flags['keys']?.split(',')
        const { project, headless } = flags
        await this.requireProject(project, headless)

        let variables = await fetchVariables(this.authToken, this.projectKey)
        if (keys) {
            variables = variables.filter((variable) => keys.includes(variable.key))
        }
        this.writer.showResults(variables)
    }
}
