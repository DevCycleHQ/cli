import { plainToClass } from 'class-transformer'
import { GetProjectsParams, fetchProjects } from '../../api/projects'
import GetCommand from '../getCommand'

export default class DetailedProjects extends GetCommand {
    static description = 'Retrieve all projects in the current Organization'
    static hidden = false
    authRequired = true

    static flags = {
        ...GetCommand.flags,
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedProjects)
        const { sortBy, sortOrder } = flags

        const params = plainToClass(GetProjectsParams, { sortBy, sortOrder })

        const projects = await fetchProjects(this.authToken, params)
        return this.writer.showResults(projects.map((
            { _id, _organization, key, name, description, updatedAt, createdAt }
        ) => ({
            _id, _organization, key, name, description, updatedAt, createdAt
        })))
    }
}
