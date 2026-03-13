// Secrets set via `wrangler secret put`, not emitted by `wrangler types`.
// Declaration merging extends the generated Cloudflare.Env interface.
declare namespace Cloudflare {
    interface Env {
        AUTH0_CLIENT_ID: string
        AUTH0_CLIENT_SECRET: string
        ABLY_API_KEY: string
    }
}
