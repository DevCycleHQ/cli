import { expect } from '@oclif/test'
import sinon from 'sinon'
import { registerAllToolsWithServer } from './tools'
import { DevCycleMCPServerInstance } from './server'

describe('MCP Schema Validation', () => {
    /**
     * This test ensures that all MCP tool schemas are properly formatted for the MCP protocol.
     * Specifically, it checks that array types have the required 'items' property.
     *
     * Background: The MCP protocol requires that all array types in JSON schemas must have
     * an 'items' property. Using z.array(z.any()) in Zod schemas doesn't generate this
     * property, causing MCP validation errors.
     *
     * Solution: Use z.array(z.unknown()) instead of z.array(z.any()) in zodClient.ts
     */
    describe('Tool Registration Schema Validation', () => {
        // Helper function to recursively check schemas
        function validateSchemaArrays(
            schema: any,
            path: string,
            errors: string[],
        ): void {
            if (!schema || typeof schema !== 'object') return

            // Check if this is an array type without items
            if (schema.type === 'array' && !schema.items) {
                errors.push(
                    `❌ Array at '${path}' is missing required 'items' property.\n` +
                        `   This will cause MCP validation errors.\n` +
                        `   Fix: In zodClient.ts, replace z.array(z.any()) with z.array(z.unknown())`,
                )
            }

            // Recursively check nested schemas
            if (schema.properties) {
                for (const [key, value] of Object.entries(schema.properties)) {
                    validateSchemaArrays(
                        value,
                        `${path}.properties.${key}`,
                        errors,
                    )
                }
            }

            if (schema.items) {
                validateSchemaArrays(schema.items, `${path}.items`, errors)
            }

            // Check schema combiners (anyOf, oneOf, allOf)
            for (const combiner of ['anyOf', 'oneOf', 'allOf']) {
                if (Array.isArray(schema[combiner])) {
                    schema[combiner].forEach((subSchema: any, idx: number) => {
                        validateSchemaArrays(
                            subSchema,
                            `${path}.${combiner}[${idx}]`,
                            errors,
                        )
                    })
                }
            }

            if (
                schema.additionalProperties &&
                typeof schema.additionalProperties === 'object'
            ) {
                validateSchemaArrays(
                    schema.additionalProperties,
                    `${path}.additionalProperties`,
                    errors,
                )
            }
        }

        // Create a mock API client
        const mockApiClient = {
            executeWithLogging: sinon.stub(),
            executeWithDashboardLink: sinon.stub(),
            setSelectedProject: sinon.stub(),
            hasProjectKey: sinon.stub().resolves(true),
            getOrgId: sinon.stub().returns('test-org'),
            getUserId: sinon.stub().returns('test-user'),
            hasProjectAccess: sinon.stub().resolves(true),
            getUserContext: sinon.stub().resolves({}),
        }

        it('should register all tools with valid MCP schemas', () => {
            const registeredTools: Array<{
                name: string
                config: any
            }> = []

            // Create a mock server instance that captures registrations
            const mockServerInstance: DevCycleMCPServerInstance = {
                registerToolWithErrorHandling: (
                    name: string,
                    config: any,
                    handler: any,
                ) => {
                    registeredTools.push({ name, config })
                },
            }

            // Register all tools
            registerAllToolsWithServer(mockServerInstance, mockApiClient as any)

            // Validate that tools were registered
            expect(registeredTools.length).to.be.greaterThan(0)
            console.log(
                `\n📊 Validating ${registeredTools.length} registered MCP tools...\n`,
            )

            // Track validation results
            const validationErrors: string[] = []

            // Validate each registered tool's schema
            registeredTools.forEach(({ name, config }) => {
                const errors: string[] = []

                // Check if inputSchema exists (it should for all tools)
                if (config.inputSchema) {
                    validateSchemaArrays(
                        config.inputSchema,
                        `${name}.inputSchema`,
                        errors,
                    )
                }

                // Also check outputSchema if it exists
                if (config.outputSchema) {
                    validateSchemaArrays(
                        config.outputSchema,
                        `${name}.outputSchema`,
                        errors,
                    )
                }

                if (errors.length > 0) {
                    validationErrors.push(
                        `\n❌ Tool: ${name}`,
                        ...errors.map((e) => `   ${e}`),
                    )
                }
            })

            // Report results
            if (validationErrors.length > 0) {
                const errorMessage = [
                    `\n🚨 MCP Schema Validation Failed\n`,
                    `Found ${validationErrors.length} tools with invalid schemas:`,
                    ...validationErrors,
                    `\n📝 How to fix:`,
                    `1. Open src/api/zodClient.ts`,
                    `2. Search for 'z.array(z.any())'`,
                    `3. Replace with 'z.array(z.unknown())'`,
                    `4. Also check for 'z.record(z.any())' and replace with 'z.record(z.unknown())'`,
                    `\nThis ensures proper JSON schema generation for MCP compatibility.`,
                ].join('\n')

                expect.fail(errorMessage)
            } else {
                console.log(
                    `✅ All ${registeredTools.length} tools have valid MCP schemas!`,
                )
            }
        })

        it('should validate each registered tool has required properties', () => {
            const registeredTools: Array<{
                name: string
                config: any
            }> = []

            // Create a mock server instance that captures registrations
            const mockServerInstance: DevCycleMCPServerInstance = {
                registerToolWithErrorHandling: (
                    name: string,
                    config: any,
                    handler: any,
                ) => {
                    registeredTools.push({ name, config })
                },
            }

            // Register all tools
            registerAllToolsWithServer(mockServerInstance, mockApiClient as any)

            // Validate each tool
            registeredTools.forEach(({ name, config }) => {
                // Every tool should have a description
                expect(config).to.have.property('description')
                expect(config.description).to.be.a('string')
                expect(config.description.length).to.be.greaterThan(0)

                // Every tool should have inputSchema (even if empty)
                expect(config).to.have.property('inputSchema')

                // If inputSchema is an object with properties, it should be a valid JSON schema
                if (
                    config.inputSchema &&
                    typeof config.inputSchema === 'object' &&
                    config.inputSchema.properties
                ) {
                    expect(config.inputSchema).to.have.property('type')
                    expect(config.inputSchema.type).to.equal('object')
                }
            })
        })
    })
})
