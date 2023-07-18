import jsYaml from 'js-yaml'
import fs from 'fs'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { AuthConfig } from './config'
import { clientCredentialsAuth } from '../api/clientCredentialsAuth'
import { reportValidationErrors } from '../utils/reportValidationErrors'

type SupportedFlags = {
    'client-id'?: string
    'client-secret'?: string
}

export async function getToken(authPath: string, flags: SupportedFlags): Promise<string> {
    const client_id = flags['client-id']
        || process.env.DEVCYCLE_CLIENT_ID
        || process.env.DVC_CLIENT_ID
    const client_secret = flags['client-secret']
        || process.env.DEVCYCLE_CLIENT_SECRET
        || process.env.DVC_CLIENT_SECRET

    if (client_id && client_secret) {
        return clientCredentialsAuth(client_id, client_secret)
    }

    if (authPath && fs.existsSync(authPath)) {
        return getTokenFromAuthFile(authPath)
    }

    return ''
}

async function getTokenFromAuthFile(authPath: string): Promise<string> {
    const rawConfig = jsYaml.load(fs.readFileSync(authPath, 'utf8'))
    const config = plainToClass(AuthConfig, rawConfig)
    const errors = validateSync(config)
    reportValidationErrors(errors)

    if (config.sso) {
        return config.sso.accessToken || ''
    } else if (config.clientCredentials) {
        const { client_id, client_secret } = config.clientCredentials
        return clientCredentialsAuth(client_id, client_secret)
    }

    return ''
}
