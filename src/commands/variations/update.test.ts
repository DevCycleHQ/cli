import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('variations update', () => {
    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']
    const featureKey = 'spam'
    const variationKey = 'variation'
    const requestBody = {
        'name': 'SPAM SPAM SPAM',
        'key': 'spam',
        '_feature': '646f8bb69302b0862fd68a39',
        'type': 'String'
    }
    const mockFeature = {
        '_id': '63b5eea3e6e91987bae47f3a',
        '_project': '63b5ee5de6e91987bae47f01',
        'source': 'dashboard',
        'type': 'experiment',
        'name': 'First Feature',
        'description': '',
        '_createdBy': 'google-oauth2|111559006563333334214',
        'createdAt': '2023-01-04T21:24:51.870Z',
        'updatedAt': '2023-06-16T19:27:14.862Z',
        'variations': [
            {
                '_id': '63b5eea3e6e91987bae47f40',
                'key': 'control',
                'name': 'Control',
                'variables': {}
            },
            {
                '_id': '63b5eea3e6e91987bae47f41',
                'key': 'variation-a',
                'name': 'Variation A',
                'variables': {}
            },
            {
                '_id': '63b5eea3e6e91987bae47f42',
                'key': 'variation-b',
                'name': 'Variation B',
                'variables': {}
            }
        ],
        'controlVariation': 'control',
        'variables': [
            {
                '_id': '63b5eea3e6e91987bae47f3c',
                '_project': '63b5ee5de6e91987bae47f01',
                '_feature': '63b5eea3e6e91987bae47f3a',
                'name': 'first-feature',
                'key': 'first-feature',
                'type': 'Boolean',
                'status': 'active',
                'defaultValue': false,
                'source': 'dashboard',
                '_createdBy': 'google-oauth2|111559006563333334214',
                'createdAt': '2023-01-04T21:24:51.877Z',
                'updatedAt': '2023-01-04T21:24:51.877Z'
            }
        ],
        'tags': [],
        'readonly': false,
        'settings': {
            'optInEnabled': false,
            'publicName': '',
            'publicDescription': ''
        },
        'sdkVisibility': {
            'client': false,
            'mobile': false,
            'server': true
        }
    }
    // Headless mode
    dvcTest()
        .nock(BASE_URL, (api) => api
            .patch(`/v1/projects/${projectKey}/features/${featureKey}/variations/${variationKey}`, requestBody)
            .reply(200, mockFeature)
        )
        .stdout()
        .command([
            `variations update ${featureKey} ${variationKey}`,
            '--project', projectKey,
            '--name', requestBody.name,
            '--key', requestBody.key,
            ...authFlags
        ])
        .it('returns a new variable',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockFeature)
            })

    // dvcTest()
    //     .nock(BASE_URL, (api) => api
    //         .post(`/v1/projects/${projectKey}/variables`, requestBody)
    //         .reply(200, mockVariable)
    //     )
    //     .stub(inquirer, 'prompt', () => {
    //         return { key: requestBody.key, description: undefined }
    //     })
    //     .stdout()
    //     .command([
    //         'variables create',
    //         '--project', projectKey,
    //         '--feature', requestBody._feature,
    //         '--type', requestBody.type,
    //         '--name', requestBody.name,
    //         ...authFlags
    //     ])
    //     .it('prompts for missing key and description, and returns a variable',
    //         (ctx) => {
    //             expect(JSON.parse(ctx.stdout)).to.eql(mockVariable)
    //         })
    //
    // dvcTest()
    //     .stdout()
    //     .command([
    //         'variables create',
    //         '--project', projectKey,
    //         '--feature', requestBody._feature,
    //         '--type', requestBody.type,
    //         '--name', requestBody.name,
    //         '--headless',
    //         ...authFlags
    //     ])
    //     .it('Errors when called in headless mode with no key',
    //         (ctx) => {
    //             expect(ctx.stdout).to.contain('The key, name, feature, and type flags are required')
    //         })

})
