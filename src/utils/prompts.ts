import { Prompt } from '../ui/prompts'
import inquirer from '../ui/autocomplete'

// Filter out prompts that already have values provided by flags
export function filterPrompts(
    prompts: Prompt[],
    flags: Record<string, unknown>,
) {
    let filteredPrompts: Prompt[] = [...prompts]
    Object.keys(flags).forEach((key) => {
        if (flags[key]) {
            filteredPrompts = filteredPrompts.filter(
                (prompt) => prompt.name !== key,
            )
        }
    })
    return filteredPrompts
}

// Merge answers from prompts with values provided by flags
export function mergeFlagsAndAnswers(
    flags: Record<string, unknown>,
    answers: Record<string, unknown>,
) {
    const updatedFlags = { ...flags }
    Object.keys(answers).forEach((key) => {
        if (updatedFlags[key] === undefined) {
            updatedFlags[key] = answers[key]
        }
    })
    return updatedFlags
}

export async function chooseFields(
    prompts: Prompt[],
    authToken?: string,
    projectKey?: string,
): Promise<string[]> {
    if (prompts.length === 0) {
        return []
    }
    const responses = await inquirer.prompt(
        [
            {
                name: 'whichFields',
                type: 'checkbox',
                message: 'Which fields are you updating',
                choices: prompts.map((prompt) => {
                    return {
                        name: prompt.name,
                    }
                }),
            },
        ],
        {
            token: authToken,
            projectKey: projectKey,
        },
    )

    return responses.whichFields
}
