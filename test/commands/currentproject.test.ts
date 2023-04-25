import { expect, test } from '@oclif/test'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { BASE_URL } from '../../src/api/common'
import { mockProjects } from '../mocks'
import * as tmp from 'tmp'

function createConfigFile(content: string, configPath: string) {
    mkdirSync(join(configPath, '..'), { recursive: true })
    writeFileSync(configPath, content, 'utf8')
}

const tempDir = tmp.dirSync({ unsafeCleanup: true })
const configPath = join(tempDir.name, '.devcycle/config.yaml')

describe('projects:current', () => {
    test
        .env({ CONFIG_PATH: configPath })
        .stdout()
        .do(() => createConfigFile('project: PROJECT_KEY', configPath))
        .command(['projects:current'])
        .it('displays the current project key', (ctx) => {
            expect(ctx.stdout).to.contain('Current project key: PROJECT_KEY\n')
        })

    test
        .env({ CONFIG_PATH: configPath })
        .stdout()
        .do(() => createConfigFile('', configPath))
        .command(['projects:current'])
        .it('displays no project is currently selected', (ctx) => {
            expect(ctx.stdout).to.contain('No project is currently selected.\n')
        })

    test
        .env({ CONFIG_PATH: configPath })
        .stdout()
        .do(() => createConfigFile('not_a_project_key: some-value', configPath))
        .command(['projects:current'])
        .it('displays no project is currently selected when there is no project key in config', (ctx) => {
            expect(ctx.stdout).to.contain('No project is currently selected.\n')
        })

    test
        .env({ CONFIG_PATH: configPath })
        .nock('BASE_URL', (api) =>
            api.get('/v1/projects').reply(200, mockProjects)
        )
        .stdout()
        .do(() => createConfigFile('project: PROJECT_KEY', configPath))
        .command(['projects:current', '-v'])
        .it('displays verbose information about the current project', (ctx) => {
            expect(ctx.stdout).to.contain('Current project key: PROJECT_KEY\n')
            expect(ctx.stdout).to.contain('Project Name: Project 1\n')
            expect(ctx.stdout).to.contain('Project Description: Description for Project 1\n')
        })
})
