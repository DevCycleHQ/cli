import { ClassConstructor, plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import inquirer from 'inquirer'
import { reportValidationErrors } from '../utils/reportValidationErrors'
import Base from './base'

type namedObject = {
    name: string
}
export default abstract class UpdateCommand<ResourceType> extends Base {
    prompts: Array<namedObject> = []
    authRequired = true

    public async populateParameters(paramClass: ClassConstructor<ResourceType>): Promise<ResourceType> {
        await this.requireProject()
        const answers = await this.populateParametersWithInquirer()
        const params = plainToClass(paramClass, answers)
        const errors = validateSync(params as Record<string, unknown>, {
            whitelist: true,
            skipMissingProperties: true
        })
        reportValidationErrors(paramClass.name, errors)
        return params
    }

    private async populateParametersWithInquirer() {
        const whichFields = await this.chooseFields()
        const prompts = this.prompts.filter((prompt) => whichFields.includes(prompt.name))

        return inquirer.prompt(prompts, {
            token: this.authToken,
            projectKey: this.projectKey
        })
    }

    private async chooseFields(): Promise<string[]> {
        const responses = await inquirer.prompt([{
            name: 'whichFields',
            type: 'checkbox',
            message: 'Which fields are you updating',
            choices: this.prompts.map((prompt) => {
                return {
                    name: prompt.name
                }
            })
        }], {
            token: this.authToken,
            projectKey: this.projectKey
        })

        return responses.whichFields
    }
}