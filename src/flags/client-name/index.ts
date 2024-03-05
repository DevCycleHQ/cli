import { Flags } from '@oclif/core'
import { RepoConfigFromFile } from '../../types'

export default Flags.string({
    description:
        'Name(s) of the DevCycle client variable to match on. Accepts multiple values.',
    multiple: true,
})

export function getClientNames(
    flags: Record<string, any>,
    config: RepoConfigFromFile | null,
): string[] {
    const clientNamesFromConfig = config?.codeInsights?.clientNames || []

    return [...clientNamesFromConfig, ...(flags['client-name'] || [])]
}
