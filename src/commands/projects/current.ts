import { Command } from '@oclif/core'
import { UserConfigFromFile } from '../../types/configFile'

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { load } from 'js-yaml'

export default class ProjectsCurrent extends Command {
  static description = 'Display the current project key'
  static aliases = ['pc', 'project']

  async run(): Promise<void> {
      try {
          const configPath = this.getConfigPath()
          const userConfig = this.loadUserConfig(configPath)
          if (userConfig && userConfig.project) {
              this.log(`Current project key: ${userConfig.project}`)
          } else {
              this.log('No project is currently selected.')
          }
      } catch (error) {
          this.log('Error while loading configuration: ', (error as Error).message)
      }
  }

  private getConfigPath(): string {
      const defaultConfigPath = resolve('.devcycle/config.yaml')
      const savedConfigPath = process.env.CONFIG_PATH ? resolve(process.env.CONFIG_PATH) : defaultConfigPath
      return savedConfigPath
  }

  private loadUserConfig(configPath: string): UserConfigFromFile {
      const userConfigYaml = readFileSync(configPath, 'utf8')
      const loadedConfig = load(userConfigYaml) as UserConfigFromFile
      return loadedConfig || {}
  }
}