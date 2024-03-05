import { Flags } from '@oclif/core'
import { fetchVariables } from '../../api/variables'
import Base from '../base'

export default class ListVariables extends Base {
    static aliases: string[] = ['variables:ls']
    static hidden = false
    static flags = {
        ...Base.flags,
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
        const { flags } = await this.parse(ListVariables)
        const { headless, project } = flags
        await this.requireProject(project, headless)

        const query = {
            page: flags['page'],
            perPage: flags['per-page'],
            search: flags['search'],
        }
        const variables = await fetchVariables(
            this.authToken,
            this.projectKey,
            query,
        )
        const variableKeys = variables.map((variable) => variable.key)
        this.writer.showResults(variableKeys)
    }
}
