import { z, ZodTypeAny, ZodRawShape } from 'zod'
import type { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import { zodToJsonSchema } from 'zod-to-json-schema'

type JsonSchema = Record<string, unknown>

type ToolConfig = {
    description: string
    annotations?: ToolAnnotations
    inputSchema?: unknown
    outputSchema?: unknown
}

const ENABLE_OUTPUT_SCHEMAS = process.env.ENABLE_OUTPUT_SCHEMAS === 'true'

function isZodType(value: unknown): value is ZodTypeAny {
    return !!value && typeof value === 'object' && 'safeParse' in value
}

function maybeWrapShape(schema: unknown): ZodTypeAny | undefined {
    if (!schema || typeof schema !== 'object') return undefined
    // If it's already a Zod type, leave it
    if (isZodType(schema)) return schema as ZodTypeAny
    // Be permissive: treat any plain object as a Zod object shape. This covers
    // passing `SomeSchema.shape` as well as inline shapes.
    try {
        return z.object(schema as ZodRawShape)
    } catch {
        return undefined
    }
}

export function toJsonSchema(
    schema: unknown,
    name?: string,
): JsonSchema | undefined {
    if (!schema) return undefined
    const zodSchema = isZodType(schema) ? schema : maybeWrapShape(schema)
    if (!zodSchema) return undefined

    const json = zodToJsonSchema(
        zodSchema,
        name ? { name } : undefined,
    ) as JsonSchema

    // Normalize the schema for MCP consumers that require `items` on arrays
    // Some generated schemas (e.g., z.array(z.any())) omit `items`. Add a minimal
    // empty schema so tools validate correctly.
    function ensureArrayItems(node: unknown): void {
        if (!node || typeof node !== 'object') return
        const obj = node as Record<string, unknown>
        if (obj.type === 'array' && obj.items === undefined) {
            obj.items = {}
        }
        for (const value of Object.values(obj)) {
            ensureArrayItems(value)
        }
    }
    ensureArrayItems(json)
    return json
}

type ToolRegistrationConfig = Omit<Tool, 'name'>

const defaultObjectSchema: JsonSchema = { type: 'object', properties: {} }

export function processToolConfig(
    name: string,
    config: ToolConfig,
): ToolRegistrationConfig {
    const processed: ToolRegistrationConfig = {
        description: config.description,
        annotations: config.annotations,
        inputSchema: defaultObjectSchema,
    }

    const inputJson = toJsonSchema(config.inputSchema, `${name}_input`)
    if (inputJson) processed.inputSchema = inputJson

    if (ENABLE_OUTPUT_SCHEMAS) {
        const outputJson = toJsonSchema(config.outputSchema, `${name}_output`)
        if (outputJson) processed.outputSchema = outputJson
    }

    return processed
}
