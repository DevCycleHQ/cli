import { upperCase } from 'lodash'

/**
 * Transforms a variable key into the constant name format used by the generate command.
 * This matches the logic in src/commands/generate/types.ts getVariableGeneratedName()
 *
 * Example: 'my-variable' -> 'MY_VARIABLE'
 */
export function keyToConstant(variableKey: string): string {
    return upperCase(variableKey).replace(/\s/g, '_')
}
