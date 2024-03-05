import 'reflect-metadata'

import AuthCommand from '../authCommand'
import chalk from 'chalk'

export default class LoginAgain extends AuthCommand {
    static hidden = false
    static description =
        'Log in through the DevCycle Universal Login, using saved credentials only.' +
        'This will open a browser window.'
    static examples = ['<%= config.bin %> <%= command.id %>']

    public async run(): Promise<void> {
        const organization = await this.retrieveOrganizationFromConfig()
        if (!organization) {
            throw new Error('No saved authorization choices to use')
        }
        this.authToken = await this.selectOrganization(organization)
        if (this.projectKey) {
            this.writer.infoMessage(
                `Using previously selected project with key ${chalk.green(this.projectKey)}`,
            )
        }
    }
}
