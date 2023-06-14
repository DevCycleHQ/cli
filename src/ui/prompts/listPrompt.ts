import inquirer from 'inquirer'

const AddItemPrompt = (itemType: string) => ({
    name: `Add ${itemType}`,
    value: 'add'
})

// TODO: should this be renamed to remove?
const DeleteItemPrompt = (itemType: string) => ({
    name: `Delete ${itemType}`,
    value: 'delete'
})

const ReorderItemPrompt = (itemType: string) => ({
    name: `Reorder ${itemType}`,
    value: 'reorder'
})

const ContinuePrompt = {
    name: 'Continue',
    value: 'continue'
}

const ExitPrompt = {
    name: 'Exit',
    value: 'exit'
}

const listPromptOptions = (itemType: string) => ([
    AddItemPrompt(itemType),
    DeleteItemPrompt(itemType),
    ReorderItemPrompt(itemType),
    ContinuePrompt,
    ExitPrompt
])

export async function promptListOptions<T>(itemType: string, list: T[]): Promise<T> {
    const responses = await inquirer.prompt([{
        name: 'listPromptOption',
        message: 'What would you like to do?',
        type: 'list',
        choices: listPromptOptions(itemType)
    }])
    return responses
}