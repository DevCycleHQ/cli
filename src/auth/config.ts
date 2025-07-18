import { Type } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'
import { getOrgIdFromToken } from './utils'

export class ClientCredentialsAuthConfig {
    @IsString()
    client_id: string

    @IsString()
    client_secret: string
}

export class SSOAuthConfig {
    @IsString()
    accessToken: string

    @IsString()
    @IsOptional()
    refreshToken?: string

    @IsString()
    @IsOptional()
    personalAccessToken?: string

    @IsOptional()
    orgs?: Record<string, Pick<SSOAuthConfig, 'accessToken' | 'refreshToken'>>
}

export class AuthConfig {
    @IsOptional()
    @ValidateNested()
    @Type(() => ClientCredentialsAuthConfig)
    clientCredentials?: ClientCredentialsAuthConfig

    @IsOptional()
    @ValidateNested()
    @Type(() => SSOAuthConfig)
    sso?: SSOAuthConfig
}

export function storeAccessToken(
    tokens: SSOAuthConfig,
    authPath: string,
): void {
    const configDir = path.dirname(authPath)
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
    }

    let config: AuthConfig

    // Use file descriptor to safely read existing config
    try {
        const fd = fs.openSync(authPath, 'r')
        try {
            const data = fs.readFileSync(fd, 'utf8')
            const parsedConfig = jsYaml.load(data) as AuthConfig
            config = parsedConfig || new AuthConfig()
        } finally {
            fs.closeSync(fd)
        }
    } catch (error: any) {
        // If file doesn't exist or can't be read, create new config
        if (error.code === 'ENOENT') {
            config = new AuthConfig()
        } else {
            throw error
        }
    }

    config.sso = config.sso || new SSOAuthConfig()
    config.sso.orgs = config.sso.orgs || {}

    const { accessToken, refreshToken, personalAccessToken } = tokens
    if (accessToken) config.sso.accessToken = accessToken
    if (refreshToken) config.sso.refreshToken = refreshToken
    if (personalAccessToken)
        config.sso.personalAccessToken = personalAccessToken

    const orgId = getOrgIdFromToken(accessToken)
    if (orgId) config.sso.orgs[orgId] = { accessToken, refreshToken }

    // Use file descriptor to safely write config
    // Note: 0o600 permissions work on Unix-like systems (macOS, Linux)
    // On Windows, Node.js will approximate these permissions
    const fd = fs.openSync(authPath, 'w', 0o600)
    try {
        fs.writeFileSync(fd, jsYaml.dump(config))
        fs.fsyncSync(fd) // Ensure data is flushed to disk
    } finally {
        fs.closeSync(fd)
    }
}
