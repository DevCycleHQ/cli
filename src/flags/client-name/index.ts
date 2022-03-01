import { Flags } from '@oclif/core'
import { ConfigFromFile } from '../../types'

export default Flags.string({
    description: 'Name(s) of the DevCycle client variable to match on. Accepts multiple values.', multiple: true
})

export function getClientNames(flags: Record<string, any>, config: ConfigFromFile | null) {
    const clientNamesFromConfig = config?.codeInsights?.clientNames || []

    return [...clientNamesFromConfig, ...(flags['client-name'] || [])]
}