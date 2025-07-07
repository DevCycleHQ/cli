import { DevCycleAuth } from './auth'
import { fetchFeatures, createFeature } from '../../api/features'
import { fetchVariables } from '../../api/variables'
import { fetchEnvironmentByKey } from '../../api/environments'
import { enableTargeting, disableTargeting } from '../../api/targeting'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}

function ensureError(error: unknown): Error {
    if (error instanceof Error) {
        return error
    }
    return new Error(String(error))
}

export class DevCycleApiClient {
    constructor(private auth: DevCycleAuth) {}

    async listFeatures(args: {
        search?: string
        page?: number
        per_page?: number
    }) {
        console.error('MCP listFeatures params:', JSON.stringify(args, null, 2))

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const authToken = this.auth.getAuthToken()
            const projectKey = this.auth.getProjectKey()

            const query = {
                search: args.search,
                page: args.page,
                perPage: args.per_page,
            }

            const result = await fetchFeatures(authToken, projectKey, query)
            console.error(
                'MCP listFeatures result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP listFeatures error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            console.error('Error during listFeatures:', getErrorMessage(error))
            throw ensureError(error)
        }
    }

    async listVariables(args: {
        search?: string
        page?: number
        per_page?: number
    }) {
        console.error(
            'MCP listVariables params:',
            JSON.stringify(args, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const query = {
                search: args.search,
                page: args.page,
                perPage: args.per_page,
            }

            const result = await fetchVariables(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                query,
            )
            console.error(
                'MCP listVariables result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP listVariables error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async getSdkKeys(
        environmentKey: string,
        keyType?: 'mobile' | 'server' | 'client',
    ) {
        console.error(
            'MCP getSdkKeys params:',
            JSON.stringify({ environmentKey, keyType }, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const environment = await fetchEnvironmentByKey(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                environmentKey,
            )

            const sdkKeys = environment.sdkKeys

            let result
            if (keyType) {
                result = {
                    [keyType]: sdkKeys[keyType],
                }
            } else {
                result = {
                    mobile: sdkKeys.mobile,
                    server: sdkKeys.server,
                    client: sdkKeys.client,
                }
            }

            console.error(
                'MCP getSdkKeys result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP getSdkKeys error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async enableTargeting(featureKey: string, environmentKey: string) {
        console.error(
            'MCP enableTargeting params:',
            JSON.stringify({ featureKey, environmentKey }, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await enableTargeting(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                featureKey,
                environmentKey,
            )
            console.error(
                'MCP enableTargeting result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP enableTargeting error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async disableTargeting(featureKey: string, environmentKey: string) {
        console.error(
            'MCP disableTargeting params:',
            JSON.stringify({ featureKey, environmentKey }, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await disableTargeting(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                featureKey,
                environmentKey,
            )
            console.error(
                'MCP disableTargeting result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP disableTargeting error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async createFeature(args: {
        key?: string
        name?: string
        description?: string
        type?: 'release' | 'experiment' | 'permission' | 'ops'
        interactive?: boolean
    }) {
        console.error(
            'MCP createFeature params:',
            JSON.stringify(args, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            if (args.interactive) {
                // For interactive mode, we would need to implement prompts
                // For now, return an error asking for explicit parameters
                throw new Error(
                    'Interactive mode not yet supported in MCP. Please provide explicit parameters: key, name, description, type',
                )
            }

            if (!args.key || !args.name) {
                throw new Error(
                    'Feature key and name are required when not using interactive mode',
                )
            }

            const featureData = {
                key: args.key,
                name: args.name,
                description: args.description || '',
                type: args.type || 'release',
            }

            const result = await createFeature(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                featureData,
            )
            console.error(
                'MCP createFeature result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP createFeature error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }
}
