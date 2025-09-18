const path = require('path')

// Set environment variables before loading ts-node or oclif
process.env.TS_NODE_PROJECT = path.resolve('tsconfig.json')
process.env.NODE_ENV = 'development'
// Suppress oclif manifest version mismatch warnings in tests without deleting the manifest
process.env.OCLIF_NEXT_VERSION = '1'

// Ensure TypeScript files required by @oclif/test are compiled at runtime
try {
    require('ts-node/register')
} catch {}

global.oclif = global.oclif || {}
global.oclif.columns = 80
