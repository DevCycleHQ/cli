import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('targeting get', () => {
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

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/configurations`)
            .reply(200, mockTargeting)
        )
        .stdout()
        .command(['targeting get', featureKey, ...authFlags])
        .it('returns all targeting for a feature',
            (ctx) => {
                expect(ctx.stdout).to.contain(JSON.stringify(mockTargeting, null, 2))
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=development`)
            .reply(200, mockTargeting)
        )
        .stdout()
        .command(['targeting get', featureKey, 'development', ...authFlags])
        .it('includes environment in query params',
            (ctx) => {
                expect(ctx.stdout).to.contain(JSON.stringify(mockTargeting, null, 2))
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .get(`/v1/projects/${projectKey}/features/prompted-feature-id/configurations`)
            .reply(200, mockTargeting)
        )
        .stub(inquirer, 'prompt', () => {
            return { feature: 'prompted-feature-id' }
        })
        .stdout()
        .command(['targeting get', ...authFlags])
        .it('uses prompts when feature is not provided',
            (ctx) => {
                expect(ctx.stdout).to.contain(JSON.stringify(mockTargeting, null, 2))
            })

    dvcTest() 
        .stdout()
        .command(['targeting get', '--headless', ...authFlags])
        .it('does not prompt when using --headless',
            (ctx) => {
                expect(ctx.stdout).to.contain('Feature argument is required')
            })
})