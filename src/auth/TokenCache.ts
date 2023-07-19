import path from 'path'
import * as crypto from 'crypto'
import * as fs from 'fs/promises'

export class TokenCache {
    filePath: string

    constructor(cacheDir: string) {
        this.filePath = path.join(cacheDir, 'token.json')
    }

    private hashCredentials(clientId: string, clientSecret: string): string {
        return crypto.createHash('md5').update(clientId + clientSecret).digest('hex')
    }

    public async set(clientId: string, clientSecret: string, token: string): Promise<void> {
        try {
            const identifier = this.hashCredentials(clientId, clientSecret)
            const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const expiry = tokenPayload.exp * 1000
            await fs.writeFile(this.filePath, JSON.stringify({ identifier, token, expiry }))
        } catch (err) {
            // don't throw error
        }
    }

    public async get(clientId: string, clientSecret: string): Promise<string | null> {
        try {
            const identifier = this.hashCredentials(clientId, clientSecret)
            const fileContent = await fs.readFile(this.filePath)
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