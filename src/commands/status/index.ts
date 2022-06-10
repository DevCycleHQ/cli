import {
    failureMessage,
    statusMessage,
    successMessage
} from '../../ui/output'
import { togglebot, togglebotSleep } from '../../ui/togglebot'
import Base from '../base'

export default class ShowStatus extends Base {
    static hidden = false
    static description = 'Print CLI version information, configuration file locations and auth status.'

    async run(): Promise<void> {
        if (this.hasToken()) {
            console.log(togglebot)
        } else {
            console.log(togglebotSleep)
        }

        statusMessage(`Devcycle CLI Version ${this.config.version}`)

        statusMessage(`Repo config path ${this.repoConfigPath}`)
        if (this.repoConfig) {
            successMessage('Repo config loaded')
        } else {
            failureMessage('No repo config loaded.')
        }

        statusMessage(`User config path ${this.configPath}`)
        if (this.config) {
            successMessage('User config loaded')
        } else {
            failureMessage('No user config loaded.')
        }

        statusMessage(`Auth config path ${this.authPath}`)

        if (this.hasToken()) {
            successMessage('Currently logged in to DevCycle')
        } else {
            failureMessage('Currently not logged in to DevCycle')
        }
    }
}