import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { ApiAuth } from '../../auth/ApiAuth'
import Writer from '../../ui/writer'

export class DevCycleAuth {
    private apiAuth: ApiAuth
    private authPath: string
    private cacheDir: string
    private writer: Writer
    private _authToken = ''
    private _projectKey = ''
    private _orgId = ''

    constructor() {
        this.authPath = path.join(
            os.homedir(),
            '.config',
            'devcycle',
            'auth.yml',
        )
        this.cacheDir = path.join(os.homedir(), '.config', 'devcycle', 'cache')
        this.writer = new Writer()
        this.writer.headless = true
        this.apiAuth = new ApiAuth(this.authPath, this.cacheDir, this.writer)
    }

    async initialize(): Promise<void> {
        try {
            // Try to get auth token from various sources
            const flags = {
                'client-id':
                    process.env.DEVCYCLE_CLIENT_ID || process.env.DVC_CLIENT_ID,
                'client-secret':
                    process.env.DEVCYCLE_CLIENT_SECRET ||
                    process.env.DVC_CLIENT_SECRET,
            }

            // Load project config to get org and project
            await this.loadConfig()

            // Get the auth token
            this._authToken = await this.apiAuth.getToken(flags, this._orgId)

            if (!this._authToken) {
                throw new Error(
                    'No authentication found. Please set DEVCYCLE_CLIENT_ID and DEVCYCLE_CLIENT_SECRET environment variables, ' +
                        'or run "dvc login sso" in the CLI first.',
                )
            }

            if (!this._projectKey) {
                throw new Error(
                    'No project configured. Please set DEVCYCLE_PROJECT_KEY environment variable, ' +
                        'or configure a project using "dvc projects select" in the CLI.',
                )
            }
        } catch (error) {
            console.error(
                'Failed to initialize DevCycle authentication:',
                error,
            )
            throw new Error(
                `Failed to initialize DevCycle authentication: ${error instanceof Error ? error.message : 'Unknown error'}`,
            )
        }
    }

    private async loadConfig(): Promise<void> {
        // Try to load project from environment variables first
        this._projectKey =
            process.env.DEVCYCLE_PROJECT_KEY ||
            process.env.DVC_PROJECT_KEY ||
            ''

        // Try to load from repo config
        const repoConfigPath = '.devcycle/config.yml'
        if (fs.existsSync(repoConfigPath)) {
            try {
                const yaml = await import('js-yaml')
                const configContent = fs.readFileSync(repoConfigPath, 'utf8')
                const config = yaml.load(configContent) as any

                if (config?.project && !this._projectKey) {
                    this._projectKey = config.project
                }
                if (config?.org?.id) {
                    this._orgId = config.org.id
                }
            } catch (error) {
                console.error('Error loading repo config:', error)
                // Ignore config loading errors, continue with env vars
            }
        }

        // Try to load from user config
        const userConfigPath = path.join(
            os.homedir(),
            '.config',
            'devcycle',
            'user.yml',
        )
        if (
            fs.existsSync(userConfigPath) &&
            (!this._projectKey || !this._orgId)
        ) {
            try {
                const yaml = await import('js-yaml')
                const configContent = fs.readFileSync(userConfigPath, 'utf8')
                const config = yaml.load(configContent) as any

                if (config?.project && !this._projectKey) {
                    this._projectKey = config.project
                }
                if (config?.org?.id && !this._orgId) {
                    this._orgId = config.org.id
                }
            } catch (error) {
                console.error('Error loading user config:', error)
                // Ignore config loading errors
            }
        }
    }

    getAuthToken(): string {
        return this._authToken
    }

    getProjectKey(): string {
        return this._projectKey
    }

    getOrgId(): string {
        return this._orgId
    }

    hasToken(): boolean {
        return this._authToken !== ''
    }

    requireAuth(): void {
        if (!this.hasToken()) {
            throw new Error(
                'Authentication required. Please configure DevCycle credentials.',
            )
        }
    }

    requireProject(): void {
        if (!this._projectKey) {
            throw new Error(
                'Project key required. Please configure a DevCycle project.',
            )
        }
    }
}
