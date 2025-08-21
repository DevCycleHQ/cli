import { afterEach, describe, expect, test, vi } from 'vitest'

// Lock Ably import and shape
vi.mock('ably/build/ably-webworker.min', () => {
    const publish = vi.fn()
    const channelsGet = vi.fn(() => ({ publish }))
    const channels = { get: channelsGet }

    class RestPromiseMock {
        public static Promise = vi.fn(() => new RestPromiseMock())
        public channels = channels
    }

    return { default: { Rest: RestPromiseMock } }
})

import Ably from 'ably/build/ably-webworker.min'
import { publishMCPInstallEvent } from './ably'

const getMocks = () => {
    const Rest = (Ably as any).Rest as { Promise: any }
    const instance =
        Rest.Promise.mock.results[Rest.Promise.mock.results.length - 1]?.value
    const channelsGet = instance?.channels.get as ReturnType<typeof vi.fn>
    const publish = channelsGet?.mock.results[0]?.value.publish as ReturnType<
        typeof vi.fn
    >
    return { Rest, instance, channelsGet, publish }
}

afterEach(() => {
    vi.clearAllMocks()
})

describe('publishMCPInstallEvent', () => {
    test('publishes correct channel and payload', async () => {
        const env = { ABLY_API_KEY: 'key-123' }
        const claims = {
            org_id: 'org_abc',
            email: 'u@example.com',
            name: 'User',
        }

        await publishMCPInstallEvent(env, claims as any)

        const { Rest, instance, channelsGet, publish } = getMocks()

        expect(Rest.Promise).toHaveBeenCalledWith({ key: env.ABLY_API_KEY })
        expect(instance).toBeDefined()
        expect(channelsGet).toHaveBeenCalledWith('org_abc-mcp-install')
        expect(publish).toHaveBeenCalledWith('mcp-install', {
            org_id: 'org_abc',
            name: 'User',
            email: 'u@example.com',
        })
    })

    test('throws when ABLY_API_KEY missing', async () => {
        await expect(
            publishMCPInstallEvent({}, {
                org_id: 'o',
                name: 'N',
                email: 'e',
            } as any),
        ).rejects.toThrow('ABLY_API_KEY is required to publish MCP events')
    })

    test('throws when org_id missing', async () => {
        await expect(
            publishMCPInstallEvent({ ABLY_API_KEY: 'k' }, {
                name: 'N',
                email: 'e',
            } as any),
        ).rejects.toThrow('org_id is required in claims to publish MCP events')
    })

    test('logs and rethrows on publish error', async () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        const env = { ABLY_API_KEY: 'key-123' }
        const claims = {
            org_id: 'org_abc',
            email: 'u@example.com',
            name: 'User',
        }

        // Arrange the mock chain to throw on publish
        const Rest = (await import('ably/build/ably-webworker.min')).default
            .Rest as any
        const instance = Rest.Promise()
        const channelsGet = vi.spyOn(instance.channels, 'get')
        channelsGet.mockReturnValue({
            publish: vi.fn(async () => {
                throw new Error('boom')
            }),
        })

        await expect(
            publishMCPInstallEvent(env, claims as any),
        ).rejects.toThrow('boom')
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
    })
})
