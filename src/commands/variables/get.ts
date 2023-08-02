import { Flags } from '@oclif/core'
import { fetchVariables, fetchVariableByKey } from '../../api/variables'
import Base from '../base'
import { batchRequests } from '../../utils/batchRequests'

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

        let variables
        if (keys) {
            variables = await batchRequests(
                keys, 
                (key) => fetchVariableByKey(this.authToken, this.projectKey, key)
            )

        } else {
            variables = await fetchVariables(this.authToken, this.projectKey)
        }
        this.writer.showResults(variables)
    }
}
