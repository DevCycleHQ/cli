import 'reflect-metadata'

import { storeAccessToken } from '../../auth/config'
import SSOAuth from '../../api/ssoAuth'
import AuthCommand from '../authCommand'

export default class Login extends AuthCommand {
    static hidden = false
    static description = 'Log in through the DevCycle Universal Login. This will open a browser window.'
    static examples = []

    public async run(): Promise<void> {
        const ssoAuth = new SSOAuth(this.writer)
        this.token = await ssoAuth.getAccessToken()
        storeAccessToken(this.token, this.authPath)

        await this.setOrganization()
    }
}