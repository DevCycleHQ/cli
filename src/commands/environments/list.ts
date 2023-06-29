import { fetchEnvironments } from '../../api/environments'
import Base from '../base'

export default class ListEnvironments extends Base {
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        await this.requireProject()
        const environments = await fetchEnvironments(this.authToken, this.projectKey)
        const environmentKeys = environments.map((environment) => environment.key)
        this.writer.showResults(environmentKeys)
    }
}
