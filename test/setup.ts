import sinon from 'sinon'
import { TokenCache } from '../src/auth/TokenCache'

before(() => {
    sinon.stub(TokenCache.prototype, 'get').resolves('')
    sinon.stub(TokenCache.prototype, 'set').resolves()
})