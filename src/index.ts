/**
 * DevCycle MCP Cloudflare Worker Entry Point
 *
 * For now, this is a placeholder that demonstrates the package structure.
 * In Phase 3, this will import the worker implementation from the main CLI package
 * to maintain a clean separation between packages while sharing code.
 */

export default {
    fetch(request: Request, env: any, ctx: any): Response {
        return new Response(
            JSON.stringify({
                message: 'DevCycle MCP Server - Coming Soon',
                timestamp: new Date().toISOString(),
                path: new URL(request.url).pathname,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            },
        )
    },
}
