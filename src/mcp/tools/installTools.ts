import { z } from 'zod'
import type { DevCycleMCPServerInstance } from '../server'
import { INSTALL_GUIDES } from './installGuides.generated'
import { fetchAiPromptsAndRules } from '../utils/github'

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
    return await fetchAiPromptsAndRules(
        repoPath,
        `Install guide "${fileName}" not found in install-prompts/. Check the filename (with or without .md).`,
    )
}

export function registerInstallTools(
    serverInstance: DevCycleMCPServerInstance,
): void {
    serverInstance.registerToolWithErrorHandling(
        'install_devcycle_sdk',
        {
            description: [
                'Fetch DevCycle SDK installation instructions, and follow the instructions to install the DevCycle SDK.',
                'Also includes documentation and examples for using DevCycle SDK in your application.',
                "Choose the guide that matches the application's language/framework.",
            ].join('\n'),
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
