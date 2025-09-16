import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'
import {
    CreateFeatureDto,
    UpdateFeatureDto,
    Feature,
    Variable,
    UpdateFeatureStatusDto,
    CreateVariableDto,
    CreateProjectDto,
    Project,
    UpdateProjectDto,
    CreateEnvironmentDto,
    Environment,
    UpdateEnvironmentDto,
    GenerateSdkTokensDto,
    CreateAudienceDto,
    UpdateAudienceDto,
    Audience,
    CreateCustomPropertyDto,
    CustomProperty,
    UpdateCustomPropertyDto,
    FeatureConfig,
    UpdateFeatureConfigDto,
    ResultEvaluationsByHourDto,
    ResultSummaryDto,
    CreateVariationDto,
    Variation,
    UpdateFeatureVariationDto,
    JiraIssueLink,
    MetricAssociation,
    CreateMetricAssociationDto,
    DeleteMetricAssociationDto,
    CreateMetricDto,
    Metric,
    UpdateMetricDto,
    MetricResult,
    ResultProjectEvaluationsByHourDto,
    UpdateVariableDto,
    UpdateVariableStatusDto,
    UpdateProjectUserProfileDto,
    ProjectUserProfile,
    FeatureOverrideResponse,
    UpdateUserOverrideDto,
    Override,
    UserOverride,
} from './zodSchemas'

const GetProjectsParams = z.object({
    page: z.number().gte(1).optional().default(1),
    perPage: z.number().gte(1).lte(1000).optional().default(100),
    sortBy: z
        .enum([
            'createdAt',
            'updatedAt',
            'name',
            'key',
            'createdBy',
            'propertyKey',
        ])
        .optional()
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional(),
    createdBy: z.string().optional(),
})

const BadRequestErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})
const ConflictErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
    errorType: z.string(),
})
const NotFoundErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})
const CannotDeleteLastItemErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})
const PreconditionFailedErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})

export {
    GetProjectsParams,
    BadRequestErrorResponse,
    ConflictErrorResponse,
    NotFoundErrorResponse,
    CannotDeleteLastItemErrorResponse,
    PreconditionFailedErrorResponse,
}

const endpoints = makeApi([
    {
        method: 'post',
        path: '/v1/projects',
        alias: 'ProjectsController_create',
        description: 'Create a new Project',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateProjectDto,
            },
        ],
        response: Project,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects',
        alias: 'ProjectsController_findAll',
        description: 'List Projects',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'createdBy',
                type: 'Query',
                schema: z.string().optional(),
            },
        ],
        response: z.array(Project),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:key',
        alias: 'ProjectsController_findOne',
        description: 'Get a Project by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Project,
        errors: [
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:key',
        alias: 'ProjectsController_update',
        description: 'Update a Project by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateProjectDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Project,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:key',
        alias: 'ProjectsController_remove',
        description: 'Delete a Project by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 405,
                schema: CannotDeleteLastItemErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/audiences',
        alias: 'AudiencesController_create',
        description: 'Create a new Audience',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateAudienceDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Audience,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/audiences',
        alias: 'AudiencesController_findAll',
        description: 'List Audiences',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Audience),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/audiences/:key',
        alias: 'AudiencesController_findOne',
        description: 'Get an Audience by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Audience,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/audiences/:key',
        alias: 'AudiencesController_update',
        description: 'Update an Audience by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateAudienceDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Audience,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/audiences/:key',
        alias: 'AudiencesController_remove',
        description: 'Delete an Audience by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/customProperties',
        alias: 'CustomPropertiesController_create',
        description: 'Create a new Custom Property',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateCustomPropertyDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: CustomProperty,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/customProperties',
        alias: 'CustomPropertiesController_findAll',
        description: 'List Custom Properties',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'type',
                type: 'Query',
                schema: z.enum(['String', 'Boolean', 'Number']).optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(CustomProperty),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/customProperties/:key',
        alias: 'CustomPropertiesController_findOne',
        description: 'Get a Custom Property by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: CustomProperty,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/customProperties/:key',
        alias: 'CustomPropertiesController_update',
        description: 'Update an Custom Property by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateCustomPropertyDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: CustomProperty,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/customProperties/:key',
        alias: 'CustomPropertiesController_remove',
        description: 'Delete an Custom Property by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/environments',
        alias: 'EnvironmentsController_create',
        description: 'Create a new Environment',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateEnvironmentDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Environment,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/environments',
        alias: 'EnvironmentsController_findAll',
        description: 'List Environments',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'createdBy',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Environment),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/environments/:environment/sdk-keys',
        alias: 'SdkKeysController_generate',
        description: 'Generate new SDK keys for an environment',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: GenerateSdkTokensDto,
            },
            {
                name: 'environment',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Environment,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/environments/:environment/sdk-keys/:key',
        alias: 'SdkKeysController_invalidate',
        description: 'Invalidate an SDK key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'environment',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 405,
                schema: CannotDeleteLastItemErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/environments/:key',
        alias: 'EnvironmentsController_findOne',
        description: 'Get an Environment by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Environment,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/environments/:key',
        alias: 'EnvironmentsController_update',
        description: 'Update an Environment by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateEnvironmentDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Environment,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/environments/:key',
        alias: 'EnvironmentsController_remove',
        description: 'Delete an Environment by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 405,
                schema: CannotDeleteLastItemErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/features',
        alias: 'FeaturesController_create',
        description: 'Create a new Feature',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateFeatureDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features',
        alias: 'FeaturesController_findAll',
        description: 'List Features',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().min(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().min(1).max(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z
                    .enum([
                        'createdAt',
                        'updatedAt',
                        'name',
                        'key',
                        'createdBy',
                        'propertyKey',
                    ])
                    .optional()
                    .default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().min(3).optional(),
            },
            {
                name: 'staleness',
                type: 'Query',
                schema: z
                    .enum([
                        'all',
                        'unused',
                        'released',
                        'unmodified',
                        'notStale',
                    ])
                    .optional(),
            },
            {
                name: 'createdBy',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'type',
                type: 'Query',
                schema: z
                    .enum(['release', 'experiment', 'permission', 'ops'])
                    .optional(),
            },
            {
                name: 'status',
                type: 'Query',
                schema: z.enum(['active', 'complete', 'archived']).optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Feature),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/configurations',
        alias: 'FeatureConfigsController_findAll',
        description:
            'List Feature configurations for all environments or by environment key or ID',
        requestFormat: 'json',
        parameters: [
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(FeatureConfig),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/features/:feature/configurations',
        alias: 'FeatureConfigsController_update',
        description: 'Update a Feature configuration by environment key or ID',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateFeatureConfigDto,
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: FeatureConfig,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/results/evaluations',
        alias: 'ResultsController_getEvaluationsPerHourByFeature',
        description:
            'Fetch unique user variable evaluations per hour for a feature',
        requestFormat: 'json',
        parameters: [
            {
                name: 'startDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'platform',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'variable',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'period',
                type: 'Query',
                schema: z.enum(['day', 'hour', 'month']).optional(),
            },
            {
                name: 'sdkType',
                type: 'Query',
                schema: z
                    .enum(['client', 'server', 'mobile', 'api'])
                    .optional(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ResultEvaluationsByHourDto,
        errors: [
            {
                status: 400,
                schema: z.void(),
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/results/summary',
        alias: 'ResultsController_getResultsSummary',
        requestFormat: 'json',
        parameters: [
            {
                name: 'startDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'platform',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'variable',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'period',
                type: 'Query',
                schema: z.enum(['day', 'hour', 'month']).optional(),
            },
            {
                name: 'sdkType',
                type: 'Query',
                schema: z
                    .enum(['client', 'server', 'mobile', 'api'])
                    .optional(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ResultSummaryDto,
        errors: [
            {
                status: 400,
                schema: z.void(),
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/results/total-evaluations',
        alias: 'ResultsController_getTotalEvaluationsPerHourByFeature',
        description: 'Fetch total variable evaluations per hour for a feature',
        requestFormat: 'json',
        parameters: [
            {
                name: 'startDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'platform',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'variable',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'period',
                type: 'Query',
                schema: z.enum(['day', 'hour', 'month']).optional(),
            },
            {
                name: 'sdkType',
                type: 'Query',
                schema: z
                    .enum(['client', 'server', 'mobile', 'api'])
                    .optional(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ResultEvaluationsByHourDto,
        errors: [
            {
                status: 400,
                schema: z.void(),
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/features/:feature/variations',
        alias: 'VariationsController_create',
        description: 'Create a new variation within a Feature',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateVariationDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/variations',
        alias: 'VariationsController_findAll',
        description: 'Get a list of variations for a feature',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Variation),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/variations/:key',
        alias: 'VariationsController_findOne',
        description: 'Get a variation by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Variation,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/features/:feature/variations/:key',
        alias: 'VariationsController_update',
        description: 'Update a variation by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateFeatureVariationDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:key',
        alias: 'FeaturesController_findOne',
        description: 'Get a Feature by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/features/:key',
        alias: 'FeaturesController_update',
        description: 'Update a Feature by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateFeatureDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/features/:key',
        alias: 'FeaturesController_remove',
        description: 'Delete a Feature by ID or key',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'deleteVariables',
                type: 'Query',
                schema: z.boolean().optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/features/:key/integrations/jira/issues',
        alias: 'FeaturesController_linkIssue',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: z.object({ issueId: z.string() }),
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.object({ issueId: z.string() }),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:key/integrations/jira/issues',
        alias: 'FeaturesController_findAllLinkedIssues',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(JiraIssueLink),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/features/:key/integrations/jira/issues/:issue_id',
        alias: 'FeaturesController_removeLinkedIssue',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'issue_id',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/features/multiple',
        alias: 'FeaturesController_createMultiple',
        description: 'Create multiple new Features',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: z.array(z.string()),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Feature),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/metric-associations',
        alias: 'MetricAssociationsController_findAll',
        requestFormat: 'json',
        parameters: [
            {
                name: 'metric',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'feature',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(MetricAssociation),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/metric-associations',
        alias: 'MetricAssociationsController_create',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateMetricAssociationDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: MetricAssociation,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/metric-associations',
        alias: 'MetricAssociationsController_remove',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: DeleteMetricAssociationDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/metrics',
        alias: 'MetricsController_create',
        description: 'Create a new Metric',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateMetricDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Metric,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/metrics',
        alias: 'MetricsController_findAll',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'dimension',
                type: 'Query',
                schema: z
                    .enum([
                        'COUNT_PER_UNIQUE_USER',
                        'COUNT_PER_VARIABLE_EVALUATION',
                        'SUM_PER_UNIQUE_USER',
                        'AVERAGE_PER_UNIQUE_USER',
                        'TOTAL_AVERAGE',
                        'TOTAL_SUM',
                    ])
                    .optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Metric),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/metrics/:key',
        alias: 'MetricsController_findOne',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Metric,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/metrics/:key',
        alias: 'MetricsController_update',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateMetricDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Metric,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/metrics/:key',
        alias: 'MetricsController_remove',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/metrics/:metric/results',
        alias: 'MetricsController_fetchResults',
        requestFormat: 'json',
        parameters: [
            {
                name: 'feature',
                type: 'Query',
                schema: z.string(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'startDate',
                type: 'Query',
                schema: z.string().datetime(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.string().datetime(),
            },
            {
                name: 'metric',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: MetricResult,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/results/evaluations',
        alias: 'ResultsController_getEvaluationsPerHourByProject',
        description:
            'Fetch unique user variable evaluations per hour for a project',
        requestFormat: 'json',
        parameters: [
            {
                name: 'startDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'period',
                type: 'Query',
                schema: z.enum(['day', 'hour', 'month']).optional(),
            },
            {
                name: 'sdkType',
                type: 'Query',
                schema: z
                    .enum(['client', 'server', 'mobile', 'api'])
                    .optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ResultProjectEvaluationsByHourDto,
        errors: [
            {
                status: 400,
                schema: z.void(),
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/results/total-evaluations',
        alias: 'ResultsController_getTotalEvaluationsPerHourByProject',
        description: 'Fetch total variable evaluations per hour for a project',
        requestFormat: 'json',
        parameters: [
            {
                name: 'startDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.number().optional(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'period',
                type: 'Query',
                schema: z.enum(['day', 'hour', 'month']).optional(),
            },
            {
                name: 'sdkType',
                type: 'Query',
                schema: z
                    .enum(['client', 'server', 'mobile', 'api'])
                    .optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ResultProjectEvaluationsByHourDto,
        errors: [
            {
                status: 400,
                schema: z.void(),
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/test-metric-results',
        alias: 'TestMetricResultsController_fetch',
        description: 'Fetch metric results with the given parameters',
        requestFormat: 'json',
        parameters: [
            {
                name: 'feature',
                type: 'Query',
                schema: z.string(),
            },
            {
                name: 'control',
                type: 'Query',
                schema: z.string(),
            },
            {
                name: 'optimize',
                type: 'Query',
                schema: z.enum(['increase', 'decrease']),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'event',
                type: 'Query',
                schema: z.string(),
            },
            {
                name: 'dimension',
                type: 'Query',
                schema: z.enum([
                    'COUNT_PER_UNIQUE_USER',
                    'COUNT_PER_VARIABLE_EVALUATION',
                    'SUM_PER_UNIQUE_USER',
                    'AVERAGE_PER_UNIQUE_USER',
                    'TOTAL_AVERAGE',
                    'TOTAL_SUM',
                ]),
            },
            {
                name: 'startDate',
                type: 'Query',
                schema: z.string().datetime(),
            },
            {
                name: 'endDate',
                type: 'Query',
                schema: z.string().datetime(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: MetricResult,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'post',
        path: '/v1/projects/:project/variables',
        alias: 'VariablesController_create',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateVariableDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Variable,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/variables',
        alias: 'VariablesController_findAll',
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z.string().optional().default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'feature',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'type',
                type: 'Query',
                schema: z
                    .enum(['String', 'Boolean', 'Number', 'JSON'])
                    .optional(),
            },
            {
                name: 'status',
                type: 'Query',
                schema: z.enum(['active', 'archived']).optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Variable),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/variables/:key',
        alias: 'VariablesController_findOne',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Variable,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/variables/:key',
        alias: 'VariablesController_update',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateVariableDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Variable,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/variables/:key',
        alias: 'VariablesController_remove',
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/variables/:key/status',
        alias: 'VariablesController_updateStatus',
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateVariableStatusDto,
            },
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Variable,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/userProfile/current',
        alias: 'UserProfileController_findOne',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: ProjectUserProfile,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v1/projects/:project/userProfile/current',
        alias: 'UserProfilesController_createOrUpdate',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'body',
                type: 'Body',
                schema: UpdateProjectUserProfileDto,
            },
        ],
        response: ProjectUserProfile,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
        ],
    },
    {
        method: 'put',
        path: '/v1/projects/:project/features/:feature/overrides/current',
        alias: 'OverridesController_updateFeatureOverride',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'body',
                type: 'Body',
                schema: UpdateUserOverrideDto,
            },
        ],
        response: Override,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/overrides/current',
        alias: 'OverridesController_deleteOverridesForProject',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'delete',
        path: '/v1/projects/:project/features/:feature/overrides/current',
        alias: 'OverridesController_deleteFeatureOverrides',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string(),
            },
        ],
        response: z.void(),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/features/:feature/overrides/current',
        alias: 'OverridesController_findOne',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'environment',
                type: 'Query',
                schema: z.string().optional(),
            },
        ],
        response: FeatureOverrideResponse,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v1/projects/:project/overrides/current',
        alias: 'OverridesController_findOverridesForProject',
        requestFormat: 'json',
        parameters: [
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: UserOverride,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
])

const v2Endpoints = makeApi([
    {
        method: 'post',
        path: '/v2/projects/:project/features',
        alias: 'FeaturesController_create',
        description: `Create a new Feature`,
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: CreateFeatureDto,
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v2/projects/:project/features',
        alias: 'FeaturesController_findAll',
        description: `List Features`,
        requestFormat: 'json',
        parameters: [
            {
                name: 'page',
                type: 'Query',
                schema: z.number().gte(1).optional().default(1),
            },
            {
                name: 'perPage',
                type: 'Query',
                schema: z.number().gte(1).lte(1000).optional().default(100),
            },
            {
                name: 'sortBy',
                type: 'Query',
                schema: z
                    .enum([
                        'createdAt',
                        'updatedAt',
                        'name',
                        'key',
                        'createdBy',
                        'propertyKey',
                    ])
                    .optional()
                    .default('createdAt'),
            },
            {
                name: 'sortOrder',
                type: 'Query',
                schema: z.enum(['asc', 'desc']).optional().default('desc'),
            },
            {
                name: 'search',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'createdBy',
                type: 'Query',
                schema: z.string().optional(),
            },
            {
                name: 'type',
                type: 'Query',
                schema: z
                    .enum(['release', 'experiment', 'permission', 'ops'])
                    .optional(),
            },
            {
                name: 'status',
                type: 'Query',
                schema: z.enum(['active', 'complete', 'archived']).optional(),
            },
            {
                name: 'keys',
                type: 'Query',
                schema: z.array(z.string()).optional(),
            },
            {
                name: 'includeLatestUpdate',
                type: 'Query',
                schema: z.boolean().optional(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: z.array(Feature),
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: z.void(),
            },
        ],
    },
    {
        method: 'patch',
        path: '/v2/projects/:project/features/:feature',
        alias: 'FeaturesController_update',
        description: `Update a Feature by ID or key`,
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateFeatureDto,
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
    {
        method: 'get',
        path: '/v2/projects/:project/features/:key',
        alias: 'FeaturesController_findOne',
        description: `Get a Feature by ID or key`,
        requestFormat: 'json',
        parameters: [
            {
                name: 'key',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
        ],
    },
    {
        method: 'patch',
        path: '/v2/projects/:project/features/:feature/status',
        alias: 'FeaturesController_updateStatus',
        description: `Update a Feature's status`,
        requestFormat: 'json',
        parameters: [
            {
                name: 'body',
                type: 'Body',
                schema: UpdateFeatureStatusDto,
            },
            {
                name: 'feature',
                type: 'Path',
                schema: z.string(),
            },
            {
                name: 'project',
                type: 'Path',
                schema: z.string(),
            },
        ],
        response: Feature,
        errors: [
            {
                status: 400,
                schema: BadRequestErrorResponse,
            },
            {
                status: 401,
                schema: z.void(),
            },
            {
                status: 403,
                schema: z.void(),
            },
            {
                status: 404,
                schema: NotFoundErrorResponse,
            },
            {
                status: 409,
                schema: ConflictErrorResponse,
            },
            {
                status: 412,
                schema: PreconditionFailedErrorResponse,
            },
        ],
    },
])

/**
 * TypeScript workaround for large Zodios endpoint definitions.
 *
 * Our ~80+ endpoints exceed TypeScript's inference limits, causing "type exceeds
 * maximum length" errors. This pattern breaks the inference chain while maintaining
 * full type safety through ReturnType<> extraction.
 */
const _createApiClient: (baseUrl?: string, options?: ZodiosOptions) => any = (
    baseUrl?: string,
    options?: ZodiosOptions,
) => (baseUrl ? new Zodios(baseUrl, endpoints, options) : new Zodios(endpoints))
const _createV2ApiClient: (baseUrl?: string, options?: ZodiosOptions) => any = (
    baseUrl?: string,
    options?: ZodiosOptions,
) =>
    baseUrl
        ? new Zodios(baseUrl, v2Endpoints, options)
        : new Zodios(v2Endpoints)

type ApiClientType = ReturnType<typeof _createApiClient>
type V2ApiClientType = ReturnType<typeof _createV2ApiClient>

// Create the actual instances with explicit type annotation
export const api: ApiClientType = _createApiClient()
export const v2Api: V2ApiClientType = _createV2ApiClient()

export function createApiClient(
    baseUrl: string,
    options?: ZodiosOptions,
): ApiClientType {
    return _createApiClient(baseUrl, options)
}

export function createV2ApiClient(
    baseUrl: string,
    options?: ZodiosOptions,
): V2ApiClientType {
    return _createV2ApiClient(baseUrl, options)
}
