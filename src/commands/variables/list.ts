import { fetchVariables } from '../../api/variables'
import Base from '../base'

export default class ListVariables extends Base {
    static hidden = false
    authRequired = true
    public async run(): Promise<void> {
        const { flags } = await this.parse(ListVariables)
        const { headless, project } = flags
        await this.requireProject(project, headless)
        const variables = await fetchVariables(this.authToken, this.projectKey)
        const variableKeys = variables.map((variable) => variable.key)
        this.writer.showResults(variableKeys)
    }
}
