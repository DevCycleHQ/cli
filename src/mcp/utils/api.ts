import { DevCycleAuth } from './auth'
import { fetchFeatures, createFeature } from '../../api/features'
import { fetchVariables } from '../../api/variables'
import {
    fetchEnvironmentByKey,
    fetchEnvironments,
} from '../../api/environments'
import { fetchProject, fetchProjects } from '../../api/projects'
import { enableTargeting, disableTargeting } from '../../api/targeting'
import type {
    ListFeaturesArgs,
    ListVariablesArgs,
    ListProjectsArgs,
    GetSdkKeysArgs,
    EnableTargetingArgs,
    DisableTargetingArgs,
    CreateFeatureArgs,
} from '../types'

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

    async listFeatures(args: ListFeaturesArgs) {
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

    async listVariables(args: ListVariablesArgs) {
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

    async listEnvironments() {
        console.error('MCP listEnvironments')

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await fetchEnvironments(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
            )

            console.error(
                'MCP listEnvironments result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP listEnvironments error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async listProjects(args: ListProjectsArgs) {
        console.error('MCP listProjects params:', JSON.stringify(args, null, 2))

        try {
            this.auth.requireAuth()

            const query: any = {}
            if (args.sort_by) query.sortBy = args.sort_by
            if (args.sort_order) query.sortOrder = args.sort_order
            if (args.search) query.search = args.search
            if (args.created_by) query.createdBy = args.created_by
            if (args.page) query.page = args.page
            if (args.per_page) query.perPage = args.per_page

            const result = await fetchProjects(this.auth.getAuthToken(), query)
            console.error(
                'MCP listProjects result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP listProjects error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }

    async getSdkKeys(args: GetSdkKeysArgs) {
        console.error('MCP getSdkKeys params:', JSON.stringify(args, null, 2))

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const environment = await fetchEnvironmentByKey(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                args.environment_key,
            )

            const sdkKeys = environment.sdkKeys

            let result
            if (args.key_type) {
                result = {
                    [args.key_type]: sdkKeys[args.key_type],
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

    async enableTargeting(args: EnableTargetingArgs) {
        console.error(
            'MCP enableTargeting params:',
            JSON.stringify(args, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await enableTargeting(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                args.feature_key,
                args.environment_key,
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

    async disableTargeting(args: DisableTargetingArgs) {
        console.error(
            'MCP disableTargeting params:',
            JSON.stringify(args, null, 2),
        )

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await disableTargeting(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
                args.feature_key,
                args.environment_key,
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

    async createFeature(args: CreateFeatureArgs) {
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

    async getCurrentProject() {
        console.error('MCP getCurrentProject')

        try {
            this.auth.requireAuth()
            this.auth.requireProject()

            const result = await fetchProject(
                this.auth.getAuthToken(),
                this.auth.getProjectKey(),
            )

            console.error(
                'MCP getCurrentProject result:',
                JSON.stringify(result, null, 2),
            )
            return result
        } catch (error) {
            console.error(
                'MCP getCurrentProject error:',
                JSON.stringify({ error: getErrorMessage(error) }, null, 2),
            )
            throw ensureError(error)
        }
    }
}
