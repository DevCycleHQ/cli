const path = require('path')
// Ensure TypeScript files required by @oclif/test are compiled at runtime
try {
    require('ts-node/register')
} catch {}
process.env.TS_NODE_PROJECT = path.resolve('tsconfig.json')
process.env.NODE_ENV = 'development'

global.oclif = global.oclif || {}
global.oclif.columns = 80
