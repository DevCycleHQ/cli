import { expect } from '@oclif/test'
import { FileFilters } from './FileFilters'

describe('FileFilters', () => {
    describe('shouldIncludeFile', () => {
        it('should include file when no include or exclude flags are provided', () => {
            const fileFilters = new FileFilters()
            const filepath = '/path/to/file.ts'
            const result = fileFilters.shouldIncludeFile(filepath)
            expect(result).to.equal(true)
        })

        it('should include file when it matches the include glob pattern', () => {
            const include = ['**/*.ts']
            const fileFilters = new FileFilters({ include })
            const filepath = '/path/to/file.ts'
            const result = fileFilters.shouldIncludeFile(filepath)
            expect(result).to.equal(true)
        })

        it('should exclude file when it matches the exclude glob pattern', () => {
            const exclude = ['**/*.spec.ts']
            const fileFilters = new FileFilters({ exclude })
            const filepath = '/path/to/file.spec.ts'
            const result = fileFilters.shouldIncludeFile(filepath)
            expect(result).to.equal(false)
        })

        it('should include file when it matches the include glob pattern and does not match the exclude glob pattern', () => {
            const include = ['**/*.ts']
            const exclude = ['**/*.spec.ts']
            const fileFilters = new FileFilters({ include, exclude })
            const filepath = '/path/to/file.ts'
            const result = fileFilters.shouldIncludeFile(filepath)
            expect(result).to.equal(true)
        })
    })
})
