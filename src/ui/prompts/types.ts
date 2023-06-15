export type PromptResult = {
  token: string,
  projectKey: string
}

export type Prompt = {
    name: string
    message: string
    type: string
    choices?: () => Promise<Record<string, string>[]>
}
