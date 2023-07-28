import path from 'path'
import * as crypto from 'crypto'
import fs from '../utils/fileSystem'
import { getTokenExpiry } from './utils'

export class TokenCache {
    filePath: string

    constructor(cacheDir: string) {
        this.filePath = path.join(cacheDir, 'token.json')
    }

    private hashCredentials(clientId: string, clientSecret: string): string {
        return crypto.createHash('md5').update(clientId + clientSecret).digest('hex')
    }

    public set(clientId: string, clientSecret: string, token: string): void {
        try {
            const identifier = this.hashCredentials(clientId, clientSecret)
            const expiry = getTokenExpiry(token)
            fs.writeFileSync(this.filePath, JSON.stringify({ identifier, token, expiry }))
        } catch (err) {
            // don't throw error
        }
    }

    public get(clientId: string, clientSecret: string): string | null {
        try {
            const identifier = this.hashCredentials(clientId, clientSecret)
            const fileContent = fs.readFileSync(this.filePath)
            const cache = JSON.parse(fileContent.toString())

            if (
                cache &&
                cache.token &&
                cache.identifier === identifier &&
                cache.expiry > Date.now()
            ) {
                return cache.token
            }
        } catch (err) {
            // don't throw error
        }

        return null
    }
}