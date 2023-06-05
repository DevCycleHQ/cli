import 'reflect-metadata'

import { Flags } from '@oclif/core'
import { fetchOrganizations, Organization } from '../api/organizations'
import { fetchProjects, Project } from '../api/projects'
import SSOAuth from '../api/ssoAuth'
import { storeAccessToken } from '../auth/config'
import { promptForOrganization } from '../ui/promptForOrganization'
import { promptForProject } from '../ui/promptForProject'
import Base from './base'
export default abstract class AuthCommand extends Base {
    static flags = {
        ...Base.flags,
        'org': Flags.string({
            description: 'The `name` of the org to sign in as (not the `display_name`)',
        }),
    }

    public async setOrganization(): Promise<void> {
        const { flags } = await this.parse(AuthCommand)
        const organizations = await fetchOrganizations(this.token)
        if (flags.headless && !flags.org) {
            return this.writer.showResults(organizations.map((org) => org.name))
        }
        const selectedOrg = await this.retrieveOrganization(organizations)
        this.token = await this.selectOrganization(selectedOrg)
    }

    public async setProject(): Promise<void> {
        const { flags } = await this.parse(AuthCommand)
        const projects = await fetchProjects(this.token)
        if (flags.headless && !flags.project) {
            return this.writer.showResults(projects.map((project) => project.key))
        }
        const selectedProject = await this.retrieveProject(projects)
        await this.saveProject(selectedProject)
    }

    public async setOrganizationAndProject(): Promise<void> {
        await this.setOrganization()
        await this.setProject()
    }

    public async saveProject(project: Project): Promise<void> {
        if (this.repoConfig) {
            await this.updateRepoConfig({ project: project.key })
        }
        await this.updateUserConfig({ project: project.key })
    }

    public async retrieveProjectFromConfig(projects: Project[]): Promise<Project | null> {
        const savedProject = this.repoConfig?.project || this.userConfig?.project
        if (savedProject) {
            const matchingProject = projects.find((project) => project.key === savedProject)
            if (matchingProject) {
                return matchingProject
            }
        }
        return null
    }

    private async retrieveProject(projects: Project[]): Promise<Project> {
        const { flags } = await this.parse(AuthCommand)
        if (flags.project) {
            return this.projectFromFlag(projects)
        } else {
            return await this.retrieveProjectFromConfig(projects) || promptForProject(projects)
        }
    }

    public async projectFromFlag(projects: Project[]): Promise<Project> {
        const { flags } = await this.parse(AuthCommand)
        const matchingProject = projects.find((project) => project.key === flags.project)
        if (!matchingProject) {
            throw (new Error(`There is no project with the key ${flags.project} in this organization`))
        }
        return matchingProject
    }

    public async retrieveOrganizationFromConfig(): Promise<Organization | undefined> {
        return this.repoConfig?.org || this.userConfig?.org
    }

    private async retrieveOrganization(organizations: Organization[]): Promise<Organization> {
        const { flags } = await this.parse(AuthCommand)

        if (organizations.length === 0) {
            throw (new Error('You are not a member of any organizations'))
        }
        if (flags.org) {
            const matchingOrg = organizations.find((org) => org.name === flags.org)
            if (!matchingOrg) {
                throw (new Error(`You are not a member of an org with the name ${flags.org}`))
            }
            return matchingOrg
        } else {
            return await promptForOrganization(organizations)
        }
    }

    async selectOrganization(organization: Organization): Promise<string> {
        const ssoAuth = new SSOAuth(this.writer)
        const token = await ssoAuth.getAccessToken(organization)
        const { id, name, display_name } = organization
        storeAccessToken(token, this.authPath)
        if (this.repoConfig) {
            this.updateRepoConfig({ org: { id, name, display_name } })
        } else if (this.userConfig) {
            this.updateUserConfig({ org: { id, name, display_name } })
        }
        return token
    }
}
