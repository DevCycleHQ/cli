import { ListOption } from './listPrompts/listOptionsPrompt'

export type PromptResult = {
    token: string
    projectKey: string
    featureKey?: string
}

export type Prompt = {
    name: string
    message: string
    type: string
    suffix?: string
    default?: unknown
    filter?: (input: string) => string | number
    validate?: (input: string) => boolean | string
    transformer?: (
        value: string,
        answers: any,
        { isFinal }: { isFinal: boolean },
    ) => string
    choices?: unknown[] | ((...args: any[]) => unknown[])
    transformResponse?: (response: any) => any
    listOptionsPrompt?: (
        previousResponses?: Record<string, any>,
    ) => Promise<any>
}

export type ListPrompt = Prompt & {
    type: 'listOptions'
    listOptionsPrompt: (previousResponses?: Record<string, any>) => Promise<any>
    previousReponseFields?: string[]
    // Checks if prompt modified other properties. Returns a map of property names to values
    checkForAdditionalProperties?: () => Record<string, any>
}

export type AutoCompletePrompt = Prompt & {
    source: (
        input: Record<string, unknown>,
        search: string,
    ) => Promise<Record<string, unknown>[]>
}
