import axios from 'axios'

export async function fetchAiPromptsAndRules(
    relativePath: string,
    notFoundMessage?: string,
): Promise<string> {
    const trimmedPath = relativePath.trim().replace(/^\/+|\/+$/g, '')
    const sourceUrl = `https://raw.githubusercontent.com/DevCycleHQ/AI-Prompts-And-Rules/main/${trimmedPath}`

    try {
        const response = await axios.get<string>(sourceUrl, {
            responseType: 'text',
        })
        return response.data as string
    } catch (error: unknown) {
        const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined
        if (status === 404) {
            throw new Error(
                notFoundMessage ||
                    `Resource not found in AI-Prompts-And-Rules: "${trimmedPath}"`,
            )
        }
        throw new Error('Unable to fetch resource from GitHub. Please retry.')
    }
}
