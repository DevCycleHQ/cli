import Base from '../base'
import { fetchUserProfile } from '../../api/userProfile'
import { ux } from '@oclif/core'
// import inquirer from 'inquirer'
// import { featurePrompt, FeaturePromptResult } from '../../ui/prompts'

export default class Overrides extends Base {
    static hidden = false
    authRequired = true
    static description = 'View the overrides associated with your DevCycle Identity in your current project.'

    public async run(): Promise<void> {
        const { flags } = await this.parse(Overrides)
        const { project, headless } = flags
        await this.requireProject(project, headless)

        const identity = await fetchUserProfile(this.authToken, this.projectKey)

        // allow for --feature and --environment flag in the command
        // ask question and show dropdown for answer
        // use answer to make the associated api call

        this.writer.showResults(identity)

        // ux.table(identity, {
        //     columns: [
        //         { key: '_id', label: 'ID' },
        //         { key: '_project', label: 'Name' },
        //         { key: 'a0_user', label: 'A0 User' },
        //         { key: 'created_at', label: 'Created At' },
        //         { key: 'updated_at', label: 'Updated At' },
        //     ]
        // })
    }
}


