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
        if (organizations.length === 0) {
            console.error('You are not a member of any organizations')
            return
        }
        const selected = await promptForOrganization(organizations)
        const token = await this.selectOrganization(selected)

        const projects = await fetchProjects(token)
        const selectedProject = await promptForProject(projects)
        await this.updateUserConfig({ project:selectedProject.key })
    }

    private async selectOrganization(organization:Organization) {
        const ssoAuth = new SSOAuth()
        const token = await ssoAuth.getAccessToken(organization)
        storeAccessToken(token, this.authPath)
        return token
    }
}