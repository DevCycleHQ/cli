import { ListOption } from './listPrompts/listOptionsPrompt'

export type PromptResult = {
  token: string,
  projectKey: string
}

export type Prompt = {
    name: string
    message: string
    type: string
    suffix?: string
    default?: unknown
    filter?: (input:string) => string | number
    validate?: (input: string) => boolean | string
    transformer?: (value: string, answers: any, { isFinal }: { isFinal: boolean }) => string
    choices?: unknown[],
    transformResponse?: (response: any) => any
    listOptionsPrompt?: (previousResponses?: Record<string, any>) => Promise<any>
}

export type ListPrompt = Prompt & {
  type: 'listOptions',
  listOptionsPrompt: (previousResponses?: Record<string, any>) => Promise<any>
  previousReponseFields?: string[]
}

export type AutoCompletePrompt = Prompt & {
  source: (input: Record<string, unknown>, search: string) => Promise<Record<string, unknown>[]>
}
