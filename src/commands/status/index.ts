import Base from '../base'

export default class ShowStatus extends Base {
    static hidden = false
    static description =
        'Print CLI version information, configuration file locations and auth status.'

    async run(): Promise<void> {
        const { flags } = await this.parse(ShowStatus)
        if (flags.headless) {
            return this.runHeadless()
        }
        if (this.hasToken()) {
            this.writer.showTogglebot()
        } else {
            this.writer.showTogglebotSleep()
        }

        this.writer.statusMessage(`Devcycle CLI Version ${this.config.version}`)

        this.writer.statusMessage(`Repo config path ${this.repoConfigPath}`)
        if (this.repoConfig) {
            this.writer.successMessage('Repo config loaded')
        } else {
            this.writer.failureMessage('No repo config loaded.')
        }

        this.writer.statusMessage(`User config path ${this.configPath}`)
        if (this.userConfig) {
            this.writer.successMessage('User config loaded')
        } else {
            this.writer.failureMessage('No user config loaded.')
        }

        this.writer.statusMessage(`Auth config path ${this.authPath}`)

        const loggedInOrg = this.repoConfig?.org || this.userConfig?.org
        if (this.hasToken()) {
            if (loggedInOrg) {
                this.writer.successMessage(
                    `Currently logged in to DevCycle as a member of ${loggedInOrg.display_name}`,
                )
            } else {
                this.writer.successMessage('Currently logged in to DevCycle')
            }
        } else {
            this.writer.failureMessage('Currently not logged in to DevCycle')
        }
    }

    async runHeadless(): Promise<void> {
        const loggedInOrg = this.repoConfig?.org || this.userConfig?.org
        this.writer.showResults({
            version: this.config.version,
            repoConfigPath: this.repoConfigPath,
            repoConfigExists: !!this.repoConfig,
            userConfigPath: this.configPath,
            userConfigExists: !!this.userConfig,
            authConfigPath: this.authPath,
            hasAccessToken: this.hasToken(),
            organization: loggedInOrg?.name,
        })
    }
}
