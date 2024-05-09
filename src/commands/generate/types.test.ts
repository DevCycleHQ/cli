import { expect } from '@oclif/test'
import { BASE_URL } from '../../api/common'
import { dvcTest, setCurrentTestFile } from '../../../test-utils'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import * as fs from 'fs'
import chai from 'chai'
import { Body, ReplyHeaders } from 'nock'

const mockVariablesResponse = [
    {
        _id: '644aae12eb9d66fdd57fbd04',
        name: 'enum-var',
        key: 'enum-var',
        type: 'String',
        description: 'Different ways to say hello',
        createdAt: '2021-07-04T20:00:00.000Z',
        _createdBy: 'user1',
        validationSchema: {
            schemaType: 'enum',
            enumValues: ['Hello', 'Hey', 'Hi'],
        },
    },
    {
        _id: '644aae12eb9d66fdd57fbd05',
        name: 'regex-var',
        key: 'regex-var',
        type: 'String',
        createdAt: '2021-07-04T20:00:00.000Z',
        _createdBy: 'user2',
        validationSchema: {
            schemaType: 'regex',
            regexPattern: '^test.*$',
        },
    },
    {
        _id: '644aae12eb9d66fdd57fcd04',
        name: 'string-var',
        key: 'string-var',
        type: 'String',
        _createdBy: 'user1',
        createdAt: '2021-07-04T20:00:00.000Z',
    },
    {
        _id: '644aae12eb9e66fdd57fbd04',
        name: 'boolean-var',
        key: 'boolean-var',
        type: 'Boolean',
        _createdBy: 'user2',
        createdAt: '2021-07-04T20:00:00.000Z',
    },
    {
        _id: '644aaf12eb9d66fdd57fbd04',
        name: 'number-var',
        key: 'number-var',
        type: 'Number',
        _createdBy: 'user1',
        createdAt: '2021-07-04T20:00:00.000Z',
    },
    {
        _id: '644bae12eb9d66fdd57fbd04',
        name: 'json-var',
        key: 'json-var',
        type: 'JSON',
        createdAt: '2021-07-04T20:00:00.000Z',
        _createdBy: 'api',
    },
]

const mockOrganizationMembersResponse = [
    {
        user_id: 'user1',
        name: 'User 1',
        email: 'test@gmail.com',
    },
    {
        user_id: 'user2',
        name: 'User 2',
        email: 'test2@gmail.com',
    },
] as Body

const mockOrganizationMembersResponseHeaders = {
    count: 2,
} as unknown as  ReplyHeaders

const artifactsDir = './test/artifacts/'
const jsOutputDir = artifactsDir + 'generate/js'
const reactOutputDir = artifactsDir + 'generate/react'

describe('generate types', () => {
    beforeEach(setCurrentTestFile(__filename))
    chai.use(jestSnapshotPlugin())

    after(() => {
        fs.rmSync(artifactsDir, { recursive: true })
    })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    '/v1/projects/project/variables?perPage=1000&page=1&status=active',
                )
                .reply(200, mockVariablesResponse)
                .get('/v1/organizations/current/members?perPage=100')
                .reply(200, mockOrganizationMembersResponse, mockOrganizationMembersResponseHeaders),
        )
        .stdout()
        .command([
            'generate:types',
            '--output-dir',
            jsOutputDir,
            '--client-id',
            'client',
            '--client-secret',
            'secret',
            '--project',
            'project',
        ])
        .it('correctly generates JS SDK types', (ctx) => {
            const outputDir = jsOutputDir + '/dvcVariableTypes.ts'
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    '/v1/projects/project/variables?perPage=1000&page=1&status=active',
                )
                .reply(200, mockVariablesResponse)
                .get('/v1/organizations/current/members?perPage=100')
                .reply(200, mockOrganizationMembersResponse, mockOrganizationMembersResponseHeaders),
        )
        .stdout()
        .command([
            'generate:types',
            '--react',
            '--output-dir',
            reactOutputDir,
            '--client-id',
            'client',
            '--client-secret',
            'secret',
            '--project',
            'project',
        ])
        .it('correctly generates React SDK types', (ctx) => {
            const outputDir = reactOutputDir + '/dvcVariableTypes.ts'
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).toMatchSnapshot()
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    '/v1/projects/project/variables?perPage=1000&page=1&status=active',
                )
                .reply(200, mockVariablesResponse)
                .get('/v1/organizations/current/members?perPage=100')
                .reply(200, mockOrganizationMembersResponse, mockOrganizationMembersResponseHeaders),
        )
        .stdout()
        .command([
            'generate:types',
            '--react',
            '--old-repos',
            '--output-dir',
            reactOutputDir,
            '--client-id',
            'client',
            '--client-secret',
            'secret',
            '--project',
            'project',
        ])
        .it(
            'correctly generates React SDK types with old-repos flag',
            (ctx) => {
                const outputDir = reactOutputDir + '/dvcVariableTypes.ts'
                expect(fs.existsSync(outputDir)).to.be.true
                const typesString = fs.readFileSync(outputDir, 'utf-8')
                expect(typesString).to.contain('@devcycle/devcycle-js-sdk')
                expect(typesString).to.contain('@devcycle/devcycle-react-sdk')
                expect(ctx.stdout).to.contain(
                    `Generated new types to ${outputDir}`,
                )
            },
        )

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    '/v1/projects/project/variables?perPage=1000&page=1&status=active',
                )
                .reply(200, mockVariablesResponse)
                .get('/v1/organizations/current/members?perPage=100')
                .reply(200, mockOrganizationMembersResponse, mockOrganizationMembersResponseHeaders),
        )
        .stdout()
        .command([
            'generate:types',
            '--output-dir',
            jsOutputDir,
            '--client-id',
            'client',
            '--client-secret',
            'secret',
            '--project',
            'project',
            '--include-descriptions',
            '--inline-comments',
        ])
        .it('correctly generates JS SDK types with inlined comments', (ctx) => {
            const outputDir = jsOutputDir + '/dvcVariableTypes.ts'
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).toMatchSnapshot()
        })

    dvcTest()
        .nock(BASE_URL, (api) =>
            api
                .get(
                    '/v1/projects/project/variables?perPage=1000&page=1&status=active',
                )
                .reply(200, mockVariablesResponse)
                .get('/v1/organizations/current/members?perPage=100')
                .reply(200, mockOrganizationMembersResponse, mockOrganizationMembersResponseHeaders),
        )
        .stdout()
        .command([
            'generate:types',
            '--output-dir',
            jsOutputDir,
            '--client-id',
            'client',
            '--client-secret',
            'secret',
            '--project',
            'project',
            '--obfuscate',
        ])
        .it('correctly generates JS SDK types with obfuscated keys', (ctx) => {
            const outputDir = jsOutputDir + '/dvcVariableTypes.ts'
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).toMatchSnapshot()
        })
})
