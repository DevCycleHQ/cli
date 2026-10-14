import { expect } from 'vitest'
import { getLanguageForExtension } from '.'

describe('getLanguageForExtension', () => {
    it('uses the mapped language for built-in extensions', () => {
        expect(getLanguageForExtension('ts')).toEqual('typescript')
        expect(getLanguageForExtension('kt')).toEqual('kotlin')
    })

    it('falls back to the extension for unmapped alphanumeric extensions', () => {
        expect(getLanguageForExtension('html')).toEqual('html')
        expect(getLanguageForExtension('Vue')).toEqual('vue')
        expect(getLanguageForExtension('constructor')).toEqual('constructor')
    })

    it('falls back to unknown for unsafe or empty extensions', () => {
        expect(getLanguageForExtension('<img src=x onerror=alert(1)>')).toEqual(
            'unknown',
        )
        expect(getLanguageForExtension('a'.repeat(17))).toEqual('unknown')
        expect(getLanguageForExtension('')).toEqual('unknown')
    })
})
