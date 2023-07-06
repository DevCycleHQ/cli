import { expect } from '@oclif/test'
import chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import inquirer from 'inquirer'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('targeting get', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    const projectKey = 'test-project'
    const featureKey = 'test-feature'
    const authFlags = [
        '--project', projectKey,
        '--client-id', 'test-client-id',
        '--client-secret', 'test-client-secret'
    ]

    const mockTargeting = [
        {
            '_feature': '642d9de38bbfc09ad0657e05',
            '_environment': '637cfe8195279288bc08cb61',
            '_createdBy': 'google-oauth2|112946554154333301873',
            'status': 'active',
            'startedAt': '2023-04-05T16:12:19.911Z',
            'updatedAt': '2023-04-05T16:12:19.922Z',
            'targets': [
                {
                    '_id': '642d9de38bbfc09ad0657e1c',
                    'audience': {
                        'name': 'All Users',
                        'filters': {
                            'operator': 'and',
                            'filters': [{ 'type': 'all' }]
                        }
                    },
                    'distribution': [{
                        '_variation': '642d9de38bbfc09ad0657e09',
                        'percentage': 1
                    }]
                }
            ],
            'readonly': false
        },
        {
            '_feature': '642d9de38bbfc09ad0657e05',
            '_environment': '637cfe8195279288bc08cb62',
            '_createdBy': 'google-oauth2|112946554154333301873',
            'status': 'inactive',
            'updatedAt': '2023-04-05T16:12:19.923Z',
            'targets': [{
                '_id': '642d9de38a131fadcb5051b0',
                'audience': {
                    'name': 'All Users',
                    'filters': {
                        'operator': 'and',
                        'filters': [{ 'type': 'all' }]
                    }
                },
                'distribution': [{
                    '_variation': '642d9de38bbfc09ad0657e09',
                    'percentage': 1
                }]
            }],
            'readonly': false
        },
        {
            '_feature': '642d9de38bbfc09ad0657e05',
            '_environment': '637cfe8195279288bc08cb63',
            '_createdBy': 'google-oauth2|112946554154333301873',
            'status': 'inactive',
            'updatedAt': '2023-04-05T16:12:20.174Z',
            'targets': [],
            'readonly': false
        },
        {
            '_feature': '642d9de38bbfc09ad0657e05',
            '_environment': '647f62ae749bbe90fb222070',
            'status': 'inactive',
            'targets': [],
            'readonly': false
        }
    ]

    const mockEnvironments = [
        {
            key: 'development',
            name: 'Development',
            _id: '647f62ae749bbe90fb222070'
        },
        {
            key: 'testing',
            name: 'Testing',
            _id: '637cfe8195279288bc08cb63'
        },
        {
            key: 'staging',
            name: 'Staging',
            _id: '637cfe8195279288bc08cb62'
        },
        {
            key: 'production',
            name: 'Production',
            _id: '637cfe8195279288bc08cb61'
        }
    ]
    const mockVariations = [
        {
            key: 'variation-on',
            name: 'Variation ON',
            variables: {},
            _id: '642d9de38bbfc09ad0657e09'
        }
    ]

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/configurations`)
            .reply(200, mockTargeting)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/variations`)
            .reply(200, mockVariations)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/environments`)
            .reply(200, mockEnvironments)
        )
        .stdout()
        .command(['targeting get', featureKey, ...authFlags])
        .it('returns all targeting for a feature', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=development`)
            .reply(200, mockTargeting)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/variations`)
            .reply(200, mockVariations)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/environments`)
            .reply(200, mockEnvironments)
        )
        .stdout()
        .command(['targeting get', featureKey, 'development', ...authFlags])
        .it('includes environment in query params',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/prompted-feature-id/configurations`)
            .reply(200, mockTargeting)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/prompted-feature-id/variations`)
            .reply(200, mockVariations)
        )
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/environments`)
            .reply(200, mockEnvironments)
        )
        .stub(inquirer, 'prompt', () => {
            return { feature:  { key: 'prompted-feature-id' } }
        })
        .stdout()
        .command(['targeting get', ...authFlags])
        .it('uses prompts when feature is not provided',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            })

    dvcTest()
        .stdout()
        .command(['targeting get', '--headless', ...authFlags])
        .it('does not prompt when using --headless',
            (ctx) => {
                expect(ctx.stdout).to.contain('Feature argument is required')
            })
})
