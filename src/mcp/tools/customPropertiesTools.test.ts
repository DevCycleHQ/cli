import { expect } from '@oclif/test'
import sinon from 'sinon'
import nock from 'nock'
import { BASE_URL } from '../../api/common'
import { DevCycleApiClient } from '../utils/api'
import { DevCycleAuth } from '../utils/auth'
import {
    listCustomPropertiesHandler,
    createCustomPropertyHandler,
    updateCustomPropertyHandler,
    deleteCustomPropertyHandler,
} from './customPropertiesTools'

const customProperty = {
    _id: '61450f3daec96f5cf4a49970',
    _project: '61450f3daec96f5cf4a49950',
    key: 'plan',
    name: 'Plan',
    _createdBy: 'user-id',
    propertyKey: 'plan',
    type: 'String',
    createdAt: '2025-07-24T19:41:53.000Z',
    updatedAt: '2025-07-24T19:41:53.000Z',
}

describe('customPropertiesTools', () => {
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

    it('lists custom properties, forwarding filters but not projectKey', async () => {
        const scope = nock(BASE_URL)
            .get('/v1/projects/arg-project/customProperties')
            .query({ search: 'plan', type: 'String', perPage: '50' })
            .reply(200, [customProperty])

        const response = await listCustomPropertiesHandler(
            {
                projectKey: 'arg-project',
                search: 'plan',
                type: 'String',
                perPage: 50,
            },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(response.result).to.eql([customProperty])
        expect(response.dashboardLink).to.equal(
            'https://app.devcycle.com/o/test-org-id/p/arg-project/custom-properties',
        )
    })

    it('creates a custom property in the selected project', async () => {
        let body: Record<string, unknown> = {}
        const scope = nock(BASE_URL)
            .post('/v1/projects/selected-project/customProperties', (b) => {
                body = b
                return true
            })
            .reply(201, customProperty)

        await createCustomPropertyHandler(
            {
                key: 'plan',
                name: 'Plan',
                type: 'String',
                propertyKey: 'plan',
            },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(body).to.eql({
            key: 'plan',
            name: 'Plan',
            type: 'String',
            propertyKey: 'plan',
        })
    })

    it('updates a custom property by key without sending key or projectKey in the body', async () => {
        let body: Record<string, unknown> = {}
        const scope = nock(BASE_URL)
            .patch('/v1/projects/arg-project/customProperties/plan', (b) => {
                body = b
                return true
            })
            .reply(200, { ...customProperty, name: 'Billing Plan' })

        const response = await updateCustomPropertyHandler(
            { projectKey: 'arg-project', key: 'plan', name: 'Billing Plan' },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(body).to.eql({ name: 'Billing Plan' })
        expect(response.result).to.include({ name: 'Billing Plan' })
    })

    it('deletes a custom property', async () => {
        const scope = nock(BASE_URL)
            .delete('/v1/projects/selected-project/customProperties/plan')
            .reply(200)

        const response = await deleteCustomPropertyHandler(
            { key: 'plan' },
            apiClient,
        )

        expect(scope.isDone()).to.equal(true)
        expect(response.result).to.eql({
            message: "Custom property 'plan' deleted successfully",
        })
    })
})
