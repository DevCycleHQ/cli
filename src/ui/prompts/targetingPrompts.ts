import { Audience } from '../../api/schemas'
import { DataKeyType, filterTypes, userSubTypes } from '../../api/targeting'
import { isRequired } from '../../utils/validators'
import { variationChoices } from './variationPrompts'

export const comparatorChoices = (input: Record<string, any>) => {
    if (input.subType === 'appVersion' || input.subType === 'platformVersion') {
        return ['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']
    } else if (input.subType === 'audienceMatch') {
        return ['=', '!=']
    }
    return [
        '=',
        '!=',
        '>',
        '>=',
        '<',
        '<=',
        'exist',
        '!exist',
        'contain',
        '!contain',
        'startWith',
        '!startWith',
        'endWith',
        '!endWith',
    ]
}

export const targetingStatusPrompt = {
    name: 'status',
    message: 'Status for the environment',
    type: 'list',
    choices: [
        { name: 'enable', value: 'active' },
        { name: 'disable', value: 'inactive' },
    ],
}

export const servePrompt = {
    name: 'serve',
    message: 'Variation to serve',
    type: 'list',
    choices: variationChoices,
}

export const filterTypePrompt = {
    name: 'type',
    message: 'Type for definition',
    type: 'list',
    choices: filterTypes,
}

export const filterSubTypePrompt = {
    name: 'subType',
    message: 'Subtype for definition',
    type: 'list',
    choices: userSubTypes,
}

export const filterComparatorPrompt = {
    name: 'comparator',
    message: 'Comparator for definition',
    type: 'list',
    choices: comparatorChoices,
}

export const filterValuesPrompt = {
    name: 'values',
    message: 'List of comma separated values for definition',
    suffix: ':',
    validate: (input: string) => isRequired('values', input),
    type: 'input',
}

export const filterAudiencesPrompt = {
    name: 'audiences',
    message: 'List of comma separated audience IDs for definition',
    suffix: ':',
    type: 'input',
}

export const reusableAudienceFilterPrompt = (audiences: Audience[]) => ({
    name: 'reusableAudiences',
    message: 'List of reusable audiences',
    type: 'checkbox',
    choices: audiences.map((audience: Audience) => ({
        name: audience.name,
        value: audience,
    })),
})

export const filterDataKeyPrompt = {
    name: 'dataKey',
    message: 'Data key for definition',
    suffix: ':',
    type: 'input',
}

export const filterDataKeyTypePrompt = {
    name: 'dataKeyType',
    message: 'Data key type for definition',
    type: 'list',
    choices: Object.values(DataKeyType),
}
