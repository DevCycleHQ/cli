import { Command, Flags } from '@oclif/core'
import { UserConfigFromFile } from '../../types/configFile'
import { fetchProjects } from '../../api/projects'
import Base from '../base'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { load } from 'js-yaml'

export default class ProjectsCurrent extends Base {
    static description = 'Display the current project key'
    static aliases = ['pc', 'project']
    static flags = {
        ...Base.flags,
        verbose: Flags.boolean({
            char: 'v',
            description: 'Show more info about the current project',
        }),
    }

    async run(): Promise<void> {
        const { flags } = await this.parse(ProjectsCurrent) // Add this line to parse the input flags

        try {
            const configPath = this.getConfigPath()
            const userConfig = this.loadUserConfigFromFile(configPath)
            if (userConfig && userConfig.project) {
                this.log(`Current project key: ${userConfig.project}`)
                if (flags.verbose) {
                    // Replace `ProjectsCurrent.flags.verbose` with `flags.verbose`
                    const projects = await fetchProjects(this.token)
                    const currentProject = projects.find(
                        (project) => project.key === userConfig.project,
                    )
                    if (currentProject) {
                        this.log(`Project Name: ${currentProject.name}`)
                        this.log(
                            `Project Description: ${currentProject.description}`,
                        )
                    } else {
                        this.log('Project not found.')
                    }
                }
            } else {
                this.log('No project is currently selected.')
            }
        } catch (error) {
            this.log(
                'Error while loading configuration: ',
                (error as Error).message,
            )
        }
    }

    private getConfigPath(): string {
        const defaultConfigPath = resolve('.devcycle/config.yaml')
        const savedConfigPath = process.env.CONFIG_PATH
            ? resolve(process.env.CONFIG_PATH)
            : defaultConfigPath
        return savedConfigPath
    }

    private loadUserConfigFromFile(configPath: string): UserConfigFromFile {
        const userConfigYaml = readFileSync(configPath, 'utf8')
        const loadedConfig = load(userConfigYaml) as UserConfigFromFile
        return loadedConfig || {}
    }
}
