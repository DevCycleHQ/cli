import sinon from 'sinon'
import { TokenCache } from '../src/auth/TokenCache'

export let tokenCacheStub_set: sinon.SinonStub
export let tokenCacheStub_get: sinon.SinonStub

beforeEach(() => {
    tokenCacheStub_get = sinon.stub(TokenCache.prototype, 'get')
    tokenCacheStub_set = sinon.stub(TokenCache.prototype, 'set')
})

afterEach(() => {
    tokenCacheStub_get.restore()
    tokenCacheStub_set.restore()
})
