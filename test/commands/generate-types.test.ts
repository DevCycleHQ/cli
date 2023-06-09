import { expect, test } from '@oclif/test'
import { AUTH_URL, BASE_URL } from '../../src/api/common'
import * as fs from 'fs'

const mockVariablesResponse = [
    {
        'name': 'enum-var',
        'key': 'enum-var',
        'type': 'String',
        'validationSchema': {
            'schemaType': 'enum',
            'enumValues': [
                'Hello',
                'Hey',
                'Hi'
            ],
        }
    },
    {
        'name': 'regex-var',
        'key': 'regex-var',
        'type': 'String',
        'validationSchema': {
            'schemaType': 'regex',
            'regexPattern': '^test.*$',
        }
    },
    {
        'name': 'string-var',
        'key': 'string-var',
        'type': 'String',
    },
    {
        'name': 'boolean-var',
        'key': 'boolean-var',
        'type': 'Boolean',
    },
    {
        'name': 'number-var',
        'key': 'number-var',
        'type': 'Number',
    },
    {
        'name': 'json-var',
        'key': 'json-var',
        'type': 'JSON',
    }
]

const artifactsDir = './test/artifacts/'
const jsOutputDir = artifactsDir + 'generate/js'
const reactOutputDir = artifactsDir + 'generate/react'

const expectedTypesString = `type DVCJSON = { [key: string]: string | boolean | number }

export type DVCVariableTypes = {
    'enum-var': 'Hello' | 'Hey' | 'Hi'
    'regex-var': string
    'string-var': string
    'boolean-var': boolean
    'number-var': number
    'json-var': DVCJSON
}`

const expectedReactTypesString = `import { DVCVariable, DVCVariableValue } from '@devcycle/devcycle-js-sdk'
import {
    useVariable as originalUseVariable,
    useVariableValue as originalUseVariableValue
} from '@devcycle/devcycle-react-sdk'

type DVCJSON = { [key: string]: string | boolean | number }

export type DVCVariableTypes = {
    'enum-var': 'Hello' | 'Hey' | 'Hi'
    'regex-var': string
    'string-var': string
    'boolean-var': boolean
    'number-var': number
    'json-var': DVCJSON
}

export type UseVariableValue = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: T
) => DVCVariable<T>['value']

export const useVariableValue: UseVariableValue = originalUseVariableValue

export type UseVariable = <
    K extends string & keyof DVCVariableTypes,
    T extends DVCVariableValue & DVCVariableTypes[K],
>(
    key: K,
    defaultValue: T
) => DVCVariable<T>

export const useVariable: UseVariable = originalUseVariable`

describe('generate types', () => {
    after(() => {
        fs.rmSync(artifactsDir, { recursive: true })
    })

    test
        .nock(AUTH_URL, (api) => {
            api.post('/oauth/token', {
                grant_type: 'client_credentials',
                client_id: 'client',
                client_secret: 'secret',
                audience: 'https://api.devcycle.com/',
            }).reply(200, {
                access_token: 'token'
            })
        })
        .nock(BASE_URL, { reqheaders: { authorization: 'token' } }, (api) =>
            api.get('/v1/projects/project/variables?perPage=1000&page=1&status=active')
                .reply(200, mockVariablesResponse)
        )
        .stdout()
        .command([
            'generate:types',
            '--output-dir', jsOutputDir,
            '--client-id', 'client',
            '--client-secret', 'secret',
            '--project', 'project'
        ])
        .it('correctly generates JS SDK types', (ctx) => {
            const outputDir = jsOutputDir + '/dvcVariableTypes.ts'
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).to.equal(expectedTypesString)
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
        })

    test
        .nock(AUTH_URL, (api) => {
            api.post('/oauth/token', {
                grant_type: 'client_credentials',
                client_id: 'client',
                client_secret: 'secret',
                audience: 'https://api.devcycle.com/',
            }).reply(200, {
                access_token: 'token'
            })
        })
        .nock(BASE_URL, { reqheaders: { authorization: 'token' } }, (api) =>
            api.get('/v1/projects/project/variables?perPage=1000&page=1&status=active')
                .reply(200, mockVariablesResponse)
        )
        .stdout()
        .command([
            'generate:types',
            '--react',
            '--output-dir', reactOutputDir,
            '--client-id', 'client',
            '--client-secret', 'secret',
            '--project', 'project'
        ])
        .it('correctly generates React SDK types', (ctx) => {
            const outputDir = reactOutputDir + '/dvcVariableTypes.ts'
            expect(fs.existsSync(outputDir)).to.be.true
            const typesString = fs.readFileSync(outputDir, 'utf-8')
            expect(typesString).to.equal(expectedReactTypesString)
            expect(ctx.stdout).to.contain(`Generated new types to ${outputDir}`)
        })
})
