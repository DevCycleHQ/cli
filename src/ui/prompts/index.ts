export * from './commonPrompts'
export * from './variablePrompts'
export * from './featurePrompts'
export * from './environmentPrompts'

export type PromptResult = {
    token: string,
    projectKey: string
}