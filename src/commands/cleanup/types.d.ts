export type Variable = {
    key: string
    value: VariableValue
    type: VariableType
}

export type VariableType = 'String' | 'Boolean' | 'Number' | 'JSON'
export type VariableValue = string | boolean | number | Record<string, any>
