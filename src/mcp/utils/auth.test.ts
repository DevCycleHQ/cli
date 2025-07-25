import { expect } from '@oclif/test'
import sinon from 'sinon'
import * as assert from 'assert'
import { DevCycleAuth } from './auth'
import { ApiAuth } from '../../auth/ApiAuth'
import Writer from '../../ui/writer'

describe('DevCycleAuth', () => {
    let devCycleAuth: DevCycleAuth
    let apiAuthStub: sinon.SinonStubbedInstance<ApiAuth>
    let originalEnv: NodeJS.ProcessEnv
    let loadConfigStub: sinon.SinonStub

    beforeEach(() => {
        // Save and clear environment
        originalEnv = { ...process.env }
        delete process.env.DEVCYCLE_CLIENT_ID
        delete process.env.DEVCYCLE_CLIENT_SECRET
        delete process.env.DEVCYCLE_PROJECT_KEY
        delete process.env.DVC_CLIENT_ID
        delete process.env.DVC_CLIENT_SECRET
        delete process.env.DVC_PROJECT_KEY

        // Create stubbed ApiAuth instance
        apiAuthStub = sinon.createStubInstance(ApiAuth)
        apiAuthStub.getToken.resolves('mock-auth-token')

        // Create DevCycleAuth with injected mock
        devCycleAuth = new DevCycleAuth(apiAuthStub)

        // Stub the protected loadConfig method to simulate loading from environment
        loadConfigStub = sinon
            .stub(devCycleAuth as any, 'loadConfig')
            .callsFake(async function (this: DevCycleAuth) {
                // Simulate the environment variable loading logic
                const projectKey =
                    process.env.DEVCYCLE_PROJECT_KEY ||
                    process.env.DVC_PROJECT_KEY ||
                    ''
                ;(this as any)._projectKey = projectKey
                ;(this as any)._orgId = '' // Default empty org ID for tests
            })
    })

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv
        // Sinon automatically restores all stubs
        sinon.restore()
    })

    describe('Token Management', () => {
        it('should load auth from environment variables', async () => {
            // Setup environment variables
            process.env.DEVCYCLE_CLIENT_ID = 'env-client-id'
            process.env.DEVCYCLE_CLIENT_SECRET = 'env-client-secret'
            process.env.DEVCYCLE_PROJECT_KEY = 'env-project-key'

            apiAuthStub.getToken.resolves('mock-token')

            await devCycleAuth.initialize()

            expect(devCycleAuth.getAuthToken()).to.equal('mock-token')
            expect(devCycleAuth.getProjectKey()).to.equal('env-project-key')

            sinon.assert.calledWith(
                apiAuthStub.getToken,
                sinon.match({
                    'client-id': 'env-client-id',
                    'client-secret': 'env-client-secret',
                }),
                sinon.match.string,
            )
        })

        it('should handle missing authentication gracefully', async () => {
            apiAuthStub.getToken.resolves('')

            try {
                await devCycleAuth.initialize()
                assert.fail('Expected initialize to throw')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    'No authentication found',
                )
                expect((error as Error).message).to.contain('dvc login sso')
                expect((error as Error).message).to.contain(
                    'DEVCYCLE_CLIENT_ID',
                )
                expect((error as Error).message).to.contain(
                    'DEVCYCLE_CLIENT_SECRET',
                )
            }
        })

        it('should handle missing project configuration gracefully', async () => {
            process.env.DEVCYCLE_CLIENT_ID = 'valid-client-id'
            process.env.DEVCYCLE_CLIENT_SECRET = 'valid-client-secret'
            // Explicitly ensure no project key is set
            delete process.env.DEVCYCLE_PROJECT_KEY
            delete process.env.DVC_PROJECT_KEY

            apiAuthStub.getToken.resolves('valid-token')

            // Override the loadConfig stub for this test to not set any project configuration
            loadConfigStub.callsFake(async function (this: DevCycleAuth) {
                // Don't set any project key or org ID to simulate missing project config
                ;(this as any)._projectKey = ''
                ;(this as any)._orgId = ''
            })

            try {
                await devCycleAuth.initialize()
                assert.fail('Expected initialize to throw')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    'No project configured',
                )
                expect((error as Error).message).to.contain(
                    'dvc projects select',
                )
                expect((error as Error).message).to.contain(
                    'DEVCYCLE_PROJECT_KEY',
                )
                expect((error as Error).message).to.contain(
                    '.devcycle/config.yml',
                )
            }
        })
    })

    describe('Priority Tests', () => {
        it('should prioritize environment variables over config files', async () => {
            // Setup environment variables
            process.env.DEVCYCLE_PROJECT_KEY = 'env-project-key'
            process.env.DEVCYCLE_CLIENT_ID = 'env-client-id'
            process.env.DEVCYCLE_CLIENT_SECRET = 'env-client-secret'

            apiAuthStub.getToken.resolves('mock-token')

            await devCycleAuth.initialize()

            // Environment variable should take priority
            expect(devCycleAuth.getProjectKey()).to.equal('env-project-key')
        })
    })

    describe('State Management', () => {
        it('should track authentication state correctly', async () => {
            process.env.DEVCYCLE_CLIENT_ID = 'test-client-id'
            process.env.DEVCYCLE_CLIENT_SECRET = 'test-client-secret'
            process.env.DEVCYCLE_PROJECT_KEY = 'test-project-key'

            apiAuthStub.getToken.resolves('test-token')

            expect(devCycleAuth.hasToken()).to.be.false

            await devCycleAuth.initialize()

            expect(devCycleAuth.hasToken()).to.be.true
            expect(devCycleAuth.getAuthToken()).to.equal('test-token')
            expect(devCycleAuth.getProjectKey()).to.equal('test-project-key')
        })

        it('should enforce authentication requirements', () => {
            // Before initialization
            expect(() => devCycleAuth.requireAuth())
                .to.throw()
                .with.property('message')
                .that.contains('Authentication required')
        })

        it('should enforce project requirements', () => {
            // Before initialization
            expect(() => devCycleAuth.requireProject())
                .to.throw()
                .with.property('message')
                .that.contains('Project configuration required')
        })
    })

    describe('Error Wrapping', () => {
        it('should wrap generic errors with helpful context', async () => {
            apiAuthStub.getToken.rejects(new Error('Generic API error'))

            try {
                await devCycleAuth.initialize()
                assert.fail('Expected initialize to throw')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    'Failed to initialize DevCycle authentication',
                )
                expect((error as Error).message).to.contain('Generic API error')
                expect((error as Error).message).to.contain('dvc status')
                expect((error as Error).message).to.contain('dvc login sso')
                expect((error as Error).message).to.contain(
                    'dvc projects select',
                )
            }
        })
    })
})
