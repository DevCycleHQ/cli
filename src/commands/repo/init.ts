import 'reflect-metadata'

import { storeAccessToken } from '../../auth/config'
import SSOAuth from '../../auth/SSOAuth'
import AuthCommand from '../authCommand'

export default class InitRepo extends AuthCommand {
    static hidden = false
    static description = 'Create the repo configuration file. This will open a browser window.'
    static examples = []

    public async run(): Promise<void> {
        if (this.repoConfig) {
            throw (new Error(`Repo configuration already exists at ${this.repoConfigPath}`))
        }

        this.repoConfig = await this.updateRepoConfig({})

        const ssoAuth = new SSOAuth(this.writer)
        const tokens = await ssoAuth.getAccessToken()
        this.authToken = tokens.accessToken
        storeAccessToken(tokens, this.authPath)

        await this.setOrganizationAndProject()
    }
}