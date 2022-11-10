import 'reflect-metadata'

import SSOAuth from '../../api/ssoAuth'
import AuthCommand from '../authCommand'

export default class LoginSSO extends AuthCommand {
    static hidden = false
    static description = 'Log in through the DevCycle Universal Login. This will open a browser window.'
    static examples = []

    public async run(): Promise<void> {
        const ssoAuth = new SSOAuth(this.writer)
        const accessToken = await ssoAuth.getAccessToken()
        this.token = accessToken
        this.dvcConfig.updateAuthConfig({
            sso: { accessToken }
        })

        await this.setOrganization()
    }
}