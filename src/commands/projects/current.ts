import { fetchProject } from '../../api/projects'
import Base from '../base'

export default class CurrentProject extends Base {
    static description = 'View currently selected project'
    static hidden = false

    public async run(): Promise<void> {
        const project = await fetchProject(this.authToken, this.projectKey)
        const { key, name, description } = project
        return this.writer.showResults({ key, name, description })
    }
}
