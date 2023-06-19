import { fetchVariables } from '../../api/variables'
import {
    variableValueBooleanPrompt,
    variableValueJSONPrompt,
    variableValueNumberPrompt,
    variableValueStringPrompt
} from '../../ui/prompts'
import inquirer, { ListQuestion, Question } from 'inquirer'

