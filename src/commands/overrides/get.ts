import Base from '../base'
import { fetchUserProfile } from '../../api/userProfile'
import { ux } from '@oclif/core'
import { fetchOverrides } from '../../api/overrides'
import inquirer from '../../ui/autocomplete'
import { environmentPrompt, EnvironmentPromptResult, featurePrompt, FeaturePromptResult } from '../../ui/prompts'
import { ListOption, ListOptionsPrompt } from '../../ui/prompts/listPrompts/listOptionsPrompt'

export default class Overrides extends Base {
    static hidden = false
    authRequired = true
    static description = 'View the overrides associated with your DevCycle Identity in your current project.'

    // allow for --feature and --environment flag in the command
    // ask question and show dropdown for answer
    // use answer to make the associated api call

    // questions
    // what's required in headless mode? --feature and --environment flags?
    // why is it not recognizing the --feature flag?
    // how do I write a prompt and save the value?

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Overrides)
        const { feature, environment, headless } = flags // does this actually get the flag values or just check to see if the flag was added?

        // const identity = await fetchUserProfile(this.authToken, this.projectKey)

        // write ALL/FEATURE PROMPT

        // if [USER SELECTS ALL IN THE PROMPT]
        //     const overrides = await fetchOverrides(this.authToken, this.projectKey)
        //     ux.table(overrides, {
        //         createdAt: {minWidth: 7},
        //         updatedAt: {minWidth: 7},
        //         _project: {},
        //         _feature: {},
        //         _environment: {},
        //         _variation: {},
        //         dvcUserId: {},
        //         a0_user: {},
        //     })
        //     return
        // }

        // let featureKey
        // if (feature) { // IF THEY SELECT FEATURE FROM THE ALL/FEATURE PROMPT INSTEAD OF ADDING IT AS A FLAG
        //     const { feature } = await inquirer.prompt<FeaturePromptResult>([featurePrompt], {
        //         token: this.authToken,
        //         projectKey: this.projectKey
        //     })
        //     featureKey = feature.key
        // } else {
        //     featureKey = feature // THEY ADDED THE FEATURE FLAG
        // }
        // this.writer.showResult(featureKey)

        // IF THEY SELECT FEATURE FROM THE PROMPT OR ADDED IT AS A FLAG BUT DIDN'T ADD THE ENVIRONMENT AS A FLAG
        // const { environment } = await inquirer.prompt<EnvironmentPromptResult>([environmentPrompt], {
        //     token: this.authToken,
        //     projectKey: this.projectKey
        // })
        // this.writer.printCurrentValues(environment)


        // WIP IDK HOW TO MAKE THIS TABLE PRINT THINGS OUT
        // const overrides = await fetchOverrides(this.authToken, this.projectKey, featureKey)
        // ux.table(overrides, {
        //     createdAt: {minWidth: 7},
        //     updatedAt: {minWidth: 7},
        //     _project: {},
        //     _feature: {},
        //     _environment: {},
        //     _variation: {},
        //     dvcUserId: {},
        //     a0_user: {},
        // })
    }
}


