import { test } from '@oclif/test'
import { expect } from 'vitest'
import { BASE_URL } from '../../api/common'

describe('usages', () => {
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

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/nodejs.js',
        ])
        .it('runs against a node test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/[org_id]/nodejs.js',
        ])
        .it(
            'runs against a node test file with special characters in the path',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )

    test.stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/*/*.js'])
        .it('runs against all js files', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.nock(BASE_URL, (api) =>
        api
            .get(
                `/v1/projects/${projectKey}/variables?perPage=1000&page=1&status=active`,
            )
            .reply(200, [mockVariable]),
    )
        .stdout()
        .command([
            'usages',
            '--only-unused',
            '--include',
            'test-utils/fixtures/usages/nodejs.js',
            '--project',
            projectKey,
        ])
        .it(
            'runs against a node test file and only returns variables not found as a variable in the api',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )

    test.stdout()
        .command(['usages', '--include', 'test-utils/fixtures/usages/react.js'])
        .it('runs against a react test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/[org_id]/react.js',
        ])
        .it(
            'runs against a react test file with special characters in the path',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/golang.go',
        ])
        .it('runs against a go test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/[org_id]/golang.go',
        ])
        .it(
            'runs against a react test file with special characters in the path',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/sample.dart',
        ])
        .it('runs against a dart test file', (ctx) => {
            expect(ctx.stdout).toMatchSnapshot()
        })

    test.stdout()
        .command([
            'usages',
            '--include',
            'test-utils/fixtures/usages/[org_id]/sample.dart',
        ])
        .it(
            'runs against a dart test file with special characters in the path',
            (ctx) => {
                expect(ctx.stdout).toMatchSnapshot()
            },
        )
})
