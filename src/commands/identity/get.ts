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
        this.writer.infoMessage(`DevCycle Identity for Project: ${this.projectKey}`)
        this.writer.showResults(identity)
    }
}
