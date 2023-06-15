import { expect } from '@oclif/test'
import inquirer from 'inquirer'
import { dvcTest } from '../../../test-utils'
import { BASE_URL } from '../../api/common'

describe('variables create', () => {
    const projectKey = 'test-project'
    const authFlags = ['--client-id', 'test-client-id', '--client-secret', 'test-client-secret']
    const requestBody = {
        'name': 'SPAM SPAM SPAM',
        'key': 'spam',
        '_feature': '646f8bb69302b0862fd68a39',
        'type': 'String'
    }
    const mockVariable = {
        '_id': '648a0d55c4e88cd4c4544c58',
        '_project': '63b5ee5de6e91987bae47f01',
        '_feature': '646f8bb69302b0862fd68a39',
        'name': 'SPAM SPAM SPAM',
        'key': 'spam',
        'description': 'spammity spam ',
        'type': 'String',
        'status': 'active',
        'source': 'cli',
        '_createdBy': 'google-oauth2|111559006563333334214',
        'createdAt': '2023-06-14T18:56:21.270Z',
        'updatedAt': '2023-06-14T18:56:21.270Z'
    }
    // Headless mode
    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/variables`, requestBody)
            .reply(200, mockVariable)
        )
        .stdout()
        .command([
            'variables create',
            '--project', projectKey,
            '--feature', requestBody._feature,
            '--type', requestBody.type,
            '--name', requestBody.name,
            '--key', requestBody.key,
            '--headless',
            ...authFlags
        ])
        .it('returns a new variable',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockVariable)
            })

    dvcTest()
        .nock(BASE_URL, (api) => api
            .post(`/v1/projects/${projectKey}/variables`, requestBody)
            .reply(200, mockVariable)
        )
        .stub(inquirer, 'prompt', () => {
            return { key: requestBody.key, description: undefined }
        })
        .stdout()
        .command([
            'variables create',
            '--project', projectKey,
            '--feature', requestBody._feature,
            '--type', requestBody.type,
            '--name', requestBody.name,
            ...authFlags
        ])

        .it('prompts for missing key and description, and returns a variable',
            (ctx) => {
                expect(JSON.parse(ctx.stdout)).to.eql(mockVariable)
            })

    dvcTest()
        .stdout()
        .command([
            'variables create',
            '--project', projectKey,
            '--feature', requestBody._feature,
            '--type', requestBody.type,
            '--name', requestBody.name,
            '--headless',
            ...authFlags
        ])
        .it('Errors when called in headless mode with no key',
            (ctx) => {
                expect(ctx.stdout).to.contain('the key, name, feature and type are required')
            })

})
