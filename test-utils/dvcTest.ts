import { test } from '@oclif/test'
import { AUTH_URL } from '../src/api/common'

export const dvcTest = () => test
    .nock(AUTH_URL, (api) => api
        .post('/oauth/token')
        .reply(200, { data: { access_token: 'test-token' } })
    )