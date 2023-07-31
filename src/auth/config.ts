import { Type } from 'class-transformer'
import {
    IsOptional,
    IsString,
    ValidateNested
} from 'class-validator'
import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'

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

export function storeAccessToken(tokens: Partial<SSOAuthConfig>, authPath: string): void {
    const configDir = path.dirname(authPath)
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
    }
    const config = new AuthConfig()
    config.sso = config.sso || new SSOAuthConfig()
    if (tokens.accessToken) config.sso.accessToken = tokens.accessToken
    if (tokens.refreshToken) config.sso.refreshToken = tokens.refreshToken
    if (tokens.personalAccessToken) config.sso.personalAccessToken = tokens.personalAccessToken

    fs.writeFileSync(authPath, jsYaml.dump(config))
}
