import { expect } from '@oclif/test'
import { IDevCycleApiClient, IAuthContext } from './interface'
import { LocalDevCycleApiClient, LocalAuthContext } from './localApiClient'
import { WorkerDevCycleApiClient, WorkerAuthContext } from './workerApiClient'

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

            // Test that both implementations satisfy the interface
            const workerClient: IDevCycleApiClient =
                new WorkerDevCycleApiClient(mockAuth)
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

            expect(workerClient).to.not.be.undefined
            expect(localClient).to.not.be.undefined
            expect(typeof workerClient.executeWithLogging).to.equal('function')
            expect(typeof workerClient.executeWithDashboardLink).to.equal(
                'function',
            )
            expect(typeof localClient.executeWithLogging).to.equal('function')
            expect(typeof localClient.executeWithDashboardLink).to.equal(
                'function',
            )
        })
    })

    describe('WorkerAuthContext', () => {
        it('should extract authentication from JWT claims', () => {
            const jwtClaims = {
                devcycle_token: 'worker-token',
                org_id: 'worker-org',
                access_token: 'fallback-token',
                organization_id: 'fallback-org',
            }

            const authContext = new WorkerAuthContext(
                jwtClaims,
                'worker-project',
            )

            expect(authContext.getAuthToken()).to.equal('worker-token')
            expect(authContext.getOrgId()).to.equal('worker-org')
            expect(authContext.getProjectKey()).to.equal('worker-project')
            expect(authContext.isAuthenticated()).to.be.true
            expect(authContext.hasProject()).to.be.true
        })

        it('should use fallback fields when primary fields are missing', () => {
            const jwtClaims = {
                access_token: 'fallback-token',
                organization_id: 'fallback-org',
            }

            const authContext = new WorkerAuthContext(jwtClaims, 'test-project')

            expect(authContext.getAuthToken()).to.equal('fallback-token')
            expect(authContext.getOrgId()).to.equal('fallback-org')
        })

        it('should handle missing authentication gracefully', () => {
            const jwtClaims = {}
            const authContext = new WorkerAuthContext(jwtClaims)

            expect(authContext.isAuthenticated()).to.be.false
            expect(authContext.hasProject()).to.be.false

            expect(() => authContext.getAuthToken()).to.throw(
                'No DevCycle token found in JWT claims',
            )
            expect(() => authContext.getOrgId()).to.throw(
                'No organization ID found in JWT claims',
            )
            expect(() => authContext.getProjectKey()).to.throw(
                'No project key configured for Worker context',
            )
        })

        it('should allow setting project key dynamically', () => {
            const jwtClaims = {
                devcycle_token: 'token',
                org_id: 'org',
            }
            const authContext = new WorkerAuthContext(jwtClaims)

            expect(authContext.hasProject()).to.be.false

            authContext.setProjectKey('dynamic-project')

            expect(authContext.hasProject()).to.be.true
            expect(authContext.getProjectKey()).to.equal('dynamic-project')
        })
    })

    describe('WorkerDevCycleApiClient', () => {
        it('should execute operations with Worker-specific authentication', async () => {
            const jwtClaims = {
                devcycle_token: 'worker-token',
                org_id: 'worker-org',
            }
            const authContext = new WorkerAuthContext(
                jwtClaims,
                'worker-project',
            )
            const client = new WorkerDevCycleApiClient(authContext)

            const mockOperation = async (
                authToken: string,
                projectKey: string,
            ) => {
                expect(authToken).to.equal('worker-token')
                expect(projectKey).to.equal('worker-project')
                return { data: 'success' }
            }

            const result = await client.executeWithLogging(
                'testOperation',
                { test: 'args' },
                mockOperation,
            )

            expect(result.data).to.equal('success')
        })

        it('should validate authentication before executing operations', async () => {
            const jwtClaims = {}
            const authContext = new WorkerAuthContext(jwtClaims)
            const client = new WorkerDevCycleApiClient(authContext)

            const mockOperation = async () => ({
                data: 'should not reach here',
            })

            try {
                await client.executeWithLogging(
                    'testOperation',
                    {},
                    mockOperation,
                )
                expect.fail('Should have thrown authentication error')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    'Authentication required for Worker API operations',
                )
            }
        })

        it('should validate project context when required', async () => {
            const jwtClaims = {
                devcycle_token: 'worker-token',
                org_id: 'worker-org',
            }
            const authContext = new WorkerAuthContext(jwtClaims) // No project key
            const client = new WorkerDevCycleApiClient(authContext)

            const mockOperation = async () => ({
                data: 'should not reach here',
            })

            try {
                await client.executeWithLogging(
                    'testOperation',
                    {},
                    mockOperation,
                    true,
                )
                expect.fail('Should have thrown project error')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    'Project context required for this operation',
                )
            }
        })

        it('should generate dashboard links correctly', async () => {
            const jwtClaims = {
                devcycle_token: 'worker-token',
                org_id: 'worker-org',
            }
            const authContext = new WorkerAuthContext(
                jwtClaims,
                'worker-project',
            )
            const client = new WorkerDevCycleApiClient(authContext)

            const mockOperation = async () => ({ featureKey: 'test-feature' })
            const dashboardLink = (
                orgId: string,
                projectKey: string,
                result: any,
            ) =>
                `https://app.devcycle.com/o/${orgId}/p/${projectKey}/features/${result.featureKey}`

            const result = await client.executeWithDashboardLink(
                'createFeature',
                { name: 'Test Feature' },
                mockOperation,
                dashboardLink,
            )

            expect(result.result.featureKey).to.equal('test-feature')
            expect(result.dashboardLink).to.equal(
                'https://app.devcycle.com/o/worker-org/p/worker-project/features/test-feature',
            )
        })
    })
})
