import { expect } from '@oclif/test'
import { parseKeysFromArgs } from './parseKeysFromArgs'

describe('parseKeysFromArgs', () => {
    it('should parse positional arguments with proper precedence over flags', () => {
        // Test multiple scenarios in one comprehensive test
        const result1 = parseKeysFromArgs({}, ['key1', 'key2'], {
            keys: 'ignored',
        })
        expect(result1).to.deep.equal(['key1', 'key2'])

        const result2 = parseKeysFromArgs({}, ['key1,key2'], {})
        expect(result2).to.deep.equal(['key1', 'key2'])

        const result3 = parseKeysFromArgs({}, [], { keys: 'key1,key2' })
        expect(result3).to.deep.equal(['key1', 'key2'])
    })
})
