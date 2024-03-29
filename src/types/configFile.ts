import { Type } from 'class-transformer'
import {
    IsIn,
    IsArray,
    IsObject,
    IsOptional,
    IsString,
    registerDecorator,
    ValidateNested,
    ValidationOptions,
} from 'class-validator'

function ValidateMatchPatterns(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ValidateMatchPatterns',
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} must be an object mapping file extensions to an array of Regex patterns`,
                ...validationOptions,
            },
            validator: {
                validate(value: Record<string, unknown>) {
                    for (const key in value) {
                        if (!Array.isArray(value[key])) {
                            return false
                        }
                    }

                    return true
                },
            },
        })
    }
}

function ValidateVariableAliases(validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'ValidateVariableAliases',
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} must be an object mapping code references to variable keys`,
                ...validationOptions,
            },
            validator: {
                validate(aliasMap: Record<string, unknown>) {
                    for (const key in aliasMap) {
                        if (typeof aliasMap[key] !== 'string') {
                            return false
                        }
                    }

                    return true
                },
            },
        })
    }
}

export class SavedOrganization {
    @IsString()
    id: string

    @IsString()
    name: string

    @IsString()
    display_name: string
}

export class TypeGenerator {
    @IsString()
    @IsOptional()
    outputPath?: string
}

export class CodeInsights {
    @IsString({ each: true })
    @IsOptional()
    clientNames?: string[]

    @IsOptional()
    @IsObject()
    @ValidateVariableAliases()
    variableAliases?: Record<string, string>

    @IsOptional()
    @IsObject()
    @ValidateMatchPatterns()
    matchPatterns?: Record<string, string[]>

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    includeFiles?: string[]

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeFiles?: string[]
}

export class UserConfigFromFile {
    @Type(() => SavedOrganization)
    @IsOptional()
    org?: SavedOrganization

    @IsString()
    @IsOptional()
    project?: string
}

export class RepoConfigFromFile {
    @Type(() => SavedOrganization)
    @IsOptional()
    org?: SavedOrganization

    @IsString()
    @IsOptional()
    project?: string

    @Type(() => CodeInsights)
    @IsOptional()
    @ValidateNested()
    codeInsights?: CodeInsights

    @Type(() => TypeGenerator)
    @IsOptional()
    @ValidateNested()
    typeGenerator?: TypeGenerator
}

export class AuthFromFile {
    @IsIn(['sso', 'rest-api'])
    @IsString()
    @IsOptional()
    type?: string = 'rest-api'

    @IsString()
    @IsOptional()
    client_id?: string

    @IsString()
    @IsOptional()
    client_secret?: string

    @IsString()
    @IsOptional()
    accessToken?: string
}
