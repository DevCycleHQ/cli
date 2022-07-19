import { fetchProjects } from '../../api/projects'
import Base from '../base'

export default class ListProjects extends Base {
    static description = 'List the keys of all projects in the current Organization'
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const projects = await fetchProjects(this.token)
        return this.writer.showResults(projects.map((project) => project.key))
    }
}