import 'reflect-metadata'
import { expect, test } from '@oclif/test'
import jsYaml from 'js-yaml'
import { RepoConfigFromFile, UserConfigFromFile } from '../../types'
import { AuthConfig } from '../../auth/config'
import defaultFiles from '../../utils/files/defaultFiles'
import Roots from '../../utils/files/roots'
import MockDVCFiles from '../../utils/files/mockDvcFiles'
import DVCFiles from '../../utils/files/dvcFiles'

const loggedInAsUser = () => {
    const auth = new AuthConfig()
    auth.sso = { accessToken: 'mockAccessToken' }

    const user = new UserConfigFromFile()
    user.org = {
        display_name: 'User Org ID',
        name: 'user_org_name',
        id: 'user_org_id'
    }
    user.project = 'user_project'

    return new MockDVCFiles({
        [Roots.auth]: {
            [defaultFiles.auth]: jsYaml.dump(auth)
        },
        [Roots.user]: {
            [defaultFiles.user]: jsYaml.dump(user)
        }
    })
}

const loggedInAsRepo = () => {
    const auth = new AuthConfig()
    auth.sso = { accessToken: 'mockAccessToken' }

    const repo = new RepoConfigFromFile()
    repo.org = {
        display_name: 'User Org ID',
        name: 'user_org_name',
        id: 'user_org_id'
    }
    repo.project = 'user_project'

    return new MockDVCFiles({
        [Roots.auth]: {
            [defaultFiles.auth]: jsYaml.dump(auth)
        },
        [Roots.repo]: {
            [defaultFiles.repo]: jsYaml.dump(repo)
        }
    })
}

describe('status command headless', () => {
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['status', '--headless'])
        .it('uses the default config paths', (ctx) => {
            const output = JSON.parse(ctx.stdout)
            expect(output).property('repoConfigPath', '.devcycle/config.yml')
            expect(output).property('userConfigPath')
            expect(output).property('authConfigPath')
            // these paths are platform-specific, so we can't expect the full path
            expect(output.userConfigPath).to.have.string('.config/devcycle/user.yml')
            expect(output.authConfigPath).to.have.string('.config/devcycle/auth.yml')
        })
    
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command([
            'status',
            '--headless',
            '--repo-config-path=./overriden/path/repo/newrepofile.yml',
            '--config-path=./overriden/path/user/newuserfile.yml',
            '--auth-path=./overriden/path/auth/newauthfile.yml',
        ])
        .it('uses overridden file names', (ctx) => {
            const output = JSON.parse(ctx.stdout)
            expect(output).property('repoConfigPath', 'overriden/path/repo/newrepofile.yml')
            expect(output).property('userConfigPath', 'overriden/path/user/newuserfile.yml')
            expect(output).property('authConfigPath', 'overriden/path/auth/newauthfile.yml')
        })

    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['status', '--headless'])
        .it('shows logged out state', (ctx) => {
            const output = JSON.parse(ctx.stdout)
            expect(output).property('repoConfigExists', false)
            expect(output).property('userConfigExists', false)
            expect(output).property('hasAccessToken', false)
        })

    test
        .do(() => DVCFiles.setInstance(loggedInAsUser()))
        .stdout()
        .command(['status', '--headless'])
        .it('shows logged in state with user config', (ctx) => {
            const output = JSON.parse(ctx.stdout)
            expect(output).property('repoConfigExists', false)
            expect(output).property('userConfigExists', true)
            expect(output).property('hasAccessToken', true)
        })

    test
        .do(() => DVCFiles.setInstance(loggedInAsRepo()))
        .stdout()
        .command(['status', '--headless'])
        .it('shows logged in state with repo config', (ctx) => {
            const output = JSON.parse(ctx.stdout)
            expect(output).property('repoConfigExists', true)
            expect(output).property('userConfigExists', false)
            expect(output).property('hasAccessToken', true)
        })
})

describe('status command', () => {
    test
        .do(() => DVCFiles.setInstance(new MockDVCFiles()))
        .stdout()
        .command(['status'])
        .it('shows logged out state', (ctx) => {
            expect(ctx.stdout).to.contain('No repo config loaded')
            expect(ctx.stdout).to.contain('No user config loaded')
            expect(ctx.stdout).to.contain('Currently not logged in to DevCycle')
        })
})