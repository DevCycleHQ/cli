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