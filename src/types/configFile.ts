import { Type } from 'class-transformer'
import {
    IsObject,
    IsOptional,
    IsString,
    registerDecorator,
    ValidateNested,
    ValidationOptions
} from 'class-validator'

function ValidateMatchPatterns(validationOptions?: ValidationOptions) {
    return function(object: any, propertyName: string) {
        registerDecorator({
            name: 'ValidateMatchPatterns',
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} must be an object mapping file extensions to an array of Regex patterns`,
                ...validationOptions
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
    return function(object: any, propertyName: string) {
        registerDecorator({
            name: 'ValidateVariableAliases',
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} must be an object mapping code references to variable keys`,
                ...validationOptions
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

class CodeInsights {
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
}

export class ConfigFromFile {
    @Type(() => CodeInsights)
    @IsOptional()
    @ValidateNested()
    codeInsights?: CodeInsights

    @IsString()
    @IsOptional()
    project?: string
}

export class AuthFromFile {
    @IsString()
    client_id: string
    @IsString()
    client_secret: string
}