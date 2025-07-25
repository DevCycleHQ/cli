import { expect } from '@oclif/test'
import { MCPToolRegistry } from './registry'
import { IDevCycleApiClient } from '../api/interface'
import { registerProjectTools } from './projectTools'

// Mock API client for testing
class MockApiClient implements IDevCycleApiClient {
    async executeWithLogging<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        requiresProject = true,
    ): Promise<T> {
        // Mock implementation - just return a test result
        return operation('test-token', 'test-project') as Promise<T>
    }

    async executeWithDashboardLink<T>(
        operationName: string,
        args: any,
        operation: (authToken: string, projectKey: string) => Promise<T>,
        dashboardLink: (orgId: string, projectKey: string, result: T) => string,
    ): Promise<{ result: T; dashboardLink: string }> {
        // Mock implementation
        const result = await operation('test-token', 'test-project')
        const link = dashboardLink('test-org', 'test-project', result)
        return { result, dashboardLink: link }
    }
}

describe('MCPToolRegistry', () => {
    let registry: MCPToolRegistry
    let mockApiClient: IDevCycleApiClient

    beforeEach(() => {
        registry = new MCPToolRegistry()
        mockApiClient = new MockApiClient()
    })

    it('should register tools successfully', () => {
        expect(registry.size()).to.equal(0)

        registerProjectTools(registry)

        expect(registry.size()).to.equal(4)
        expect(registry.has('list_projects')).to.be.true
        expect(registry.has('get_current_project')).to.be.true
        expect(registry.has('create_project')).to.be.true
        expect(registry.has('update_project')).to.be.true
    })

    it('should retrieve all registered tools', () => {
        registerProjectTools(registry)

        const tools = registry.getAll()
        expect(tools).to.have.lengthOf(4)

        const toolNames = tools.map((tool) => tool.name)
        expect(toolNames).to.include('list_projects')
        expect(toolNames).to.include('get_current_project')
        expect(toolNames).to.include('create_project')
        expect(toolNames).to.include('update_project')
    })

    it('should get specific tools by name', () => {
        registerProjectTools(registry)

        const listTool = registry.get('list_projects')
        expect(listTool).to.not.be.undefined
        expect(listTool?.name).to.equal('list_projects')
        expect(listTool?.description).to.contain('List all projects')

        const nonExistentTool = registry.get('non_existent_tool')
        expect(nonExistentTool).to.be.undefined
    })

    it('should get tool names', () => {
        registerProjectTools(registry)

        const toolNames = registry.getToolNames()
        expect(toolNames).to.have.lengthOf(4)
        expect(toolNames).to.include.members([
            'list_projects',
            'get_current_project',
            'create_project',
            'update_project',
        ])
    })

    it('should prevent duplicate tool registration', () => {
        const testTool = {
            name: 'test_tool',
            description: 'Test tool',
            inputSchema: { type: 'object', properties: {} },
            handler: async () => ({ success: true }),
        }

        registry.register(testTool)
        expect(registry.has('test_tool')).to.be.true

        // Attempting to register the same tool again should throw
        expect(() => registry.register(testTool)).to.throw(
            "Tool 'test_tool' is already registered",
        )
    })

    it('should clear all tools', () => {
        registerProjectTools(registry)
        expect(registry.size()).to.equal(4)

        registry.clear()
        expect(registry.size()).to.equal(0)
        expect(registry.has('list_projects')).to.be.false
    })

    it('should throw error when executing non-existent tool', async () => {
        try {
            await registry.execute('non_existent_tool', {}, mockApiClient)
            expect.fail('Expected execute to throw')
        } catch (error) {
            expect((error as Error).message).to.equal(
                'Unknown tool: non_existent_tool',
            )
        }
    })
})
