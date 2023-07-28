import * as assert from 'assert'
import { shouldRefreshToken } from './shouldRefreshToken'

describe('shouldRefreshToken', () => {
    it('returns false when expiry is in more than 1 hour', () => {
        // eslint-disable-next-line max-len
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.K_lUwtGbvjCHP8Ff-gW9GykydkkXzHKRPbACxItvrFU'
        const shouldRefresh = shouldRefreshToken(token)

        assert.equal(shouldRefresh, false)
    })

    it('returns true when expiry is in less than 1 hour', () => {
        // eslint-disable-next-line max-len
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTA1Njk3NDl9.tky9uXPkMNABH8JenyyIt_cHpcg51cIH25eWRk7le4g'
        const shouldRefresh = shouldRefreshToken(token)

        assert.equal(shouldRefresh, true)
    })

    it('returns true when token is invalid', () => {
        // eslint-disable-next-line max-len
        const token = 'not a real token'
        const shouldRefresh = shouldRefreshToken(token)

        assert.equal(shouldRefresh, true)
    })
})
