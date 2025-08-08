// Centralized version for the MCP Worker, sourced from this package.json
// This is bundled at build time by the Worker toolchain
import pkg from '../package.json'

const workerVersion: string = (pkg as { version?: string }).version || 'unknown'

export default workerVersion
