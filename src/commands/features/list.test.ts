import { expect } from 'vitest'
import { dvcTest } from '../../../test-utils'
import { AUTH_URL, BASE_URL } from '../../api/common'
import axios from 'axios'
import { tokenCacheStub_get } from '../../../test/setup'

describe('features list', () => {
    const projectKey = 'test-project'
    const fullFeature = {
        key: 'first-feature',
        name: 'first feature',
        _id: 'id1',
        _project: 'string',
        source: 'api',
        _createdBy: 'string',
        createdAt: '2019-08-24T14:15:22Z',
        updatedAt: '2019-08-24T14:15:22Z',
        variations: [],
        controlVariation: 'variation_id',
        variables: [],
        tags: [],
        ldLink: 'string',
        readonly: true,
        settings: {},
        sdkVisibility: { mobile: true, client: true, server: true },
    }
    const fullFeature2 = { ...fullFeature, key: 'second-feature', name: 'second feature', _id: 'id2' }

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api.get(`/v2/projects/${projectKey}/features`).reply(200, [
                fullFeature,
                fullFeature2,
            ]),
        )
        .stdout()
        .command([
            'features list',
            '--project',
            projectKey,
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('returns a list of feature keys', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(`/v2/projects/${projectKey}/features?page=2&perPage=10`)
                .reply(200, []),
        )
        .stdout()
        .command([
            'features list',
            '--project',
            projectKey,
            '--page',
            '2',
            '--per-page',
            '10',
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('passes pagination params to api', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .do(async () => {
            tokenCacheStub_get.returns('mock-cached-token')
            await axios.post(new URL('/oauth/token', AUTH_URL).href)
        })
        .nock(BASE_URL, (api) =>
            api
                .get(
                    `/v2/projects/${projectKey}/features?search=search`,
                )
                .reply(200, []),
        )
        .stdout()
        .command([
            'features list',
            '--project',
            projectKey,
            '--search',
            'search',
            '--client-id',
            'test-client-id',
            '--client-secret',
            'test-client-secret',
        ])
        .it('passes search param to api', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })
})
