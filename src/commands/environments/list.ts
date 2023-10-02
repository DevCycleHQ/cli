import { fetchEnvironments } from '../../api/environments'
import Base from '../base'

export default class ListEnvironments extends Base {
    static aliases: string[] = ['environments:ls']
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(ListEnvironments)
        const { project, headless } = flags
        await this.requireProject(project, headless)
        const environments = await fetchEnvironments(this.authToken, this.projectKey)
        const environmentKeys = environments.map((environment) => environment.key)
        this.writer.showResults(environmentKeys)
    }
}
