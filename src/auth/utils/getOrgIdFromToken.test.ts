import * as assert from 'assert'
import { getOrgIdFromToken } from './getOrgIdFromToken'

describe('getOrgIdFromToken', () => {
    it('parses "org_id" when it exists', () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJvcmdfaWQiOiJvcmdBQkMifQ.FDLOcz96JfcVLJZZdfJ9OtW5EzLmVVHS7u4usjJYJ6g'

        const orgId = getOrgIdFromToken(token)

        assert.equal(orgId, 'orgABC')
    })

    it('parses "https://devcycle.com/org_id" when it exists', () => {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJodHRwczovL2RldmN5Y2xlLmNvbS9vcmdfaWQiOiJvcmcxMjMifQ.bV7-ZTb8HqYhjWLSz9yQyycmzBkZrm9Nexw03zvI0DE'

        const orgId = getOrgIdFromToken(token)

        assert.equal(orgId, 'org123')
    })

    it('returns undefined when org id does not exist', () => {
        const token = 'not a jwt token'
        const orgId = getOrgIdFromToken(token)

        assert.equal(orgId, undefined)
    })
})
