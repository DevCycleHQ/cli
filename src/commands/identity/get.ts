import Base from '../base'
import { fetchUserProfile } from '../../api/userProfile'

export default class DetailedIdentity extends Base {
    static hidden = false
    authRequired = true
    static description = 'Print your DevCycle Identity.'

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedIdentity)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        const identity = await fetchUserProfile(this.authToken, this.projectKey)
        const dvcUserId = identity.dvcUserId ?? '<not set>'

        this.writer.showRawResults(`Current DevCycle Project: ${this.projectKey}`)
        this.writer.showRawResults(`SDK Associated User ID: ${dvcUserId}`)
        if (this.hasToken()) {
            const tokenJson = JSON.parse(Buffer.from(this.authToken.split('.')[1], 'base64').toString())
            const email = tokenJson['https://devcycle.com/email']
            this.writer.showRawResults(`Email: ${email}`)
        }
        if (!identity.dvcUserId) {
            this.writer.infoMessageWithCommand('To set up your SDK Associated User ID, use', 'dvc identity update')
        }
    }
}
