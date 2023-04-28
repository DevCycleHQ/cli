import inquirer from 'inquirer'
import { Feature } from '../api/features'
import { featurePrompt } from './prompts'

export async function promptForFeature(): Promise<Feature> {
    const responses = await inquirer.prompt([featurePrompt])
    return responses.feature
}
