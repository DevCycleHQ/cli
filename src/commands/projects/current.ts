import { UserConfigFromFile } from '../../types/configFile'
import Base from '../base'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { load } from 'js-yaml'

const DEFAULT_CONFIG_PATH = resolve('.devcycle/config.yml')

function resolveConfigPath(): string {
    return resolve(process.env.CONFIG_PATH || DEFAULT_CONFIG_PATH)
}

function loadUserConfigFromFile(configPath: string): UserConfigFromFile {
    const userConfigYaml = readFileSync(configPath, 'utf8')
    return load(userConfigYaml) as UserConfigFromFile
}

export default class ProjectsCurrent extends Base {
    static description = 'Display the current project key'
    static aliases = ['pc', 'project']
    static flags = Base.flags

    async run(): Promise<void> {
        try {
            const configPath = resolveConfigPath()
            const { project } = loadUserConfigFromFile(configPath)

            this.log(project ? `You have selected the project with key: ${project}` 
                : 'No project is currently selected.')
        } catch (error) {
            this.log(
                'Error while loading configuration: ',
                (error as Error).message,
            )
        }
    }
}