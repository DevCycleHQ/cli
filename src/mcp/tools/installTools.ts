import axios from 'axios'
import { z } from 'zod'
import type { IDevCycleApiClient } from '../api/interface'
import type { DevCycleMCPServerInstance } from '../server'
import { INSTALL_GUIDES } from './installGuides.generated'

const InstallGuideArgsSchema = z.object({
    guide: z.enum(INSTALL_GUIDES),
})

type InstallGuideArgs = z.infer<typeof InstallGuideArgsSchema>

async function fetchInstallGuideHandler(args: InstallGuideArgs) {
    const trimmedGuide = args.guide.trim().replace(/^\/+|\/+$/g, '')
    const fileName = trimmedGuide.endsWith('.md')
        ? trimmedGuide
        : `${trimmedGuide}.md`
    const repoPath = `install-prompts/${fileName}`
    const sourceUrl = `https://raw.githubusercontent.com/DevCycleHQ/AI-Prompts-And-Rules/main/${repoPath}`

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
                `Install guide "${fileName}" not found in install-prompts/. Check the filename (with or without .md).`,
            )
        }
        throw new Error(
            'Unable to fetch install guide from GitHub. Please retry.',
        )
    }
}

export function registerInstallTools(
    serverInstance: DevCycleMCPServerInstance,
): void {
    serverInstance.registerToolWithErrorHandling(
        'install_devcycle_sdk',
        {
            description:
                'Fetch and return the latest DevCycle install prompt Markdown from the install-prompts repository by guide name. Input: { guide: string }',
            annotations: {
                title: 'Install DevCycle SDK',
                readOnlyHint: true,
            },
            inputSchema: InstallGuideArgsSchema.shape,
        },
        async (args: unknown) => {
            const validatedArgs = InstallGuideArgsSchema.parse(args)
            return await fetchInstallGuideHandler(validatedArgs)
        },
    )
}
