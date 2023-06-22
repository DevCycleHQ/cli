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
    transformer?: (value: string, answers: any, { isFinal }: { isFinal: boolean }) => string
    choices?: unknown[],
    transformResponse?: (response: any) => any
    listOptionsPrompt?: (list?: ListOption<any>[]) => Promise<any>
}

export type ListPrompt = Prompt & {
  type: 'listOptions',
  listOptionsPrompt: (list?: ListOption<any>[]) => Promise<any>
}

export type AutoCompletePrompt = Prompt & {
  source: (input: Record<string, unknown>, search: string) => Promise<Record<string, unknown>[]>
}
