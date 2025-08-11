import { expect } from 'chai'
import * as chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { setCurrentTestFile } from '../../../test-utils'
import sinon from 'sinon'
import { z } from 'zod'
import { processToolConfig, toJsonSchema } from './schema'
import { DevCycleMCPServer } from '../server'

function expectHasObjectSchema(json: any, defName?: string) {
    if (json && json.type === 'object') {
        expect(json).to.have.property('properties')
        return
    }
    expect(json).to.have.property('$ref')
    expect(json).to.have.property('definitions')
    const name = defName || ((json.$ref as string).split('/').pop() as string)
    expect(json.definitions).to.have.property(name)
    const def = json.definitions[name]
    expect(def).to.have.property('type', 'object')
    expect(def).to.have.property('properties')
}

describe('schema conversion', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())
    it('toJsonSchema converts a Zod object schema', () => {
        const Sample = z
            .object({
                name: z.string().describe('n'),
                page: z.number().min(1).default(1).describe('p'),
            })
            .describe('root')
        const json = toJsonSchema(Sample, 'Sample') as any
        expect(json).to.be.an('object')
        expectHasObjectSchema(json, 'Sample')
        expect(JSON.stringify(json, null, 2)).toMatchSnapshot()
    })

    it('processToolConfig converts a Zod shape object', () => {
        const Sample = z.object({ key: z.string().describe('k') })
        const config = processToolConfig('shape_test', {
            description: 'd',
            inputSchema: Sample.shape,
        }) as any
        expect(config).to.have.property('inputSchema')
        expectHasObjectSchema(config.inputSchema)
        expect(JSON.stringify(config.inputSchema, null, 2)).toMatchSnapshot()
    })

    it('registerToolWithErrorHandling uses JSON Schema input', () => {
        const server = { registerTool: sinon.stub() } as any
        const mcp = new DevCycleMCPServer(server)
        const Args = z.object({ feature: z.string() })
        mcp.registerToolWithErrorHandling(
            'tool_a',
            {
                description: 'd',
                inputSchema: Args.shape,
            },
            async () => ({}),
        )

        const call = (server.registerTool as sinon.SinonStub).getCall(0)
        expect(call).to.exist
        const cfg = call.args[1]
        expect(cfg).to.have.property('inputSchema')
        expectHasObjectSchema(cfg.inputSchema)
        expect(JSON.stringify(cfg.inputSchema, null, 2)).toMatchSnapshot()
    })
})
