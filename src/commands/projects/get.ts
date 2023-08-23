import { fetchProjects } from '../../api/projects'
import Base from '../base'

export default class DetailedProjects extends Base {
    static description = 'Retrieve all projects in the current Organization'
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const projects = await fetchProjects(this.authToken)
        return this.writer.showResults(projects.map((
            { _id, _organization, key, name, description, updatedAt, createdAt }
        ) => ({
            _id, _organization, key, name, description, updatedAt, createdAt
        })))
    }
}
