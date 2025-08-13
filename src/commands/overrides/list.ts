import { ux } from '@oclif/core'
import Base from '../base'
import { fetchProjectOverridesForUser } from '../../api/overrides'
import { UserOverride } from '../../api/schemas'
import { orderOverridesForDisplay } from '../../utils/overrides'
import { fetchEnvironments } from '../../api/environments'

export default class DetailedOverrides extends Base {
    static aliases: string[] = ['overrides:ls']
    static hidden = false
    authRequired = true
    static description =
        'View the Overrides associated with your DevCycle Identity in your current project.'
    prompts = []
    static args = {}
    static flags = {
        ...Base.flags,
        ...ux.ux.table.flags(),
    }

    public async run(): Promise<void> {
        const { flags } = await this.parse(DetailedOverrides)
        const { headless, project } = flags
        await this.requireProject(project, headless)

        const environments = await fetchEnvironments(
            this.authToken,
            this.projectKey,
        )
        const overrides = await fetchProjectOverridesForUser(
            this.authToken,
            this.projectKey,
        )
        if (overrides.length === 0) {
            this.writer.infoMessage('No Overrides found for this project.')
            return
        }
        if (headless) {
            this.writer.showResults(overrides)
            return
        }
        const sortedOverrides = orderOverridesForDisplay(
            overrides,
            environments,
        )
        this.tableOutput.printOverrides<UserOverride>(sortedOverrides, {
            ...flags,
        })
    }
}
