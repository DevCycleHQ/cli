import { fetchVariables } from '../../api/variables'
import Base from '../base'

export default class ListVariables extends Base {
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        await this.requireProject()
        const variables = await fetchVariables(this.token, this.projectKey)
        const variableKeys = variables.map((variable) => variable.key)
        this.writer.showResults(variableKeys)
    }
}