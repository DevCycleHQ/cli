import Base from './base'
import { Prompt, handleCustomPrompts } from '../ui/prompts'
import { chooseFields } from '../utils/prompts'

export default abstract class UpdateCommand extends Base {
    authRequired = true

    protected async populateParametersWithInquirer(prompts: Prompt[]) {
        if (!prompts.length) return {}
        let filteredPrompts = [...prompts]
        const whichFields = await chooseFields(
            prompts,
            this.authToken,
            this.projectKey,
        )
        filteredPrompts = prompts.filter((prompt) =>
            whichFields.includes(prompt.name),
        )
        return handleCustomPrompts(
            filteredPrompts,
            this.authToken,
            this.projectKey,
        )
    }
}
