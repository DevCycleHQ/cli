import inquirer from 'inquirer'

const statusList = ['active', 'inactive', 'archived']
export async function promptForTargetStatus(): Promise<
    'active' | 'inactive' | 'archived'
> {
    const statusOptions = statusList.map((status) => {
        return {
            name: status,
            value: status,
        }
    })
    const responses = await inquirer.prompt([
        {
            name: 'status',
            message: 'What status to set on the targeting rule?',
            type: 'list',
            choices: statusOptions,
        },
    ])
    return responses.status
}
