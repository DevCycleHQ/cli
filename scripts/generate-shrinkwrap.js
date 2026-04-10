#!/usr/bin/env node
/**
 * generate-shrinkwrap.js
 *
 * Generates npm-shrinkwrap.json while preserving yarn.lock intact.
 *
 * Why the yarn.lock protection is needed:
 *   `npm install --package-lock-only` rewrites yarn.lock with a Yarn v1
 *   format file, corrupting the Yarn Berry lockfile that the project uses
 *   for development. We save and restore it around the npm operation.
 */

'use strict'

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const YARN_LOCK = path.join(ROOT, 'yarn.lock')
const YARN_LOCK_BAK = path.join(ROOT, 'yarn.lock.shrinkwrap-bak')
const SHRINKWRAP_PATH = path.join(ROOT, 'npm-shrinkwrap.json')

// ---------------------------------------------------------------------------
// Save yarn.lock before npm touches it
// ---------------------------------------------------------------------------

if (!fs.existsSync(YARN_LOCK)) {
    console.error(
        'Error: yarn.lock not found. Cannot protect it from npm overwrite.',
    )
    process.exit(1)
}

const yarnLockContent = fs.readFileSync(YARN_LOCK)

function restoreYarnLock() {
    fs.writeFileSync(YARN_LOCK, yarnLockContent)
    if (fs.existsSync(YARN_LOCK_BAK)) fs.unlinkSync(YARN_LOCK_BAK)
}

// Write a physical backup too, so a crash mid-run doesn't lose the file.
fs.writeFileSync(YARN_LOCK_BAK, yarnLockContent)

// ---------------------------------------------------------------------------
// Run npm operations, always restoring yarn.lock afterwards
// ---------------------------------------------------------------------------

try {
    console.log('Generating package-lock.json from installed node_modules...')
    execSync('npm install --package-lock-only --ignore-scripts', {
        cwd: ROOT,
        stdio: 'inherit',
    })

    console.log('Converting package-lock.json to npm-shrinkwrap.json...')
    execSync('npm shrinkwrap --ignore-scripts', {
        cwd: ROOT,
        stdio: 'inherit',
    })
} catch (err) {
    console.error('Error during shrinkwrap generation:', err.message)
    // Use exitCode instead of process.exit() so the finally block runs first.
    process.exitCode = 1
} finally {
    // Always restore yarn.lock. npm operations rewrite it to Yarn v1 format,
    // which corrupts the Yarn Berry lockfile used for development.
    restoreYarnLock()
}

if (process.exitCode) process.exit()

// ---------------------------------------------------------------------------
// Strip workspace entries from npm-shrinkwrap.json
//
// Workspace entries arise because npm reads the `workspaces` field from
// package.json. They take two forms:
//   - Keys without a "node_modules/" prefix (e.g. "mcp-worker")
//   - Symlink entries with { "link": true } (e.g. "node_modules/@devcycle/mcp-worker")
//
// These entries reference a local directory that does not exist when a
// consumer installs the published package, so they must be removed.
// ---------------------------------------------------------------------------

const shrinkwrap = JSON.parse(fs.readFileSync(SHRINKWRAP_PATH, 'utf8'))
const allPackages = shrinkwrap.packages || {}

let strippedCount = 0
const cleanedPackages = {}

for (const [key, value] of Object.entries(allPackages)) {
    // Always keep the root entry (empty string key)
    if (key === '') {
        cleanedPackages[key] = value
        continue
    }

    // Drop workspace root entries (not under node_modules/)
    if (!key.startsWith('node_modules/')) {
        strippedCount++
        continue
    }

    // Drop workspace symlink entries
    if (value.link === true) {
        strippedCount++
        continue
    }

    cleanedPackages[key] = value
}

if (strippedCount > 0) {
    console.log(
        `Stripped ${strippedCount} workspace entries from npm-shrinkwrap.json.`,
    )
    shrinkwrap.packages = cleanedPackages
    fs.writeFileSync(
        SHRINKWRAP_PATH,
        JSON.stringify(shrinkwrap, null, 2) + '\n',
    )
}
