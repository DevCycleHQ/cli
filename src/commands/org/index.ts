import {
    Organization,
    fetchOrganizations
} from '../../api/organizations'
import Base from '../base'
import { storeAccessToken } from '../../auth/config'
import SSOAuth from '../../api/ssoAuth'
import { promptForOrganization } from '../../ui/promptForOrganization'
import { fetchProjects } from '../../api/projects'
import { promptForProject } from '../../ui/promptForProject'
export default class SelectOrganization extends Base {
    static description = 'Select which organization to access through the API'
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const organizations = await fetchOrganizations(this.token)
        const selected = await promptForOrganization(organizations)
        const token = await this.selectOrganization(selected)

        const projects = await fetchProjects(token)
        const selectedProject = await promptForProject(projects)
        await this.updateConfig({ project:selectedProject.key })
    }

    private async selectOrganization(organization:Organization) {
        const { flags } = await this.parse(SelectOrganization)
        const ssoAuth = new SSOAuth()
        const token = await ssoAuth.getAccessToken(organization)
        storeAccessToken(token, flags['auth-path'])
        return token
    }
}