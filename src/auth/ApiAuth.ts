import jsYaml from 'js-yaml'
import fs from 'fs'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { AuthConfig, storeAccessToken } from './config'
import { reportValidationErrors } from '../utils/reportValidationErrors'
import { AUTH_URL } from '../api/common'
import { TokenCache } from './TokenCache'
import { shouldRefreshToken } from './utils'
import { CLI_CLIENT_ID } from './SSOAuth'

type SupportedFlags = {
    'client-id'?: string
    'client-secret'?: string
}

export class ApiAuth {
    private authPath: string
    private tokenCache: TokenCache

    constructor(authPath: string, cacheDir: string) {
        this.authPath = authPath
        this.tokenCache = new TokenCache(cacheDir)
    }

    public async getToken(flags: SupportedFlags): Promise<string> {
        const clientId = flags['client-id']
            || process.env.DEVCYCLE_CLIENT_ID
            || process.env.DVC_CLIENT_ID
        const clientSecret = flags['client-secret']
            || process.env.DEVCYCLE_CLIENT_SECRET
            || process.env.DVC_CLIENT_SECRET

        if (clientId && clientSecret) {
            return this.fetchClientToken(clientId, clientSecret)
        }

        if (this.authPath && fs.existsSync(this.authPath)) {
            return this.getTokenFromAuthFile()
        }

        return ''
    }

    private async getTokenFromAuthFile(): Promise<string> {
        const rawConfig = jsYaml.load(fs.readFileSync(this.authPath, 'utf8'))
        const config = plainToClass(AuthConfig, rawConfig)
        const errors = validateSync(config)
        reportValidationErrors(errors)

        if (config.sso) {
            const { accessToken, refreshToken } = config.sso

            if (accessToken && refreshToken && shouldRefreshToken(accessToken)) {
                return this.refreshClientToken(refreshToken)
            }

            return accessToken || ''
        } else if (config.clientCredentials) {
            const { client_id, client_secret } = config.clientCredentials
            return this.fetchClientToken(client_id, client_secret)
        }

        return ''
    }

    private async fetchClientToken(client_id: string, client_secret: string): Promise<string> {
        const cachedToken = this.tokenCache.get(client_id, client_secret)
        if (cachedToken) {
            return cachedToken
        }

        const url = new URL('/oauth/token', AUTH_URL)

        try {
            const response = await axios.post(url.href, {
                grant_type: 'client_credentials',
                client_id,
                client_secret,
                audience: 'https://api.devcycle.com/',
            })

            const accessToken = response.data.access_token
            this.tokenCache.set(client_id, client_secret, accessToken)
            return accessToken
        } catch (e) {
            throw new Error('Failed to authenticate with the DevCycle API. Check your credentials.')
        }
    }

    private async refreshClientToken(refresh_token: string): Promise<string> {
        const url = new URL('/oauth/token', AUTH_URL)

        try {
            const response = await axios.post(url.href, {
                client_id: CLI_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token,
                audience: 'https://api.devcycle.com/',
            })

            const accessToken = response.data.access_token
            const refreshToken = response.data.refresh_token
            storeAccessToken({ accessToken, refreshToken }, this.authPath)
            return accessToken
        } catch (e) {
            throw new Error('Failed to refresh DevCycle API token.')
        }
    }
}
