import { upperCase } from 'lodash'

/**
 * Converts a variable key to its generated constant name format.
 *
 * Example: 'my-variable' -> 'MY_VARIABLE'
 */
export function keyToConstant(variableKey: string): string {
    return upperCase(variableKey).replace(/\s/g, '_')
}
