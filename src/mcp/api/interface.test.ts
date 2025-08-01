import { expect } from '@oclif/test'
import { IDevCycleApiClient, IAuthContext } from './interface'
import { LocalDevCycleApiClient, LocalAuthContext } from './localApiClient'

// Mock auth context for testing
class MockAuthContext implements IAuthContext {
    constructor(
        private authToken: string = 'test-token',
        private orgId: string = 'test-org',
        private projectKey: string = 'test-project',
        private authenticated: boolean = true,
        private hasProjectFlag: boolean = true,
    ) {}

    getAuthToken(): string {
        return this.authToken
    }

    getOrgId(): string {
        return this.orgId
    }

    getProjectKey(): string {
        return this.projectKey
    }

    isAuthenticated(): boolean {
        return this.authenticated
    }

    hasProject(): boolean {
        return this.hasProjectFlag
    }
}

describe('API Interface Abstraction', () => {
    describe('IDevCycleApiClient Interface Compliance', () => {
        it('should allow different implementations of the same interface', () => {
            const mockAuth = new MockAuthContext()

            // Test that LocalDevCycleApiClient satisfies the interface
            const mockLocal = {
                executeWithLogging: async () => ({ success: true }),
                executeWithDashboardLink: async () => ({
                    result: { success: true },
                    dashboardLink: 'https://app.devcycle.com',
                }),
            } as any
            const localClient: IDevCycleApiClient = new LocalDevCycleApiClient(
                mockLocal,
            )

            expect(localClient).to.not.be.undefined
            expect(typeof localClient.executeWithLogging).to.equal('function')
            expect(typeof localClient.executeWithDashboardLink).to.equal(
                'function',
            )
        })
    })
})
