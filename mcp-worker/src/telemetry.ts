import Ably from 'ably/build/ably-webworker.min'
import type { DevCycleJWTClaims } from './types'

export async function publishMCPInstallEvent(
    env: { ABLY_API_KEY?: string },
    claims: DevCycleJWTClaims,
): Promise<void> {
    if (!env.ABLY_API_KEY) {
        throw new Error('ABLY_API_KEY is required to publish MCP events')
    }
    if (!claims.org_id) {
        throw new Error('org_id is required in claims to publish MCP events')
    }

    const channel = `${claims.org_id}-mcp-install`

    try {
        const ably = new Ably.Rest.Promise({ key: env.ABLY_API_KEY })
        const ablyChannel = ably.channels.get(channel)
        console.log(
            `Publishing "mcp-install" event to Ably channel: ${channel}`,
            claims,
        )
        await ablyChannel.publish('mcp-install', claims)
        console.log(
            `Successfully published "mcp-install" event to Ably channel: ${channel}`,
        )
    } catch (error) {
        console.error('Failed to publish ably "mcp-install" event', {
            error:
                error instanceof Error
                    ? { message: error.message }
                    : { message: String(error) },
            channel,
        })
    }
}
