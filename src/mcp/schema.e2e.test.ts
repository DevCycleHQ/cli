import { expect } from '@oclif/test'
import sinon from 'sinon'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { DevCycleMCPServer } from './server'
import { DevCycleAuth } from './utils/auth'
import { DevCycleApiClient } from './utils/api'

function getRegisteredTool(registerToolStub: sinon.SinonStub, name: string) {
    const call = registerToolStub.getCalls().find((c) => c.args[0] === name)
    expect(call, `Tool ${name} should be registered`).to.exist
    const [, config] = (call as sinon.SinonSpyCall).args
    return config as { inputSchema?: Record<string, unknown> }
}

function assertArraysHaveItems(schema: unknown) {
    const stack: unknown[] = [schema]
    while (stack.length) {
        const node = stack.pop()
        if (!node || typeof node !== 'object') continue
        const obj = node as Record<string, unknown>
        if (obj.type === 'array') {
            expect(obj).to.have.property('items')
        }
        for (const value of Object.values(obj)) stack.push(value)
    }
}

function derefLocalRef(schema: any): any {
    if (!schema || typeof schema !== 'object') return schema
    const ref = (schema as any).$ref
    if (typeof ref === 'string' && ref.startsWith('#/definitions/')) {
        const key = ref.replace('#/definitions/', '')
        if ((schema as any).definitions && (schema as any).definitions[key]) {
            return (schema as any).definitions[key]
        }
    }
    return schema
}

describe('MCP tool schema e2e', () => {
    let server: McpServer
    let mcpServer: DevCycleMCPServer
    let authStub: sinon.SinonStubbedInstance<DevCycleAuth>
    let apiClientStub: sinon.SinonStubbedInstance<DevCycleApiClient>

    beforeEach(async () => {
        server = { registerTool: sinon.stub() } as any
        authStub = sinon.createStubInstance(DevCycleAuth)
        apiClientStub = sinon.createStubInstance(DevCycleApiClient)
        mcpServer = new DevCycleMCPServer(server)
        Object.defineProperty(mcpServer, 'auth', {
            value: authStub,
            writable: true,
        })
        Object.defineProperty(mcpServer, 'apiClient', {
            value: apiClientStub,
            writable: true,
        })
        authStub.initialize.resolves()
        await mcpServer.initialize()
    })

    afterEach(() => sinon.restore())

    it('registers rich JSON Schemas for tools that require inputs', () => {
        const registerToolStub = server.registerTool as sinon.SinonStub

        // list_projects should expose pagination and sorting fields
        const listProjects = getRegisteredTool(
            registerToolStub,
            'list_projects',
        )
        expect(listProjects.inputSchema).to.be.an('object')
        const lpSchema = derefLocalRef(listProjects.inputSchema)
        const lpProps = (lpSchema as any).properties || {}
        expect(Object.keys(lpProps).length).to.be.greaterThan(0)
        expect(lpProps).to.have.property('page')
        expect(lpProps).to.have.property('perPage')

        // list_environments should expose filter/pagination fields
        const listEnvs = getRegisteredTool(
            registerToolStub,
            'list_environments',
        )
        const leSchema = derefLocalRef(listEnvs.inputSchema)
        const leProps = (leSchema as any).properties || {}
        expect(Object.keys(leProps).length).to.be.greaterThan(0)

        // list_features should expose search/sort fields
        const listFeatures = getRegisteredTool(
            registerToolStub,
            'list_features',
        )
        const lfSchema = derefLocalRef(listFeatures.inputSchema)
        const lfProps = (lfSchema as any).properties || {}
        expect(Object.keys(lfProps).length).to.be.greaterThan(0)
        expect(lfProps).to.have.property('search')
    })

    it('ensures all array definitions include items in complex schemas (create_feature)', () => {
        const registerToolStub = server.registerTool as sinon.SinonStub
        const createFeature = getRegisteredTool(
            registerToolStub,
            'create_feature',
        )
        expect(createFeature.inputSchema).to.be.an('object')
        assertArraysHaveItems(createFeature.inputSchema)
    })

    it('allows empty input schema for tools with no parameters', () => {
        const registerToolStub = server.registerTool as sinon.SinonStub
        const getCurrent = getRegisteredTool(
            registerToolStub,
            'get_current_project',
        )
        const props = (getCurrent.inputSchema as any).properties || {}
        expect(Object.keys(props).length).to.equal(0)
    })
})
