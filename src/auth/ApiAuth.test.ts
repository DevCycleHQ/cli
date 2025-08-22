import * as assert from 'assert'
import { ApiAuth } from './ApiAuth'
import sinon from 'sinon'
import fs from '../utils/fileSystem'
import Writer from '../ui/writer'
import { tokenCacheStub_get } from '../../test/setup'
import test from '@oclif/test'
import { AUTH_URL } from '../api/common'
import { CLI_CLIENT_ID } from './SSOAuth'
import * as config from './config'

const envVars = process.env
const MOCK_AUTH_PATH = 'test-utils/fixtures/auth/mock-auth.yml'

const expiredToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlhpTzk1Xzllbk53Z1NNSkZRSXZNUiJ9.eyJodHRwczovL2RldmN5Y2xlLmNvbS9vcmdfaWQiOiJvcmdfVTlGOFlNYVRDaFRFbmRXdyIsImlzcyI6Imh0dHBzOi8vYXV0aC5kZXZjeWNsZS5jb20vIiwic3ViIjoiaHNWQm1Scmg1UDlBR2FBSDBlS0dwajMxQ1I1WkxuM3ZAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vYXBpLmRldmN5Y2xlLmNvbS8iLCJpYXQiOjE2OTU3NTAxNDUsImV4cCI6MTY5NTgzNjU0NSwiYXpwIjoiaHNWQm1Scmg1UDlBR2FBSDBlS0dwajMxQ1I1WkxuM3YiLCJzY29wZSI6ImNyZWF0ZTpyZXNvdXJjZXMgdXBkYXRlOnJlc291cmNlcyByZWFkOnJlc291cmNlcyBkZWxldGU6cmVzb3VyY2VzIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOnJlc291cmNlcyIsInVwZGF0ZTpyZXNvdXJjZXMiLCJyZWFkOnJlc291cmNlcyIsImRlbGV0ZTpyZXNvdXJjZXMiXX0.sQn49xJWdcE1xt6r3W8eBrvnUFFP3zOBOJXvjsOOzbfeOPMOeWyR0iqBZ8n96rxtB7wcgR0SB_uk3avNv0zd4X6x-Z4Jv2S0krIPUidTegfO_VLZiSA3uIBiZ--9IZtOLuaQhc16Qq6ezXGibVkFpc6JNLFELVpDQA87pmhF_RoErlH7U_qYuFeYEX_8qksDgeVxYoUOam2O5LksN8BorpzBZ8fikQkHibryqq4MLJvcksDUBwn17H67sGP6wUxWnNbzSksmNqsbKjLSQRvwoQgBL6O6uOW_cGiwnptOcXTz4XC640z2gXRa7FxSHzWKHOGpDRxi6erFSMQIB8_Jow'

afterEach(() => {
    process.env = envVars
    sinon.restore()
})

describe('ApiAuth', () => {
    const mockWriter = new Writer()

    describe('getToken', () => {
        test.nock(AUTH_URL, (api) =>
            api
                .post('/oauth/token', {
                    grant_type: 'client_credentials',
                    client_id: 'flag-client-id',
                    client_secret: 'flag-client-secret',
                    audience: 'https://api.devcycle.com/',
                })
                .reply(200, { access_token: 'mock-token-flag-creds' }),
        ).it(
            'fetches token using client id & secret when passed as flags',
            async () => {
                const auth = new ApiAuth(
                    MOCK_AUTH_PATH,
                    'mock-cache-dir',
                    mockWriter,
                )
                tokenCacheStub_get.returns(null)
                const flags = {
                    'client-id': 'flag-client-id',
                    'client-secret': 'flag-client-secret',
                }
                const response = await auth.getToken(flags)

                assert.equal(response, 'mock-token-flag-creds')
            },
        )

        test.nock(AUTH_URL, (api) =>
            api
                .post('/oauth/token', {
                    grant_type: 'client_credentials',
                    client_id: 'env-client-id',
                    client_secret: 'env-client-secret',
                    audience: 'https://api.devcycle.com/',
                })
                .reply(200, { access_token: 'mock-token-env-creds' }),
        ).it(
            'fetches token using client id & secret when passed as env vars',
            async () => {
                const auth = new ApiAuth(
                    MOCK_AUTH_PATH,
                    'mock-cache-dir',
                    mockWriter,
                )
                process.env.DEVCYCLE_CLIENT_ID = 'env-client-id'
                process.env.DEVCYCLE_CLIENT_SECRET = 'env-client-secret'
                tokenCacheStub_get.returns(null)
                const flags = {}
                const response = await auth.getToken(flags)

                assert.equal(response, 'mock-token-env-creds')
            },
        )

        test.nock(AUTH_URL, (api) =>
            api
                .post('/oauth/token', {
                    grant_type: 'client_credentials',
                    client_id: 'config-client-id',
                    client_secret: 'config-client-secret',
                    audience: 'https://api.devcycle.com/',
                })
                .reply(200, { access_token: 'mock-token-config-creds' }),
        ).it(
            'fetches token using client id & secret from auth config',
            async () => {
                const auth = new ApiAuth(
                    MOCK_AUTH_PATH,
                    'mock-cache-dir',
                    mockWriter,
                )
                tokenCacheStub_get.returns(null)
                sinon.stub(fs, 'existsSync').returns(true)
                sinon.stub(fs, 'readFileSync').returns(
                    JSON.stringify({
                        clientCredentials: {
                            client_id: 'config-client-id',
                            client_secret: 'config-client-secret',
                        },
                    }),
                )
                const flags = {}
                const response = await auth.getToken(flags)

                assert.equal(response, 'mock-token-config-creds')
            },
        )

        it('returns token from cache if available', async () => {
            const auth = new ApiAuth(
                MOCK_AUTH_PATH,
                'mock-cache-dir',
                mockWriter,
            )
            const flags = {
                'client-id': 'mock-client-id',
                'client-secret': 'mock-client-secret',
            }
            tokenCacheStub_get.returns('mock-cached-token')
            const response = await auth.getToken(flags)

            sinon.assert.calledWith(
                tokenCacheStub_get,
                'mock-client-id',
                'mock-client-secret',
            )
            assert.equal(response, 'mock-cached-token')
        })

        it('returns sso token from auth file if available', async () => {
            const auth = new ApiAuth(
                MOCK_AUTH_PATH,
                'mock-cache-dir',
                mockWriter,
            )
            const flags = {}
            sinon.stub(fs, 'existsSync').returns(true)
            sinon.stub(fs, 'readFileSync').returns(
                JSON.stringify({
                    sso: { accessToken: 'mock-config-token' },
                }),
            )

            const response = await auth.getToken(flags)

            assert.equal(response, 'mock-config-token')
        })

        test.nock(AUTH_URL, (api) =>
            api
                .post('/oauth/token', {
                    client_id: CLI_CLIENT_ID,
                    grant_type: 'refresh_token',
                    refresh_token: 'mock-config-refresh-token',
                    audience: 'https://api.devcycle.com/',
                })
                .reply(200, {
                    access_token: 'mock-refreshed-token',
                    refresh_token: 'mock-new-refresh-token',
                }),
        ).it(
            'refreshes sso token from auth file when nearing expiration',
            async () => {
                const auth = new ApiAuth(
                    MOCK_AUTH_PATH,
                    'mock-cache-dir',
                    mockWriter,
                )
                const flags = {}
                sinon.stub(fs, 'existsSync').returns(true)
                sinon.stub(fs, 'readFileSync').returns(
                    JSON.stringify({
                        sso: {
                            accessToken: expiredToken,
                            refreshToken: 'mock-config-refresh-token',
                        },
                    }),
                )
                const storeAccessTokenStub = sinon.stub(
                    config,
                    'storeAccessToken',
                )

                const response = await auth.getToken(flags)

                sinon.assert.calledWith(
                    storeAccessTokenStub,
                    {
                        accessToken: 'mock-refreshed-token',
                        refreshToken: 'mock-new-refresh-token',
                    },
                    MOCK_AUTH_PATH,
                )
                assert.equal(response, 'mock-refreshed-token')
            },
        )

        it('does not refresh sso token if refresh is already in progress', async () => {
            const auth = new ApiAuth(
                MOCK_AUTH_PATH,
                'mock-cache-dir',
                mockWriter,
            )
            auth.refreshInProgress = true
            const flags = {}
            sinon.stub(fs, 'existsSync').returns(true)
            sinon.stub(fs, 'readFileSync').returns(
                JSON.stringify({
                    sso: {
                        accessToken: expiredToken,
                        refreshToken: 'mock-config-refresh-token',
                    },
                }),
            )
            const storeAccessTokenStub = sinon.stub(config, 'storeAccessToken')

            const response = await auth.getToken(flags)

            sinon.assert.notCalled(storeAccessTokenStub)
            assert.equal(response, expiredToken)
        })
    })
})
