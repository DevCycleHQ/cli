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

/**
 * Narrow an unknown value to a Zod type.
 *
 * Why: tool registrations often pass either full Zod schemas or plain
 * shapes (e.g., `SomeZodSchema.shape`). We need a reliable way to detect when
 * we already have a Zod schema so we don't wrap it again.
 */
function isZodType(value: unknown): value is ZodTypeAny {
    return !!value && typeof value === 'object' && 'safeParse' in value
}

/**
 * Convert a plain object shape into a Zod object when needed.
 *
 * Why: our tool modules frequently pass `SomeSchema.shape` which is a plain
 * object of Zod fields. `zod-to-json-schema` expects a full Zod schema.
 * Without wrapping, we would emit an empty `{}` JSON Schema, which broke MCP
 * consumers (e.g., Copilot Chat would see tools with no parameters).
 *
 * This function is deliberately permissive so inline shapes also work.
 */
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

/**
 * Convert a Zod schema or shape to JSON Schema and normalize it for MCP.
 *
 * Why: some generated Zod schemas include arrays defined as `z.array(z.any())`.
 * `zod-to-json-schema` may omit `items` for these, but MCP clients (notably
 * Copilot Chat) require `items` to be present. We post-process the emitted
 * schema to ensure every array node includes an `items` field.
 */
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

    // Normalize the schema for MCP consumers that require `items` on arrays.
    // Some generated schemas (e.g., z.array(z.any())) omit `items`. Add a
    // minimal empty schema so tools validate correctly.
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

/**
 * Prepare a tool registration payload for the MCP server.
 *
 * Why: centralizes JSON Schema conversion and applies safe defaults so a
 * tool always has a valid `inputSchema`. Also supports optional output schema
 * generation behind a feature flag. We pass a `name` to help
 * `zod-to-json-schema` generate stable `$ref` entries for large schemas.
 */
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
