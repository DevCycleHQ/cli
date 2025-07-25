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

    constructor(apiAuth?: ApiAuth) {
        this.authPath = path.join(
            os.homedir(),
            '.config',
            'devcycle',
            'auth.yml',
        )
        this.cacheDir = path.join(os.homedir(), '.config', 'devcycle', 'cache')
        this.writer = new Writer()
        this.writer.headless = true
        this.apiAuth =
            apiAuth || new ApiAuth(this.authPath, this.cacheDir, this.writer)
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
                const hasEnvVars =
                    process.env.DEVCYCLE_CLIENT_ID &&
                    process.env.DEVCYCLE_CLIENT_SECRET

                if (hasEnvVars) {
                    throw new Error(
                        'Authentication failed with provided environment variables. ' +
                            'Please verify your DEVCYCLE_CLIENT_ID and DEVCYCLE_CLIENT_SECRET are correct, ' +
                            'or run "dvc login sso" to authenticate with SSO.',
                    )
                } else {
                    throw new Error(
                        'No authentication found. Please either:\n' +
                            '  1. Run "dvc login sso" in the CLI to authenticate with SSO\n' +
                            '  2. Or set environment variables:\n' +
                            '     - DEVCYCLE_CLIENT_ID="your-client-id"\n' +
                            '     - DEVCYCLE_CLIENT_SECRET="your-client-secret"',
                    )
                }
            }

            if (!this._projectKey) {
                const hasProjectEnv = process.env.DEVCYCLE_PROJECT_KEY

                if (hasProjectEnv) {
                    throw new Error(
                        `Invalid project key "${hasProjectEnv}" in environment variable. ` +
                            'Please verify DEVCYCLE_PROJECT_KEY is correct, or run "dvc projects select" to configure a project.',
                    )
                } else {
                    throw new Error(
                        'No project configured. Please either:\n' +
                            '  1. Run "dvc projects select" in the CLI to choose a project\n' +
                            '  2. Or set environment variable: DEVCYCLE_PROJECT_KEY="your-project-key"\n' +
                            '  3. Or add project to .devcycle/config.yml in your repository',
                    )
                }
            }
        } catch (error) {
            console.error(
                'Failed to initialize DevCycle authentication:',
                error,
            )

            // Preserve the original error message if it's already detailed
            if (
                error instanceof Error &&
                (error.message.includes('authentication') ||
                    error.message.includes('project') ||
                    error.message.includes('DEVCYCLE_'))
            ) {
                throw error // Re-throw the original detailed error
            }

            // For other errors, wrap with context
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            throw new Error(
                `Failed to initialize DevCycle authentication: ${errorMessage}\n\n` +
                    'Common solutions:\n' +
                    '  1. Run "dvc status" to check your configuration\n' +
                    '  2. Run "dvc login sso" to authenticate\n' +
                    '  3. Run "dvc projects select" to choose a project',
            )
        }
    }

    protected async loadConfig(): Promise<void> {
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
                'Authentication required. Please either:\n' +
                    '  1. Run "dvc login sso" to authenticate with SSO\n' +
                    '  2. Or set environment variables:\n' +
                    '     - DEVCYCLE_CLIENT_ID="your-client-id"\n' +
                    '     - DEVCYCLE_CLIENT_SECRET="your-client-secret"',
            )
        }
    }

    requireProject(): void {
        if (!this._projectKey) {
            throw new Error(
                'Project configuration required. Please either:\n' +
                    '  1. Run "dvc projects select" to choose a project\n' +
                    '  2. Or set environment variable: DEVCYCLE_PROJECT_KEY="your-project-key"\n' +
                    '  3. Or add project to .devcycle/config.yml in your repository',
            )
        }
    }
}
