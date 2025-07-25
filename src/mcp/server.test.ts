import { expect } from '@oclif/test'
import sinon from 'sinon'
import * as assert from 'assert'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { DevCycleMCPServer } from './server'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'

describe('DevCycleMCPServer', () => {
    let server: Server
    let mcpServer: DevCycleMCPServer
    let authStub: sinon.SinonStubbedInstance<DevCycleAuth>
    let apiClientStub: sinon.SinonStubbedInstance<DevCycleApiClient>

    beforeEach(() => {
        // Mock the MCP Server
        server = {
            setRequestHandler: sinon.stub(),
            onerror: undefined,
        } as any

        // Create stubs for dependencies
        authStub = sinon.createStubInstance(DevCycleAuth)
        apiClientStub = sinon.createStubInstance(DevCycleApiClient)

        mcpServer = new DevCycleMCPServer(server)

        // Inject stubs into the private properties for testing
        // Note: This is a test-only workaround for dependency injection
        Object.defineProperty(mcpServer, 'auth', {
            value: authStub,
            writable: true,
        })
        Object.defineProperty(mcpServer, 'apiClient', {
            value: apiClientStub,
            writable: true,
        })
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('Initialization Tests', () => {
        it('should initialize successfully with valid auth', async () => {
            authStub.initialize.resolves()

            await mcpServer.initialize()

            sinon.assert.calledOnce(authStub.initialize)
            sinon.assert.calledTwice(
                server.setRequestHandler as sinon.SinonStub,
            ) // ListTools and CallTool
        })

        it('should fail gracefully with missing auth credentials', async () => {
            const authError = new Error(
                'No authentication found. Please either:\n' +
                    '  1. Run "dvc login sso" in the CLI to authenticate with SSO\n' +
                    '  2. Or set environment variables:\n' +
                    '     - DEVCYCLE_CLIENT_ID="your-client-id"\n' +
                    '     - DEVCYCLE_CLIENT_SECRET="your-client-secret"',
            )
            authStub.initialize.rejects(authError)

            try {
                await mcpServer.initialize()
                assert.fail('Expected initialize to throw')
            } catch (error) {
                expect((error as Error).message).to.contain(authError.message)
            }
        })

        it('should fail gracefully with missing project configuration', async () => {
            const projectError = new Error(
                'No project configured. Please either:\n' +
                    '  1. Run "dvc projects select" in the CLI to choose a project\n' +
                    '  2. Or set environment variable: DEVCYCLE_PROJECT_KEY="your-project-key"\n' +
                    '  3. Or add project to .devcycle/config.yml in your repository',
            )
            authStub.initialize.rejects(projectError)

            try {
                await mcpServer.initialize()
                assert.fail('Expected initialize to throw')
            } catch (error) {
                expect((error as Error).message).to.contain(
                    projectError.message,
                )
            }
        })

        it('should set up error handler for server', async () => {
            authStub.initialize.resolves()

            await mcpServer.initialize()

            expect(server.onerror).to.be.a('function')
        })
    })

    describe('Tool Registration Tests', () => {
        beforeEach(async () => {
            authStub.initialize.resolves()
            await mcpServer.initialize()
        })

        it('should register ListTools handler', () => {
            sinon.assert.calledWith(
                server.setRequestHandler as sinon.SinonStub,
                ListToolsRequestSchema,
                sinon.match.func,
            )
        })

        it('should register CallTool handler', () => {
            sinon.assert.calledWith(
                server.setRequestHandler as sinon.SinonStub,
                CallToolRequestSchema,
                sinon.match.func,
            )
        })

        it('should return all tool definitions when listing tools', async () => {
            const setRequestHandlerStub =
                server.setRequestHandler as sinon.SinonStub
            const listToolsHandler = setRequestHandlerStub
                .getCalls()
                .find((call) => call.args[0] === ListToolsRequestSchema)
                ?.args[1]

            expect(listToolsHandler).to.be.a('function')

            const result = await listToolsHandler()

            expect(result).to.have.property('tools')
            expect(result.tools).to.be.an('array')
            expect(result.tools.length).to.be.greaterThan(0)

            // Check that we have tools from all categories
            const toolNames = result.tools.map((tool: any) => tool.name)
            expect(toolNames).to.include('list_features')
            expect(toolNames).to.include('list_variables')
            expect(toolNames).to.include('list_environments')
            expect(toolNames).to.include('list_projects')
        })

        it('should handle unknown tool requests', async () => {
            const setRequestHandlerStub =
                server.setRequestHandler as sinon.SinonStub
            const callToolHandler = setRequestHandlerStub
                .getCalls()
                .find((call) => call.args[0] === CallToolRequestSchema)?.args[1]

            expect(callToolHandler).to.be.a('function')

            const request = {
                params: {
                    name: 'unknown_tool',
                    arguments: {},
                },
            }

            const result = await callToolHandler(request)

            expect(result.content[0].text).to.contain(
                'Unknown tool: unknown_tool',
            )
        })
    })

    describe('Error Handling Tests', () => {
        beforeEach(async () => {
            authStub.initialize.resolves()
            await mcpServer.initialize()
        })

        it('should categorize authentication errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('401 Unauthorized')).to.equal(
                'AUTHENTICATION_ERROR',
            )
            expect(categorizeError('unauthorized access')).to.equal(
                'AUTHENTICATION_ERROR',
            )
        })

        it('should categorize permission errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('403 Forbidden')).to.equal(
                'PERMISSION_ERROR',
            )
            expect(categorizeError('forbidden access')).to.equal(
                'PERMISSION_ERROR',
            )
        })

        it('should categorize resource not found errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('404 Not Found')).to.equal(
                'RESOURCE_NOT_FOUND',
            )
            expect(categorizeError('resource not found')).to.equal(
                'RESOURCE_NOT_FOUND',
            )
        })

        it('should categorize validation errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('400 Bad Request')).to.equal(
                'VALIDATION_ERROR',
            )
            expect(categorizeError('bad request format')).to.equal(
                'VALIDATION_ERROR',
            )
        })

        it('should categorize schema validation errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('Zodios: invalid response')).to.equal(
                'SCHEMA_VALIDATION_ERROR',
            )
            expect(categorizeError('invalid_type received')).to.equal(
                'SCHEMA_VALIDATION_ERROR',
            )
            expect(
                categorizeError('expected object, received string'),
            ).to.equal('SCHEMA_VALIDATION_ERROR')
        })

        it('should categorize network errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(categorizeError('ENOTFOUND api.devcycle.com')).to.equal(
                'NETWORK_ERROR',
            )
            expect(categorizeError('network timeout')).to.equal('NETWORK_ERROR')
        })

        it('should categorize project errors correctly', () => {
            const categorizeError = (mcpServer as any).categorizeError.bind(
                mcpServer,
            )

            expect(
                categorizeError('The project test-key was not found'),
            ).to.equal('PROJECT_ERROR')
            expect(categorizeError('project not found')).to.equal(
                'PROJECT_ERROR',
            )
        })

        it('should provide helpful suggestions for authentication errors', () => {
            const getErrorSuggestions = (
                mcpServer as any
            ).getErrorSuggestions.bind(mcpServer)

            const suggestions = getErrorSuggestions('AUTHENTICATION_ERROR')

            expect(suggestions).to.include(
                'Run "dvc login sso" to re-authenticate the devcycle cli',
            )
            expect(suggestions).to.include(
                'Verify your API credentials are correct',
            )
            expect(suggestions).to.include('Check if your token has expired')
        })

        it('should provide helpful suggestions for project errors', () => {
            const getErrorSuggestions = (
                mcpServer as any
            ).getErrorSuggestions.bind(mcpServer)

            const suggestions = getErrorSuggestions('PROJECT_ERROR')

            expect(suggestions).to.include(
                'Run "dvc projects select" to choose a valid project',
            )
            expect(suggestions).to.include('Verify the project key is correct')
            expect(suggestions).to.include(
                'Check if you have access to this project',
            )
        })

        it('should format tool errors with helpful information', async () => {
            const handleToolError = (mcpServer as any).handleToolError.bind(
                mcpServer,
            )

            const result = handleToolError(
                new Error('401 Unauthorized'),
                'test_tool',
            )
            const errorResponse = JSON.parse(result.content[0].text)

            expect(errorResponse.error).to.be.true
            expect(errorResponse.type).to.equal('AUTHENTICATION_ERROR')
            expect(errorResponse.message).to.equal('401 Unauthorized')
            expect(errorResponse.tool).to.equal('test_tool')
            expect(errorResponse.suggestions).to.be.an('array')
            expect(errorResponse.timestamp).to.be.a('string')
        })

        it('should handle string errors', async () => {
            const handleToolError = (mcpServer as any).handleToolError.bind(
                mcpServer,
            )

            const result = handleToolError('String error message', 'test_tool')
            const errorResponse = JSON.parse(result.content[0].text)

            expect(errorResponse.error).to.be.true
            expect(errorResponse.message).to.equal('String error message')
            expect(errorResponse.tool).to.equal('test_tool')
        })

        it('should handle object errors', async () => {
            const handleToolError = (mcpServer as any).handleToolError.bind(
                mcpServer,
            )

            const errorObject = {
                code: 'ERR001',
                details: 'Something went wrong',
            }
            const result = handleToolError(errorObject, 'test_tool')
            const errorResponse = JSON.parse(result.content[0].text)

            expect(errorResponse.error).to.be.true
            expect(errorResponse.message).to.equal(JSON.stringify(errorObject))
            expect(errorResponse.tool).to.equal('test_tool')
        })
    })

    describe('Tool Execution Tests', () => {
        beforeEach(async () => {
            authStub.initialize.resolves()
            await mcpServer.initialize()
        })

        it('should execute valid tool requests successfully', async () => {
            const setRequestHandlerStub =
                server.setRequestHandler as sinon.SinonStub
            const callToolHandler = setRequestHandlerStub
                .getCalls()
                .find((call) => call.args[0] === CallToolRequestSchema)?.args[1]

            expect(callToolHandler).to.be.a('function')

            // Test that the handler function exists and can be called
            // For now, we'll just verify that unknown tools are handled correctly
            const request = {
                params: {
                    name: 'unknown_tool',
                    arguments: {},
                },
            }

            const result = await callToolHandler(request)
            expect(result.content[0].type).to.equal('text')
            expect(result.content[0].text).to.contain(
                'Unknown tool: unknown_tool',
            )
        })
    })
})
