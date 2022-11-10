import { clientCredentialsAuth } from '../api/clientCredentialsAuth'
import DVCConfig from '../utils/files/dvcConfig'

type SupportedFlags = {
    'client-id'?: string
    'client-secret'?: string
}

export async function getToken(configuration:DVCConfig, flags: SupportedFlags): Promise<string> {
    const client_id = flags['client-id'] || process.env.DVC_CLIENT_ID
    const client_secret = flags['client-secret'] || process.env.DVC_CLIENT_SECRET

    if (client_id && client_secret) {
        return clientCredentialsAuth(client_id, client_secret)
    }

    const authConfig = configuration.getAuth()
    if (authConfig?.sso) {
        return authConfig.sso.accessToken || ''
    } else if (authConfig?.clientCredentials) {
        const { client_id, client_secret } = authConfig.clientCredentials
        return clientCredentialsAuth(client_id, client_secret)
    }

    return ''
}