import { DevCycleAuth } from './auth'
import {
    fetchFeatures,
    fetchFeatureByKey,
    createFeature,
} from '../../api/features'
import { fetchVariables, fetchVariableByKey } from '../../api/variables'
import { fetchEnvironmentByKey } from '../../api/environments'
import { enableTargeting, disableTargeting } from '../../api/targeting'

export class DevCycleApiClient {
    constructor(private auth: DevCycleAuth) {}

    async listFeatures(args: {
        search?: string
        page?: number
        per_page?: number
    }) {
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
            return result
        } catch (error) {
            console.error('Error during listFeatures:', error)
            throw error
        }
    }

    async getFeature(featureKey: string) {
        this.auth.requireAuth()
        this.auth.requireProject()

        return await fetchFeatureByKey(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            featureKey,
        )
    }

    async listVariables(args: {
        search?: string
        page?: number
        per_page?: number
    }) {
        this.auth.requireAuth()
        this.auth.requireProject()

        const query = {
            search: args.search,
            page: args.page,
            perPage: args.per_page,
        }

        return await fetchVariables(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            query,
        )
    }

    async getVariable(variableKey: string) {
        this.auth.requireAuth()
        this.auth.requireProject()

        return await fetchVariableByKey(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            variableKey,
        )
    }

    async getSdkKeys(
        environmentKey: string,
        keyType?: 'mobile' | 'server' | 'client',
    ) {
        this.auth.requireAuth()
        this.auth.requireProject()

        const environment = await fetchEnvironmentByKey(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            environmentKey,
        )

        const sdkKeys = environment.sdkKeys

        if (keyType) {
            return {
                [keyType]: sdkKeys[keyType],
            }
        }

        return {
            mobile: sdkKeys.mobile,
            server: sdkKeys.server,
            client: sdkKeys.client,
        }
    }

    async enableTargeting(featureKey: string, environmentKey: string) {
        this.auth.requireAuth()
        this.auth.requireProject()

        return await enableTargeting(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            featureKey,
            environmentKey,
        )
    }

    async disableTargeting(featureKey: string, environmentKey: string) {
        this.auth.requireAuth()
        this.auth.requireProject()

        return await disableTargeting(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            featureKey,
            environmentKey,
        )
    }

    async createFeature(args: {
        key?: string
        name?: string
        description?: string
        type?: 'release' | 'experiment' | 'permission' | 'ops'
        interactive?: boolean
    }) {
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

        return await createFeature(
            this.auth.getAuthToken(),
            this.auth.getProjectKey(),
            featureData,
        )
    }
}
