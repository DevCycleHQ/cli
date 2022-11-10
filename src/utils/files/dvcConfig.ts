import { AuthConfig } from "../../auth/config"
import DVCFiles from "./dvcFiles"
import jsYaml from 'js-yaml'
import { plainToInstance } from "class-transformer"
import { validateSync } from "class-validator"
import { reportValidationErrors } from "../reportValidationErrors"
import { RepoConfigFromFile, UserConfigFromFile } from "../../types"
import Writer from "../../ui/writer"
import Roots from "./roots"

export default class DVCConfig {
    constructor(cliFiles: DVCFiles, writer: Writer) {
        this.files = cliFiles
        this.writer = writer
    }

    public getAuth(): AuthConfig | null {
        let rawConfig: string | null = null
        if (this.files.doesFileExist(Roots.auth)) {
            rawConfig = this.files.loadFromFile(Roots.auth)
        }
        if (!rawConfig) {
            return null
        }
        const config = plainToInstance(
            AuthConfig,
            jsYaml.load(rawConfig)
        )
        const errors = validateSync(config)
        reportValidationErrors('Authorization', errors)

        return config
    }

    public deleteAuth(): void {
        this.files.deleteFile(Roots.auth)
    }

    public get authPath(): string {
        return this.files.getFullPath(Roots.auth)
    }

    public getUser(): UserConfigFromFile | null {
        let rawConfig: string | null = null
        if (this.files.doesFileExist(Roots.user)) {
            rawConfig = this.files.loadFromFile(Roots.user)
        }
        if (!rawConfig) {
            return null
        }
        const config = plainToInstance(
            UserConfigFromFile,
            jsYaml.load(rawConfig)
        )
        const errors = validateSync(config)
        reportValidationErrors('User Configuration', errors)

        return config
    }

    public get userPath(): string {
        return this.files.getFullPath(Roots.user)
    }

    public isInRepo(): boolean {
        return this.files.doesFileExist(Roots.repo)
    }

    public getRepo(): RepoConfigFromFile | null {
        let rawConfig: string | null = null
        if (this.files.doesFileExist(Roots.repo)) {
            rawConfig = this.files.loadFromFile(Roots.repo)
        }
        if (!rawConfig) {
            return null
        }
        const config = plainToInstance(
            RepoConfigFromFile,
            jsYaml.load(rawConfig)
        )
        const errors = validateSync(config)
        reportValidationErrors('Repo Configuration', errors)

        return config
    }

    public get repoPath(): string {
        return this.files.getFullPath(Roots.repo)
    }

    async updateAuthConfig(
        changes: Partial<AuthConfig>
    ): Promise<AuthConfig | null> {
        let config = this.getAuth() || new AuthConfig()

        config = {
            ...config,
            ...changes
        }

        this.files.saveToFile(Roots.auth, jsYaml.dump(config))
        const fullPath = this.files.getFullPath(Roots.auth)
        this.writer.successMessage(`Auth saved to ${fullPath}`)

        return config
    }

    async updateUserConfig(
        changes: Partial<UserConfigFromFile>
    ): Promise<UserConfigFromFile | null> {
        let config = this.getUser() || new UserConfigFromFile()

        config = {
            ...config,
            ...changes
        }

        this.files.saveToFile(Roots.user, jsYaml.dump(config))
        const fullPath = this.files.getFullPath(Roots.user)
        this.writer.successMessage(`User configuration saved to ${fullPath}`)

        return config
    }

    async updateRepoConfig(
        changes: Partial<RepoConfigFromFile>
    ): Promise<RepoConfigFromFile | null> {
        let config = this.getRepo() || new RepoConfigFromFile()

        config = {
            ...config,
            ...changes
        }

        this.files.saveToFile(Roots.repo, jsYaml.dump(config))
        const fullPath = this.files.getFullPath(Roots.repo)
        this.writer.successMessage(`Repo configuration saved to ${fullPath}`)

        return config
    }

    private files: DVCFiles
    private writer: Writer
}