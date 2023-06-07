import { fetchProjects, Project } from '../../api/projects'
import { promptForProject } from '../../ui/promptForProject'
import AuthCommand from '../authCommand'
export default class SelectProject extends AuthCommand {
    static description = 'Select which project to access through the API'
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        await this.switchProject()
    }

    public async switchProject(): Promise<void> {
        const { flags } = await this.parse(AuthCommand)
        if (flags.org) {
            await this.setOrganization()
        }
        const projects = await fetchProjects(this.authToken)
        if (flags.headless && !flags.project) {
            return this.writer.showResults(projects.map((project) => project.key))
        }
        const selectedProject = await this.getSelectedProject(projects)
        await this.saveProject(selectedProject)
    }

    private async getSelectedProject(projects: Project[]) {
        const { flags } = await this.parse(AuthCommand)
        if (flags.project) {
            return this.projectFromFlag(projects)
        } else {
            return await promptForProject(projects)
        }
    }
}