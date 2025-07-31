import { expect } from '@oclif/test'
import sinon from 'sinon'
import * as assert from 'assert'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { DevCycleMCPServer } from './server'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'
import {
    categorizeError,
    getErrorSuggestions,
    handleToolError,
} from './utils/errorHandling'

describe('DevCycleMCPServer', () => {
    let server: McpServer
    let mcpServer: DevCycleMCPServer
    let authStub: sinon.SinonStubbedInstance<DevCycleAuth>
    let apiClientStub: sinon.SinonStubbedInstance<DevCycleApiClient>

    beforeEach(() => {
        // Mock the MCP Server
        server = {
            registerTool: sinon.stub(),
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
            // Verify that tools were registered (should be many calls to registerTool)
            sinon.assert.called(server.registerTool as sinon.SinonStub)
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

        it('should register multiple tools during initialization', async () => {
            authStub.initialize.resolves()

            await mcpServer.initialize()

            // Should register many tools (37 total across all modules)
            const registerToolStub = server.registerTool as sinon.SinonStub
            expect(registerToolStub.callCount).to.be.greaterThan(30)
        })
    })

    describe('Tool Registration Tests', () => {
        beforeEach(async () => {
            authStub.initialize.resolves()
            await mcpServer.initialize()
        })

        it('should register all expected tools', () => {
            const registerToolStub = server.registerTool as sinon.SinonStub

            // Verify specific tools were registered
            const registeredToolNames = registerToolStub
                .getCalls()
                .map((call) => call.args[0])

            // Check that we have tools from all categories
            expect(registeredToolNames).to.include('list_features')
            expect(registeredToolNames).to.include('list_variables')
            expect(registeredToolNames).to.include('list_environments')
            expect(registeredToolNames).to.include('list_projects')
            expect(registeredToolNames).to.include('create_project')
            expect(registeredToolNames).to.include('list_custom_properties')
            expect(registeredToolNames).to.include(
                'get_self_targeting_identity',
            )
        })

        it('should register tools with proper configurations', () => {
            const registerToolStub = server.registerTool as sinon.SinonStub

            // Check that each tool registration has the required parameters
            registerToolStub.getCalls().forEach((call) => {
                expect(call.args[0]).to.be.a('string') // tool name
                expect(call.args[1]).to.be.an('object') // config
                expect(call.args[1]).to.have.property('description')
                expect(call.args[2]).to.be.a('function') // handler
            })
        })

        it('should register tools with input schemas', () => {
            const registerToolStub = server.registerTool as sinon.SinonStub

            // Find a tool that should have an input schema
            const listProjectsCall = registerToolStub
                .getCalls()
                .find((call) => call.args[0] === 'list_projects')

            expect(listProjectsCall).to.exist
            expect(listProjectsCall!.args[1]).to.have.property('inputSchema')
        })
    })

    describe('Error Handling Tests', () => {
        beforeEach(async () => {
            authStub.initialize.resolves()
            await mcpServer.initialize()
        })

        it('should categorize authentication errors correctly', () => {
            expect(categorizeError('401 Unauthorized')).to.equal(
                'AUTHENTICATION_ERROR',
            )
            expect(categorizeError('unauthorized access')).to.equal(
                'AUTHENTICATION_ERROR',
            )
        })

        it('should categorize permission errors correctly', () => {
            expect(categorizeError('403 Forbidden')).to.equal(
                'PERMISSION_ERROR',
            )
            expect(categorizeError('forbidden access')).to.equal(
                'PERMISSION_ERROR',
            )
        })

        it('should categorize resource not found errors correctly', () => {
            expect(categorizeError('404 Not Found')).to.equal(
                'RESOURCE_NOT_FOUND',
            )
            expect(categorizeError('resource not found')).to.equal(
                'RESOURCE_NOT_FOUND',
            )
        })

        it('should categorize validation errors correctly', () => {
            expect(categorizeError('400 Bad Request')).to.equal(
                'VALIDATION_ERROR',
            )
            expect(categorizeError('bad request format')).to.equal(
                'VALIDATION_ERROR',
            )
        })

        it('should categorize schema validation errors correctly', () => {
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
            expect(categorizeError('ENOTFOUND api.devcycle.com')).to.equal(
                'NETWORK_ERROR',
            )
            expect(categorizeError('network timeout')).to.equal('NETWORK_ERROR')
        })

        it('should categorize project errors correctly', () => {
            expect(
                categorizeError('The project test-key was not found'),
            ).to.equal('PROJECT_ERROR')
            expect(categorizeError('project not found')).to.equal(
                'PROJECT_ERROR',
            )
        })

        it('should provide helpful suggestions for authentication errors', () => {
            const suggestions = getErrorSuggestions('AUTHENTICATION_ERROR')

            expect(suggestions).to.include(
                'Re-authenticate with DevCycle (run "dvc login sso" for CLI for local MCP or re-login through OAuth for remote MCP)',
            )
            expect(suggestions).to.include(
                'Verify your API credentials are correct',
            )
            expect(suggestions).to.include('Check if your token has expired')
        })

        it('should provide helpful suggestions for project errors', () => {
            const suggestions = getErrorSuggestions('PROJECT_ERROR')

            expect(suggestions).to.include(
                'Select a valid project (use "dvc projects select" in CLI or project selection tools in workers)',
            )
            expect(suggestions).to.include('Verify the project key is correct')
            expect(suggestions).to.include(
                'Check if you have access to this project',
            )
        })

        it('should format tool errors with helpful information', async () => {
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
            const result = handleToolError('String error message', 'test_tool')
            const errorResponse = JSON.parse(result.content[0].text)

            expect(errorResponse.error).to.be.true
            expect(errorResponse.message).to.equal('String error message')
            expect(errorResponse.tool).to.equal('test_tool')
        })

        it('should handle object errors', async () => {
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

        it('should register tool handlers that can handle errors', async () => {
            const registerToolStub = server.registerTool as sinon.SinonStub

            // Get a tool handler that was registered
            const toolCall = registerToolStub.getCalls()[0]
            expect(toolCall).to.exist

            const [toolName, config, handler] = toolCall.args
            expect(toolName).to.be.a('string')
            expect(config).to.be.an('object')
            expect(handler).to.be.a('function')

            // The handler should be wrapped with error handling
            // We can't easily test the actual execution without setting up the full API client
            // But we can verify the handler exists and is a function
        })

        it('should register handlers with error wrapping', () => {
            const registerToolStub = server.registerTool as sinon.SinonStub

            // Verify that all registered handlers are wrapped functions
            registerToolStub.getCalls().forEach((call) => {
                const handler = call.args[2]
                expect(handler).to.be.a('function')
                // The handler should be async since it's wrapped with error handling
                expect(handler.constructor.name).to.equal('AsyncFunction')
            })
        })
    })
})
