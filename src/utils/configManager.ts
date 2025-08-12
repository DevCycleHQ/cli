import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as jsYaml from 'js-yaml'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { UserConfigFromFile, RepoConfigFromFile } from '../types/configFile'
import { reportValidationErrors } from './reportValidationErrors'
import Writer from '../ui/writer'

/**
 * Shared config management utility used by both CLI commands and MCP
 * Provides consistent config loading and saving across the application
 */
export class ConfigManager {
    private configPath: string
    private repoConfigPath: string
    private writer: Writer

    constructor(
        configPath?: string,
        repoConfigPath?: string,
        writer?: Writer,
        silent = false,
    ) {
        this.configPath =
            configPath ||
            path.join(os.homedir(), '.config', 'devcycle', 'user.yml')
        this.repoConfigPath = repoConfigPath || '.devcycle/config.yml'
        this.writer = writer || new Writer()
        this.writer.headless = silent
    }

    /**
     * Load user config file with validation
     */
    loadUserConfig(configPath?: string): UserConfigFromFile | null {
        const pathToUse = configPath || this.configPath
        if (!fs.existsSync(pathToUse)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(pathToUse, 'utf8'))
        const configParsed = plainToClass(UserConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors(errors)

        return configParsed
    }

    /**
     * Load repo config file with validation
     */
    loadRepoConfig(repoConfigPath?: string): RepoConfigFromFile | null {
        const pathToUse = repoConfigPath || this.repoConfigPath
        if (!fs.existsSync(pathToUse)) {
            return null
        }

        const config = jsYaml.load(fs.readFileSync(pathToUse, 'utf8'))
        const configParsed = plainToClass(RepoConfigFromFile, config)
        const errors = validateSync(configParsed)
        reportValidationErrors(errors)

        return configParsed
    }

    /**
     * Update user config file with new values
     */
    updateUserConfig(
        changes: Partial<UserConfigFromFile>,
        configPath?: string,
        showMessage = true,
    ): UserConfigFromFile | null {
        const pathToUse = configPath || this.configPath
        let config = this.loadUserConfig(pathToUse)
        if (!config) {
            const configDir = path.dirname(pathToUse)
            fs.mkdirSync(configDir, { recursive: true })
            config = new UserConfigFromFile()
        }

        config = {
            ...config,
            ...changes,
        }

        fs.writeFileSync(pathToUse, jsYaml.dump(config))

        if (showMessage && !this.writer.headless) {
            this.writer.successMessage(`Configuration saved to ${pathToUse}`)
        }

        return config
    }

    /**
     * Update repo config file with new values
     */
    updateRepoConfig(
        changes: Partial<RepoConfigFromFile>,
        repoConfigPath?: string,
        showMessage = true,
    ): RepoConfigFromFile | null {
        const pathToUse = repoConfigPath || this.repoConfigPath
        let config = this.loadRepoConfig(pathToUse)
        if (!config) {
            const configDir = path.dirname(pathToUse)
            fs.mkdirSync(configDir, { recursive: true })
            config = new RepoConfigFromFile()
        }

        config = {
            ...config,
            ...changes,
        }

        fs.writeFileSync(pathToUse, jsYaml.dump(config))

        if (showMessage && !this.writer.headless) {
            this.writer.successMessage(
                `Repo configuration saved to ${pathToUse}`,
            )
        }

        return config
    }

    /**
     * Save project to both repo and user config (same logic as CLI saveProject)
     */
    saveProject(
        projectKey: string,
        userConfigPath?: string,
        repoConfigPath?: string,
        showMessage = true,
    ): void {
        // Check if repo config exists and update it if so (same as CLI)
        const repoPath = repoConfigPath || this.repoConfigPath
        if (fs.existsSync(repoPath)) {
            this.updateRepoConfig(
                { project: projectKey },
                repoPath,
                showMessage,
            )
        }

        // Always update user config (same as CLI)
        this.updateUserConfig(
            { project: projectKey },
            userConfigPath,
            showMessage,
        )
    }
}

/**
 * Create a default ConfigManager instance for general use
 */
export function createConfigManager(
    configDir?: string,
    silent = false,
    writer?: Writer,
): ConfigManager {
    const userConfigPath = configDir
        ? path.join(configDir, 'user.yml')
        : path.join(os.homedir(), '.config', 'devcycle', 'user.yml')

    return new ConfigManager(
        userConfigPath,
        '.devcycle/config.yml',
        writer,
        silent,
    )
}
