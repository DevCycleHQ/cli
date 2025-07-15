import { runCommand, captureOutput } from '@oclif/test'
import { expect } from 'chai'
import chai from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { setCurrentTestFile } from '../../../test-utils'
import nock from 'nock'
import { BASE_URL } from '../../api/common'

describe('usages', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    const projectKey = 'test-project'
    const mockVariable = {
        _id: '648a0d55c4e88cd4c4544c58',
        _project: '63b5ee5de6e91987bae47f01',
        _feature: '646f8bb69302b0862fd68a39',
        name: 'SPAM SPAM SPAM',
        key: 'variable-from-api',
        description: 'spammity spam ',
        type: 'String',
        status: 'active',
        source: 'cli',
        _createdBy: 'google-oauth2|111559006563333334214',
        createdAt: '2023-06-14T18:56:21.270Z',
        updatedAt: '2023-06-14T18:56:21.270Z',
    }

    it('runs against a node test file', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/nodejs.js',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a node test file with special characters in the path', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/[org_id]/nodejs.js',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against all js files', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand(['usages', '--include', 'test-utils/fixtures/usages/*/*.js'])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a node test file and only returns variables not found as a variable in the api', async () => {
        nock(BASE_URL)
            .get(`/v1/projects/${projectKey}/variables?perPage=1000&page=1&status=active`)
            .reply(200, [mockVariable])

        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--only-unused',
                '--include',
                'test-utils/fixtures/usages/nodejs.js',
                '--project',
                projectKey,
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a react test file', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand(['usages', '--include', 'test-utils/fixtures/usages/react.js'])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a react test file with special characters in the path', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/[org_id]/react.js',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a go test file', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/golang.go',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a react test file with special characters in the path', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/[org_id]/golang.go',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a dart test file', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/sample.dart',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })

    it('runs against a dart test file with special characters in the path', async () => {
        const { stdout } = await captureOutput(async () => {
            await runCommand([
                'usages',
                '--include',
                'test-utils/fixtures/usages/[org_id]/sample.dart',
            ])
        })
        expect(stdout).toMatchSnapshot()
    })
})
