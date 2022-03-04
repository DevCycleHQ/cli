import inquirer from "inquirer"
import { Feature, fetchFeatures } from "../../api/features"
import { createVariable, CreateVariableParams } from "../../api/variables"
import Base from "../base"

export default class CreateVariable extends Base {
    static hidden = false
    static description = `Create a new Variable for an existing Feature.`
    authRequired = true

    public async run(): Promise<void> {
        await this.requireProject()
        const features: (Feature | null)[] = await fetchFeatures(this.token, this.projectKey)
        const featureOptions = features.map((feature) => {
            console.log({feature})
            return {
                name: feature?.name || feature?.key,
                value: feature?._id
            }
        })
        const responses: CreateVariableParams = await inquirer.prompt([
            {
                name: 'key',
                message: 'Unique ID',
                type: 'input'
            },
            {
                name: 'name',
                message: 'Human readable name',
                type: 'input'
            },
            {
                name: 'description',
                message: 'Description of the variable',
                type: 'input'
            },
            {
                name: 'type',
                message: 'The type of variable',
                type: 'list',
                choices: ['String', 'Boolean', 'Number', 'JSON']
            },
            {
                name: '_feature',
                message: 'The feature to add the variable to',
                type: 'list',
                choices: featureOptions
            }
        ])

        const result = await createVariable(this.token, this.projectKey, responses)
        console.log(JSON.stringify(result, null, 2))
    }
}
