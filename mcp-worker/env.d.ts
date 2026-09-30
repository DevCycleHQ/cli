// Secrets set via `wrangler secret put`, not emitted by `wrangler types`.
//
// `wrangler types` emits both a global `Env` and a `Cloudflare.Env`, and the two
// are declared independently (the global one extends a generated private base,
// not `Cloudflare.Env`). Declaration merging therefore has to target both, or
// code that reads `env.AUTH0_CLIENT_ID` and code constrained to `Cloudflare.Env`
// disagree about which secrets exist.
interface WorkerSecrets {
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    ABLY_API_KEY: string
}

interface Env extends WorkerSecrets {}

declare namespace Cloudflare {
    interface Env extends WorkerSecrets {}
}
