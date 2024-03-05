import 'reflect-metadata'

import SSOAuth from '../../auth/SSOAuth'
import AuthCommand from '../authCommand'

export default class LoginSSO extends AuthCommand {
    static hidden = false
    static description =
        'Log in through the DevCycle Universal Login. This will open a browser window.'
    static examples = []

    public async run(): Promise<void> {
        const ssoAuth = new SSOAuth(this.writer, this.authPath)
        const tokens = await ssoAuth.getAccessToken()
        this.authToken = tokens.accessToken
        this.personalAccessToken = tokens.personalAccessToken
        await this.setOrganizationAndProject()
    }
}
