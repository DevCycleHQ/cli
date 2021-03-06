import Base from '../base'
import { storeAccessToken } from '../../auth/config'
import SSOAuth from '../../api/ssoAuth'
import { fetchOrganizations, Organization } from '../../api/organizations'
import { promptForOrganization } from '../../ui/promptForOrganization'
import { fetchProjects } from '../../api/projects'
import { promptForProject } from '../../ui/promptForProject'
import { togglebot } from '../../ui/togglebot'
import { successMessage } from '../../ui/output'

export default class Login extends Base {
    static hidden = false
    static description = 'Log in through the DevCycle Universal Login. This will open a browser window'
    static examples = []

    public async run(): Promise<void> {
        const ssoAuth = new SSOAuth()
        let token = await ssoAuth.getAccessToken()
        storeAccessToken(token, this.authPath)

        const organizations = await fetchOrganizations(token)
        if (organizations.length > 0) {
            const selectedOrg = await promptForOrganization(organizations)
            token = await this.selectOrganization(selectedOrg)
        }

        const projects = await fetchProjects(token)
        const selectedProject = await promptForProject(projects)
        await this.updateUserConfig({ project: selectedProject.key })

        console.log('')
        successMessage('Successfully logged in to DevCycle')
        console.log('')
        console.log(togglebot)
    }

    private async selectOrganization(organization: Organization) {
        const ssoAuth = new SSOAuth()
        const token = await ssoAuth.getAccessToken(organization)
        storeAccessToken(token, this.authPath)
        return token
    }
}