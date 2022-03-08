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

export async function storeAccessToken(accessToken:string, authPath:string):Promise<void> {
    const configDir = path.dirname(authPath)
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
    }
    const config = new AuthConfig()
    config.sso = { accessToken }
    fs.writeFileSync(authPath, jsYaml.dump(config))
}