import inquirer from 'inquirer'
import { userIdPrompt } from '../../ui/prompts'

import { Flags } from '@oclif/core'
import UpdateCommand from '../updateCommand'
import { fetchUserProfile, updateUserProfile } from '../../api/userProfile'

export default class UpdateIdentity extends UpdateCommand {
    static hidden = false
    authRequired = true
    static description = 'Update your DevCycle Identity.'

    prompts = [
        userIdPrompt
    ]

    static args = {
        ...UpdateCommand.args
    }

    static flags = {
        userId: Flags.string({
            name: 'userId',
            description: 'DevCycle Identity User ID to be used for Overrides & Self-Targeting'
        }),
        ...UpdateCommand.flags,
    }

    public async run(): Promise<void> {

        const { flags } = await this.parse(UpdateIdentity)
        const { headless, project } = flags
        await this.requireProject(project, headless)

        const { dvcUserId: existingUserId } = await fetchUserProfile(this.authToken, this.projectKey)

        let dvcUserId
        if (existingUserId) {
            const { confirmUpdate } = await inquirer.prompt([{
                name: 'confirmUpdate',
                message: `A User ID (${existingUserId}) is associated with your account for this project (${this.projectKey}). Would you like to update it?`,
                type: 'confirm'
            }])

            if (!confirmUpdate) {
                this.writer.printCurrentValues(this.generateNoChangesMessage(this.projectKey, existingUserId))
                return
            }
        }

        if (!flags.userId) {
            const input = await inquirer.prompt([userIdPrompt])
            dvcUserId = input.userId
        } else {
            dvcUserId = flags.userId
        }

        if (dvcUserId.trim() === '') {
            const { confirmClear } = await inquirer.prompt([{
                name: 'confirmClear',
                message: `Clearing your DevCycle User ID for project: ${this.projectKey} will remove ALL overrides. Are you sure?`,
                type: 'confirm'
            }])
            if (!confirmClear) {
                this.writer.printCurrentValues(this.generateNoChangesMessage(this.projectKey))
                return
            }
        }

        await updateUserProfile(this.authToken, this.projectKey, {
            dvcUserId: dvcUserId
        })

        this.writer.showResults(`Successfully updated the DevCycle User ID for project: ${this.projectKey}`)
    }

    private generateNoChangesMessage(projectKey: string, existingUserId?: string) {
        const baseMessage = `No DevCycle Identity changes made for project: ${projectKey}`
        if (existingUserId) {
            return `${baseMessage} and User ID: ${existingUserId}`
        }
        return baseMessage
    }
}
