import inquirer from 'inquirer'

import { Flags } from '@oclif/core'
import { deleteAllProjectOverrides } from '../../api/overrides'
import Base from '../base'

export default class DeleteOverrides extends Base {
    static hidden = false
    authRequired = true
    static description = 'Clear Overrides for a given Project.'

    prompts = []

    static args = {}

    static flags = {
        all: Flags.boolean({
            name: 'all',
            description: 'All Overrides for the Project',
            allowNo: false,
        }),
        ...Base.flags,
    }

    public async run(): Promise<void> {

        const { flags } = await this.parse(DeleteOverrides)
        const { headless, project } = flags

        if (!flags.all) {
            this.writer.showError('The \'--all\' flag is required to proceed.')
            return
        }
        await this.requireProject(project, headless)

        const { confirmClear } = await inquirer.prompt([{
            name: 'confirmClear',
            message: `Are you sure you want to clear ALL Overrides for project: ${this.projectKey}?`,
            type: 'confirm'
        }])
        if (!confirmClear) {
            this.writer.showResults(`No Overrides cleared for project: ${this.projectKey}`)
            return
        }

        await deleteAllProjectOverrides(this.authToken, this.projectKey)
        this.writer.showResults(
            `Successfully cleared all overrides for project: ${this.projectKey}`
        )
    }
}
