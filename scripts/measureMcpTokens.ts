#!/usr/bin/env ts-node
import { registerAllToolsWithServer } from '../src/mcp/tools'
import type { DevCycleMCPServerInstance } from '../src/mcp/server'
import type { IDevCycleApiClient } from '../src/mcp/api/interface'

type Collected = {
    name: string
    description: string
    inputSchema?: unknown
    outputSchema?: unknown
}

const collected: Collected[] = []

const mockServer: DevCycleMCPServerInstance = {
    registerToolWithErrorHandling(name, config) {
        collected.push({
            name,
            description: config.description,
            inputSchema: config.inputSchema,
            outputSchema: config.outputSchema,
        })
    },
}

// We do not need a real client to collect tool metadata
const fakeClient = {} as unknown as IDevCycleApiClient

registerAllToolsWithServer(mockServer, fakeClient)

let openAiEncoderPromise: Promise<(input: string) => number[]> | undefined
async function countOpenAI(text: string): Promise<number> {
    try {
        if (!openAiEncoderPromise) {
            openAiEncoderPromise = import('gpt-tokenizer').then((m) => m.encode)
        }
        const encode = await openAiEncoderPromise
        return encode(text).length
    } catch {
        return 0
    }
}
let anthropicCounterPromise: Promise<(input: string) => number> | undefined
async function countAnthropic(text: string): Promise<number> {
    try {
        if (!anthropicCounterPromise) {
            anthropicCounterPromise = import('@anthropic-ai/tokenizer').then(
                (m) => m.countTokens,
            )
        }
        const countTokens = await anthropicCounterPromise
        return countTokens(text)
    } catch {
        return 0
    }
}

type ResultRow = {
    name: string
    anthropic: {
        description: number
        inputSchema: number
        outputSchema: number
        total: number
    }
    openai: {
        description: number
        inputSchema: number
        outputSchema: number
        total: number
    }
}

const rows: ResultRow[] = []
let grandAnthropic = 0
let grandOpenAI = 0

async function main() {
    for (const t of collected) {
        const d = t.description ?? ''
        const i = t.inputSchema ? JSON.stringify(t.inputSchema) : ''
        const o = t.outputSchema ? JSON.stringify(t.outputSchema) : ''

        const [aDesc, aIn, aOut] = await Promise.all([
            countAnthropic(d),
            i ? countAnthropic(i) : Promise.resolve(0),
            o ? countAnthropic(o) : Promise.resolve(0),
        ])
        const aTotal = aDesc + aIn + aOut

        const [oDesc, oIn, oOut] = await Promise.all([
            countOpenAI(d),
            i ? countOpenAI(i) : Promise.resolve(0),
            o ? countOpenAI(o) : Promise.resolve(0),
        ])
        const oTotal = oDesc + oIn + oOut

        grandAnthropic += aTotal
        grandOpenAI += oTotal

        rows.push({
            name: t.name,
            anthropic: {
                description: aDesc,
                inputSchema: aIn,
                outputSchema: aOut,
                total: aTotal,
            },
            openai: {
                description: oDesc,
                inputSchema: oIn,
                outputSchema: oOut,
                total: oTotal,
            },
        })
    }

    rows.sort((a, b) => a.name.localeCompare(b.name))

    console.log(
        JSON.stringify(
            {
                tools: rows,
                totals: { anthropic: grandAnthropic, openai: grandOpenAI },
            },
            null,
            2,
        ),
    )
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
