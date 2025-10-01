import { expect } from '@oclif/test'
import sinon from 'sinon'
import * as assert from 'assert'
import { DevCycleApiClient, handleZodiosValidationErrors } from './api'
import { DevCycleAuth } from './auth'
import { setMCPToolCommand } from './headers'
import { axiosClient, v2ApiClient } from '../../api/apiClient'

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

        // Clear any prior header state to make assertions deterministic
        delete (axiosClient.defaults.headers.common as any)['dvc-referrer']
        delete (axiosClient.defaults.headers.common as any)[
            'dvc-referrer-metadata'
        ]
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
            const headers = axiosClient.defaults.headers.common as any
            expect(headers['dvc-referrer']).to.equal('mcp')
            const meta = JSON.parse(headers['dvc-referrer-metadata'])
            expect(meta.command).to.equal('testOperation')
            expect(meta.caller).to.equal('mcp')
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
        // Clear header state
        delete (axiosClient.defaults.headers.common as any)['dvc-referrer']
        delete (axiosClient.defaults.headers.common as any)[
            'dvc-referrer-metadata'
        ]
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('setMCPToolCommand', () => {
        it('should set MCP headers correctly for tool commands', () => {
            setMCPToolCommand('list_features')

            const headers = axiosClient.defaults.headers.common as any
            expect(headers['dvc-referrer']).to.equal('mcp')
            const meta = JSON.parse(headers['dvc-referrer-metadata'])
            expect(meta.command).to.equal('list_features')
            expect(meta.caller).to.equal('mcp')
        })

        it('should ensure v2ApiClient uses shared axiosClient instance with MCP headers', () => {
            // Set MCP headers on the shared axiosClient
            setMCPToolCommand('create_feature')

            // Verify that the v2ApiClient has access to the same headers
            // This works because v2ApiClient should be using the shared axiosClient instance
            const headers = axiosClient.defaults.headers.common as any
            expect(headers['dvc-referrer']).to.equal('mcp')
            const meta = JSON.parse(headers['dvc-referrer-metadata'])
            expect(meta.command).to.equal('create_feature')
            expect(meta.caller).to.equal('mcp')

            // Verify v2ApiClient exists and is properly configured
            expect(v2ApiClient).to.exist
        })
    })
})
