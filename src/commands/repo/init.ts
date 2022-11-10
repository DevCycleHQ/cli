import 'reflect-metadata'

import SSOAuth from '../../api/ssoAuth'
import AuthCommand from '../authCommand'

export default class InitRepo extends AuthCommand {
    static hidden = false
    static description = 'Create the repo configuration file. This will open a browser window.'
    static examples = []

    public async run(): Promise<void> {
        if (this.dvcConfig.isInRepo()) {
            throw (new Error(`Repo configuration already exists at ${this.dvcConfig.repoPath}`))
        }

        this.dvcConfig.updateRepoConfig({})

        const ssoAuth = new SSOAuth(this.writer)
        const accessToken = await ssoAuth.getAccessToken()
        this.token = accessToken
        this.dvcConfig.updateAuthConfig({
            sso: { accessToken }
        })

        await this.setOrganization()
    }
}