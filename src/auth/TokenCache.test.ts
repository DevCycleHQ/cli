import * as assert from 'assert'
import { TokenCache } from './TokenCache'
import sinon from 'sinon'
import fs from '../utils/fileSystem'
import { tokenCacheStub_get, tokenCacheStub_set } from '../../test/setup'

// eslint-disable-next-line max-len
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhpTzk1Xzllbk53Z1NNSkZRSXZNUiJ9.eyJodHRwczovL2RldmN5Y2xlLmNvbS9lbWFpbCI6InRlc3RAdGFwbHl0aWNzLmNvbSIsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2lzR2VuZXJpY0RvbWFpbiI6ZmFsc2UsImh0dHBzOi8vZGV2Y3ljbGUuY29tL2FsbG93T3JnRGlzY292ZXJ5Ijp0cnVlLCJpc3MiOiJodHRwczovL2F1dGguZGV2Y3ljbGUuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTExNTU5MDA2NTYzMzMzMzM0MjE0IiwiYXVkIjoiaHR0cHM6Ly9hcGkuZGV2Y3ljbGUuY29tLyIsImlhdCI6MTY4Nzk2NjU0MiwiZXhwIjo5OTk5OTk5OTk5LCJhenAiOiJFdjlKMERHeFIzS2hyS2Fad1k2amxjY21qbDdKR0tFWCIsIm9yZ19pZCI6Im9yZ19VOUY4WU1hVENoVEVuZFd3IiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOnJlc291cmNlcyIsImRlbGV0ZTpyZXNvdXJjZXMiLCJyZWFkOmN1cnJlbnRfb3JnYW5pemF0aW9uIiwicmVhZDpyZXNvdXJjZXMiLCJyZWFkOnVzZXJzIiwidXBkYXRlOnJlc291cmNlcyJdfQ==.bd8rLSYh6ZtnzEgG-Mya86wnOuZcRC97tb4_8gdjTgH2aUCkNRDKcJvLkFL_wYszBurFs75n-BdHKnv9H8yy23fdQbPxX-5Wjq1vvS5PN3DdpvGtc5EuumFBxgwUO3WTmId2znjbMBWIVOM5bViRN8Pba4X6XZSSQ6hxd7-30Txj_5dOsPNikZHjBDuTCqlQxdrZu_ER0JKKkRwdlR8h7qsGMBrTeVqBhIFQXQIFns440FZsCGaOK4hFw9vg6remaBu3HTQRWClXHVwh03lwFTX8MTfwRwFDGhl988zbzK38AAncoKcXKCMrG2GXVswar0RaQWhLSL9eLuX0PI99Ww'

const cachedPayload = {
    identifier: '3858f62230ac3c915f300c664312c63f',
    token,
    expiry: 9999999999000
}

describe('TokenCache', () => {
    let writeFileStub: sinon.SinonStub
    let readFileStub: sinon.SinonStub

    beforeEach(() => {
        tokenCacheStub_get.restore()
        tokenCacheStub_set.restore()

        writeFileStub = sinon.stub(fs, 'writeFileSync')
        readFileStub = sinon.stub(fs, 'readFileSync').returns(Buffer.from(JSON.stringify(cachedPayload), 'utf8'))
    })

    afterEach(() => {
        writeFileStub.restore()
        readFileStub.restore()
    })

    describe('set', () => {
        it('writes to cache directory', () => {
            const tokenCache = new TokenCache('mock-file-path')
            tokenCache.set('foo', 'bar', token)

            sinon.assert.calledOnce(writeFileStub)
            sinon.assert.calledWithExactly(writeFileStub, 'mock-file-path/token.json', JSON.stringify(cachedPayload))
        })
    })

    describe('get', () => {
        it('reads from cache directory', () => {
            const tokenCache = new TokenCache('mock-file-path')
            const response = tokenCache.get('foo', 'bar')

            sinon.assert.calledOnce(readFileStub)
            assert.equal(response, token)
        })

        it('returns null when cache is empty', () => {
            readFileStub.returns(Buffer.from('', 'utf8'))

            const tokenCache = new TokenCache('mock-file-path')
            const response = tokenCache.get('foo', 'bar')

            sinon.assert.calledOnce(readFileStub)
            assert.equal(response, null)
        })

        it('returns null when cached token is expired', () => {
            readFileStub.returns(Buffer.from(JSON.stringify({ ...cachedPayload, expiry: 1689799445505 }), 'utf8'))

            const tokenCache = new TokenCache('mock-file-path')
            const response = tokenCache.get('foo', 'bar')

            sinon.assert.calledOnce(readFileStub)
            assert.equal(response, null)
        })

        it('returns null when client identifier does not match', () => {
            const tokenCache = new TokenCache('mock-file-path')
            const response = tokenCache.get('foo', 'boo')

            sinon.assert.calledOnce(readFileStub)
            assert.equal(response, null)
        })
    })
})
