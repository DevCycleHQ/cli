import 'reflect-metadata'

import { Command, Flags } from '@oclif/core'
import fs from 'fs'
import jsYaml from 'js-yaml'
import { ConfigFromFile } from '../types'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'

export default abstract class Base extends Command {
    static hidden = true
    static flags = {
        'config-path': Flags.string({
            description: 'Override the default location to look for a config.yml file',
            default: '.devcycle/config.yml'
        })
    }

    token: string | null = null

    configFromFile: ConfigFromFile | null

    loadConfig(path: string): ConfigFromFile | null {
        if (!fs.existsSync(path)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(path, 'utf8'))

        const configParsed = plainToClass(ConfigFromFile, config, { excludeExtraneousValues: false })

        const errors = validateSync(configParsed)

        if (errors.length) {
            let error = errors[0]
            while (error.children?.length) {
                error = error.children[0]
            }

            this.error(`Config file failed validation at property "${error.property}": ` +
                `${Object.values(error.constraints ?? {})[0]}`)
        }

        return configParsed
    }

    async init(): Promise<void> {
        const { flags } = await this.parse(this.constructor as typeof Base)
        this.configFromFile = this.loadConfig(flags['config-path'])
    }
}
