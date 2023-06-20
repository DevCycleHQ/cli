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
    choices?: unknown[]
}

export type AutoCompletePrompt = Prompt & {
  source: (input: Record<string, unknown>, search: string) => Promise<Record<string, unknown>[]>
}
