import { expect } from '@oclif/test'
import sinon from 'sinon'
import nock from 'nock'
import { BASE_URL } from '../../api/common'
import { DevCycleApiClient } from '../utils/api'
import { DevCycleAuth } from '../utils/auth'
import {
    createEnvironmentHandler,
    updateEnvironmentHandler,
} from './environmentTools'

const environment = {
    _id: '61450f3daec96f5cf4a49960',
    _project: '61450f3daec96f5cf4a49950',
    key: 'qa',
    name: 'QA',
    type: 'staging',
    _createdBy: 'user-id',
    createdAt: '2025-07-24T19:41:53.000Z',
    updatedAt: '2025-07-24T19:41:53.000Z',
}

describe('environmentTools', () => {
    let apiClient: DevCycleApiClient

    beforeEach(() => {
        const authStub = sinon.createStubInstance(DevCycleAuth)
        authStub.getAuthToken.returns('mock-auth-token')
        authStub.getProjectKey.returns('selected-project')
        authStub.getOrgId.returns('test-org-id')
        apiClient = new DevCycleApiClient(authStub)
    })

    afterEach(() => {
        sinon.restore()
        nock.cleanAll()
    })

    it('creates an environment without sending projectKey in the body', async () => {
        let body: Record<string, unknown> = {}
        const scope = nock(BASE_URL)
            .post('/v1/projects/arg-project/environments', (b) => {
                body = b
                return true
            })
            .reply(201, environment)

        const response = await createEnvironmentHandler(
            {
                projectKey: 'arg-project',
                key: 'qa',
                name: 'QA',
                type: 'staging',
                color: '#00FF00',
            },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(body).to.eql({
            key: 'qa',
            name: 'QA',
            type: 'staging',
            color: '#00FF00',
        })
        expect(response.dashboardLink).to.equal(
            'https://app.devcycle.com/o/test-org-id/settings/p/arg-project/environments',
        )
    })

    it('updates an environment by key in the selected project', async () => {
        let body: Record<string, unknown> = {}
        const scope = nock(BASE_URL)
            .patch('/v1/projects/selected-project/environments/qa', (b) => {
                body = b
                return true
            })
            .reply(200, { ...environment, name: 'Quality Assurance' })

        const response = await updateEnvironmentHandler(
            { key: 'qa', name: 'Quality Assurance' },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(body).to.eql({ name: 'Quality Assurance' })
        expect(response.result).to.include({ name: 'Quality Assurance' })
    })
})
