import Base from '../base'

export default class Logout extends Base {
    static hidden = false
    static description = 'Discards any auth configuration that has been stored in the auth configuration file.'
    static examples = []

    public async run(): Promise<void> {
        this.dvcConfig.deleteAuth()
        this.writer.showTogglebotSleep()
    }
}