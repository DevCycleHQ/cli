import path from 'path'
import * as crypto from 'crypto'
import fs from '../utils/fileSystem'
import { getTokenExpiry } from './utils'

export class TokenCache {
    filePath: string

    constructor(cacheDir: string) {
        this.filePath = path.join(cacheDir, 'token.json')
    }

    private hashCredentials(
        clientId: string,
        clientSecret: string,
        algorithm: 'sha256' | 'md5' = 'sha256',
    ): string {
        return crypto
            .createHash(algorithm)
            .update(clientId + clientSecret)
            .digest('hex')
    }

    public set(clientId: string, clientSecret: string, token: string): void {
        try {
            // Always use SHA-256 for new cache entries
            const identifier = this.hashCredentials(
                clientId,
                clientSecret,
                'sha256',
            )
            const expiry = getTokenExpiry(token)
            fs.writeFileSync(
                this.filePath,
                JSON.stringify({ identifier, token, expiry }),
            )
        } catch (err) {
            // don't throw error
        }
    }

    public get(clientId: string, clientSecret: string): string | null {
        try {
            // First try with SHA-256 (new format)
            const sha256Identifier = this.hashCredentials(
                clientId,
                clientSecret,
                'sha256',
            )
            const fileContent = fs.readFileSync(this.filePath)
            const cache = JSON.parse(fileContent)

            if (
                cache &&
                cache.token &&
                cache.identifier === sha256Identifier &&
                cache.expiry > Date.now()
            ) {
                return cache.token
            }

            // Fallback to MD5 for backwards compatibility with existing caches
            const md5Identifier = this.hashCredentials(
                clientId,
                clientSecret,
                'md5',
            )
            if (
                cache &&
                cache.token &&
                cache.identifier === md5Identifier &&
                cache.expiry > Date.now()
            ) {
                // Migrate the cache entry to use SHA-256
                this.set(clientId, clientSecret, cache.token)
                return cache.token
            }
        } catch (err) {
            // don't throw error
        }

        return null
    }
}
