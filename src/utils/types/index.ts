import { CustomProperty, Feature, Variable } from '../../api/schemas'
import { OrganizationMember } from '../../api/members'

export function sanitizeDescription(description: string) {
    // Remove newlines, tabs, and carriage returns for proper display
    return description.replace(/[\r\n\t]/g, ' ').trim()
}

export function findCreatorName(
    orgMembers: OrganizationMember[],
    creatorId: string,
) {
    return (
        orgMembers.find((member) => member.user_id === creatorId)?.name ||
        'Unknown User'
    )
}

export const blockComment = (
    description: string,
    creator: string,
    createdDate: string,
    indent: boolean,
    key?: string,
    deprecationWarning?: string,
    staleWarning?: string,
) => {
    const indentString = indent ? '    ' : ''
    return (
        indentString +
        '/**\n' +
        (key ? `${indentString} * key: ${key}\n` : '') +
        (description !== ''
            ? `${indentString} * description: ${description}\n`
            : '') +
        `${indentString} * created by: ${creator}\n` +
        `${indentString} * created on: ${createdDate}\n` +
        (deprecationWarning
            ? `${indentString} * ${deprecationWarning}\n`
            : '') +
        (staleWarning ? `${indentString} * ${staleWarning}\n` : '') +
        indentString +
        '*/'
    )
}

export function getVariableType(variable: Variable) {
    if (
        variable.validationSchema &&
        variable.validationSchema.schemaType === 'enum'
    ) {
        // TODO fix the schema so it doesn't think enumValues is an object
        const enumValues = variable.validationSchema.enumValues as
            | string[]
            | number[]
        if (enumValues === undefined || enumValues.length === 0) {
            return variable.type.toLocaleLowerCase()
        }
        return enumValues.map((value) => `'${value}'`).join(' | ')
    }
    if (variable.type === 'JSON') {
        return 'DevCycleJSON'
    }
    return variable.type.toLocaleLowerCase()
}

export function isVariableDeprecated(variable: Variable, features: Feature[]) {
    if (!variable._feature || variable.persistent) return { deprecated: false }
    const feature = features.find((f) => f._id === variable._feature)
    return { deprecated: feature && feature.status !== 'active', feature }
}

export function isVariableStale(variable: Variable, features: Feature[]) {
    if (!variable._feature || variable.persistent) return { stale: false }
    const feature = features.find((f) => f._id === variable._feature)
    return { stale: feature && feature.staleness, feature }
}

export function getRecommendedValueForStale(
    variable: Variable,
    feature: Feature,
): string {
    const isJsonType = variable.type === 'JSON'
    const getStringifiedIfJson = (val: unknown) =>
        isJsonType ? JSON.stringify(val) : `${val}`

    if (!feature) {
        return getStringifiedIfJson(variable.defaultValue)
    }
    const reason = feature.staleness?.reason
    if (reason === 'unused') {
        return getStringifiedIfJson(variable.defaultValue)
    } else if (reason === 'released') {
        if (feature.staleness?.metaData?.releaseVariation) {
            const stalenessMetaData = feature.staleness?.metaData
                ?.releaseVariation as {
                _variation: string
                variationKey: string
                variationName: string
            }
            const releaseVariation = feature.variations?.find(
                (v) => v._id === stalenessMetaData._variation,
            )
            const value =
                releaseVariation?.variables?.[variable.key] ??
                variable.defaultValue
            return getStringifiedIfJson(value)
        }
    }
    return getStringifiedIfJson(variable.defaultValue)
}

export const generateCustomDataType = (
    customProperties: CustomProperty[],
    strict: boolean,
) => {
    const properties = customProperties
        .map((prop) => {
            const propType = prop.type.toLowerCase()
            const schema = prop.schema?.enumSchema
            const isRequired = prop.schema?.required ?? false
            const optionalMarker = isRequired ? '' : '?'
            if (schema) {
                const enumValues = schema.allowedValues
                    .map(({ label, value }) => {
                        const valueStr =
                            typeof value === 'number' ? value : `'${value}'`
                        return `        // ${label}\n        ${valueStr}`
                    })
                    .join(' | \n')
                return `    '${prop.propertyKey}'${optionalMarker}: | \n${enumValues}${schema.allowAdditionalValues ? ` |\n        ${propType}` : ''}`
            }
            return `    '${prop.propertyKey}'${optionalMarker}: ${propType}`
        })
        .join('\n')

    return `export type CustomData = {
${properties}
}${!strict ? ' & DVCCustomDataJSON' : ''}\n`
}

export const reactImports = (oldRepos: boolean, strictCustomData: boolean) => {
    if (oldRepos) {
        return `import { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'
import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue
} from '@devcycle/devcycle-react-sdk'

export type DevCycleJSON = { [key: string]: string | boolean | number }

`
    } else {
        return `import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue,
    DVCVariable,
    DVCVariableValue,${!strictCustomData ? '\n    DVCCustomDataJSON,' : ''}
    DevCycleJSON
} from '@devcycle/react-client-sdk'

`
    }
}

export const nextImports = (strictCustomData: boolean) => {
    return `import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue,
    DVCVariable,
    DVCVariableValue,${!strictCustomData ? '\n    DVCCustomDataJSON,' : ''}
    DevCycleJSON
} from '@devcycle/nextjs-sdk'

`
}

export const reactOverrides = `
export type UseVariableValue = <
    K extends string & keyof DVCVariableTypes
>(
    key: K,
    defaultValue: DVCVariableTypes[K]
) => DVCVariableTypes[K]

export const useVariableValue = originalUseVariableValue as UseVariableValue

export type UseVariable = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: DVCVariableTypes[K]
) => DVCVariable<T>

export const useVariable = originalUseVariable as UseVariable

`
