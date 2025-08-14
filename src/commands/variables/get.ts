import { Args, Flags } from '@oclif/core'
import { fetchVariables, fetchVariableByKey } from '../../api/variables'
import Base from '../base'
import { batchRequests } from '../../utils/batchRequests'
import { parseKeysFromArgs } from '../../utils/parseKeysFromArgs'

export default class DetailedVariables extends Base {
    static hidden = false
    static description = 'Retrieve Variables from the Management API'
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> var-one',
        '<%= config.bin %> <%= command.id %> var-one var-two',
        '<%= config.bin %> <%= command.id %> var-one,var-two',
        '<%= config.bin %> <%= command.id %> --keys=var-one,var-two',
    ]
    static args = {
        keys: Args.string({
            description:
                'Variable keys to fetch (space-separated or comma-separated)',
            required: false,
        }),
    }
    static strict = false
    static flags = {
        ...Base.flags,
        keys: Flags.string({
            description:
                'Comma-separated list of variable keys to fetch details for',
        }),
        search: Flags.string({
            description: 'Filter variables by search query',
        }),
        page: Flags.integer({
            description: 'Page number to fetch',
        }),
        'per-page': Flags.integer({
            description: 'Number of variables to fetch per page',
        }),
    }
    authRequired = true

    public async run(): Promise<void> {
        const { args, argv, flags } = await this.parse(DetailedVariables)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        const keys = parseKeysFromArgs(args, argv, flags)

        let variables
        if (keys && keys.length > 0) {
            variables = await batchRequests(keys, (key) =>
                fetchVariableByKey(this.authToken, this.projectKey, key),
            )
        } else {
            const query = {
                page: flags['page'],
                perPage: flags['per-page'],
                search: flags['search'],
            }
            variables = await fetchVariables(
                this.authToken,
                this.projectKey,
                query,
            )
        }
        this.writer.showResults(variables)
    }
}
