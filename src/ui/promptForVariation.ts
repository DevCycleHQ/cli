import inquirer from 'inquirer'
import { Variation } from '../api/Variations'

export async function promptForVariation(
    variations: Variation[],
): Promise<string> {
    const variationOptions = variations.map((variation) => {
        return {
            name: variation.name,
            value: variation._id,
        }
    })
    const responses = await inquirer.prompt([
        {
            name: 'Variation',
            message: 'Which Variation do you want to use?',
            type: 'list',
            choices: variationOptions,
        },
    ])
    return responses.Variation
}
