import { expect, test } from '@oclif/test'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
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
        .do(() => createConfigFile('project: app-devcycle-com', configPath))
        .command(['projects:current'])
        .it('displays the current project key', (ctx) => {
            expect(ctx.stdout).to.contain('Current project key: app-devcycle-com')
        })

    test
        .env({ CONFIG_PATH: configPath })
        .stdout()
        .do(() => createConfigFile('', configPath))
        .command(['projects:current'])
        .it('displays no project is currently selected', (ctx) => {
            expect(ctx.stdout).to.contain('No project is currently selected.')
        })

    test
        .env({ CONFIG_PATH: configPath })
        .stdout()
        .do(() => createConfigFile('not_a_project_key: some-value', configPath))
        .command(['projects:current'])
        .it('displays no project is currently selected when there is no project key in config', (ctx) => {
            expect(ctx.stdout).to.contain('No project is currently selected.')
        })
})
