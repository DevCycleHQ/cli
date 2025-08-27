import { expect } from '@oclif/test'
import sinon from 'sinon'
import * as assert from 'assert'
import { DevCycleApiClient, handleZodiosValidationErrors } from './api'
import { DevCycleAuth } from './auth'
import { setMCPToolCommand } from './headers'
import * as apiClientModule from '../../api/apiClient'

describe('DevCycleApiClient', () => {
    let apiClient: DevCycleApiClient
    let authStub: sinon.SinonStubbedInstance<DevCycleAuth>
    let setDVCReferrerStub: sinon.SinonStub

    beforeEach(() => {
        // Create stubbed auth instance
        authStub = sinon.createStubInstance(DevCycleAuth)
        authStub.getAuthToken.returns('mock-auth-token')
        authStub.getProjectKey.returns('test-project')
        authStub.getOrgId.returns('test-org-id')

        apiClient = new DevCycleApiClient(authStub)

        // Stub the setDVCReferrer function from apiClient module
        setDVCReferrerStub = sinon.stub(apiClientModule, 'setDVCReferrer')
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('Zodios Error Handling', () => {
        it('should extract data from Zodios validation errors with 200 OK response', async () => {
            const mockResponseData = { id: '123', name: 'Test Feature' }

            // Create a proper mock Zodios error with data property
            class ZodiosValidationError extends Error {
                public data: unknown
                constructor(message: string, data: unknown) {
                    super(message)
                    this.name = 'ZodiosValidationError'
                    this.data = data
                }
            }

            const zodiosError = new ZodiosValidationError(
                'Zodios: Invalid response - status: 200 OK',
                mockResponseData,
            )

            const apiCall = sinon.stub().rejects(zodiosError)

            const result = await handleZodiosValidationErrors(
                apiCall,
                'testOperation',
            )

            expect(result).to.deep.equal(mockResponseData)
        })

        it('should re-throw non-Zodios errors unchanged', async () => {
            const networkError = new Error('Network timeout')
            const apiCall = sinon.stub().rejects(networkError)

            try {
                await handleZodiosValidationErrors(apiCall, 'testOperation')
                assert.fail('Expected function to throw')
            } catch (error) {
                expect(error).to.equal(networkError)
            }
        })
    })

    describe('executeWithLogging', () => {
        it('should execute operation successfully with valid auth and project', async () => {
            const mockResult = { id: '123', name: 'Test Feature' }
            const mockOperation = sinon.stub().resolves(mockResult)

            authStub.requireAuth.returns()
            authStub.requireProject.returns()

            const result = await apiClient.executeWithLogging(
                'testOperation',
                { key: 'test-key' },
                mockOperation,
            )

            expect(result).to.deep.equal(mockResult)
            sinon.assert.calledOnce(authStub.requireAuth)
            sinon.assert.calledOnce(authStub.requireProject)
            sinon.assert.calledWith(
                mockOperation,
                'mock-auth-token',
                'test-project',
            )
            sinon.assert.calledWith(
                setDVCReferrerStub,
                'testOperation',
                sinon.match.string,
                'mcp',
            )
        })

        it('should handle authentication errors gracefully', async () => {
            const authError = new Error('Authentication failed')
            authStub.requireAuth.throws(authError)

            const mockOperation = sinon.stub().resolves({})

            try {
                await apiClient.executeWithLogging(
                    'testOperation',
                    null,
                    mockOperation,
                )
                assert.fail('Expected function to throw')
            } catch (error) {
                expect((error as Error).message).to.equal(
                    'Authentication failed',
                )
                sinon.assert.notCalled(mockOperation)
            }
        })
    })

    describe('executeWithDashboardLink', () => {
        it('should generate dashboard links correctly', async () => {
            const mockResult = { key: 'test-feature', name: 'Test Feature' }
            const mockOperation = sinon.stub().resolves(mockResult)
            const dashboardLinkGenerator = sinon
                .stub()
                .returns(
                    'https://app.devcycle.com/o/test-org-id/p/test-project/features',
                )

            authStub.requireAuth.returns()
            authStub.requireProject.returns()

            const result = await apiClient.executeWithDashboardLink(
                'createFeature',
                { key: 'test-feature' },
                mockOperation,
                dashboardLinkGenerator,
            )

            expect(result).to.deep.equal({
                result: mockResult,
                dashboardLink:
                    'https://app.devcycle.com/o/test-org-id/p/test-project/features',
            })

            sinon.assert.calledWith(
                dashboardLinkGenerator,
                'test-org-id',
                'test-project',
                mockResult,
            )
        })
    })
})

describe('Header Management', () => {
    let setDVCReferrerStub: sinon.SinonStub

    beforeEach(() => {
        setDVCReferrerStub = sinon.stub(apiClientModule, 'setDVCReferrer')
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('setMCPToolCommand', () => {
        it('should set MCP headers correctly for tool commands', () => {
            setMCPToolCommand('list_features')

            sinon.assert.calledWith(
                setDVCReferrerStub,
                'list_features',
                sinon.match.string, // version
                'mcp',
            )
        })
    })
})
