/**
 * NOTE: this file is a new export from generate-zodios-client.sh
 * Using it to selectivly switch over to the new zod schemas,
 * as there are a bunch of conflicts with the old schemas that are still mostly working.
 */

// import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

// const EdgeDBSettingsDTO = z.object({ enabled: z.boolean() }).passthrough()
// const ColorSettingsDTO = z
//     .object({
//         primary: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             ),
//         secondary: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             ),
//     })
//     .passthrough()
// const OptInSettingsDTO = z
//     .object({
//         title: z.string().min(1).max(100),
//         description: z.string().max(1000),
//         enabled: z.boolean(),
//         imageURL: z.string(),
//         colors: ColorSettingsDTO,
//         poweredByAlignment: z.enum(['center', 'left', 'right', 'hidden']),
//     })
//     .passthrough()
// const SDKTypeVisibilitySettingsDTO = z
//     .object({ enabledInFeatureSettings: z.boolean() })
//     .passthrough()
// const LifeCycleSettingsDTO = z
//     .object({ disableCodeRefChecks: z.boolean() })
//     .passthrough()
// const ObfuscationSettingsDTO = z
//     .object({ enabled: z.boolean(), required: z.boolean() })
//     .passthrough()
// const DynatraceProjectSettingsDTO = z
//     .object({
//         enabled: z.boolean(),
//         environmentMap: z.object({}).partial().passthrough(),
//     })
//     .partial()
//     .passthrough()
// const ProjectSettingsDTO = z
//     .object({
//         edgeDB: EdgeDBSettingsDTO,
//         optIn: OptInSettingsDTO,
//         sdkTypeVisibility: SDKTypeVisibilitySettingsDTO,
//         lifeCycle: LifeCycleSettingsDTO,
//         obfuscation: ObfuscationSettingsDTO,
//         disablePassthroughRollouts: z.boolean(),
//         dynatrace: DynatraceProjectSettingsDTO,
//     })
//     .passthrough()
// const CreateProjectDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000).optional(),
//         color: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             )
//             .optional(),
//         settings: ProjectSettingsDTO.optional(),
//     })
//     .passthrough()
// const EdgeDBSettings = z.object({ enabled: z.boolean() }).passthrough()
// const ColorSettings = z
//     .object({ primary: z.string(), secondary: z.string() })
//     .passthrough()
// const OptInSettings = z
//     .object({
//         enabled: z.boolean(),
//         title: z.string(),
//         description: z.string(),
//         imageURL: z.string(),
//         colors: ColorSettings,
//         poweredByAlignment: z.object({}).partial().passthrough(),
//     })
//     .passthrough()
// const SDKTypeVisibilitySettings = z
//     .object({ enabledInFeatureSettings: z.boolean() })
//     .passthrough()
// const LifeCycleSettings = z
//     .object({ disableCodeRefChecks: z.boolean() })
//     .passthrough()
// const ObfuscationSettings = z
//     .object({ enabled: z.boolean(), required: z.boolean() })
//     .passthrough()
// const FeatureApprovalWorkflowSettings = z
//     .object({
//         enabled: z.boolean(),
//         allowPublisherBypass: z.boolean(),
//         defaultReviewers: z.array(z.string()),
//     })
//     .passthrough()
// const ReleasedStalenessSettings = z
//     .object({ enabled: z.boolean() })
//     .passthrough()
// const UnmodifiedLongStalenessSettings = z
//     .object({ enabled: z.boolean() })
//     .passthrough()
// const UnmodifiedShortStalenessSettings = z
//     .object({ enabled: z.boolean() })
//     .passthrough()
// const UnusedStalenessSettings = z.object({ enabled: z.boolean() }).passthrough()
// const StalenessEmailSettings = z
//     .object({
//         enabled: z.boolean(),
//         frequency: z.enum(['weekly', 'biweekly', 'monthly']),
//         users: z.array(z.string()),
//         lastNotification: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const StalenessSettings = z
//     .object({
//         enabled: z.boolean(),
//         released: ReleasedStalenessSettings,
//         unmodifiedLong: UnmodifiedLongStalenessSettings,
//         unmodifiedShort: UnmodifiedShortStalenessSettings,
//         unused: UnusedStalenessSettings,
//         email: StalenessEmailSettings,
//     })
//     .passthrough()
// const DynatraceProjectSettings = z
//     .object({
//         enabled: z.boolean(),
//         environmentMap: z.object({}).partial().passthrough(),
//     })
//     .passthrough()
// const ProjectSettings = z
//     .object({
//         edgeDB: EdgeDBSettings,
//         optIn: OptInSettings,
//         sdkTypeVisibility: SDKTypeVisibilitySettings,
//         lifeCycle: LifeCycleSettings,
//         obfuscation: ObfuscationSettings,
//         featureApprovalWorkflow: FeatureApprovalWorkflowSettings,
//         disablePassthroughRollouts: z.boolean(),
//         staleness: StalenessSettings,
//         dynatrace: DynatraceProjectSettings,
//     })
//     .passthrough()
// const VercelEdgeConfigConnection = z
//     .object({ edgeConfigName: z.string(), configurationId: z.string() })
//     .passthrough()
// const Project = z
//     .object({
//         _id: z.string(),
//         _organization: z.string(),
//         _createdBy: z.string(),
//         name: z.string(),
//         key: z.string(),
//         description: z.string().optional(),
//         color: z.string().optional(),
//         settings: ProjectSettings,
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//         hasJiraIntegration: z.boolean(),
//         hasReceivedCodeUsages: z.boolean(),
//         hasUserConfigFetch: z.boolean(),
//         jiraBaseUrl: z.string(),
//         readonly: z.boolean(),
//         vercelEdgeConfigConnections: z
//             .array(VercelEdgeConfigConnection)
//             .optional(),
//     })
//     .passthrough()
// const BadRequestErrorResponse = z
//     .object({
//         statusCode: z.number(),
//         message: z.object({}).partial().passthrough(),
//         error: z.string(),
//     })
//     .passthrough()
// const ConflictErrorResponse = z
//     .object({
//         statusCode: z.number(),
//         message: z.object({}).partial().passthrough(),
//         error: z.string(),
//         errorType: z.string(),
//     })
//     .passthrough()
// const NotFoundErrorResponse = z
//     .object({
//         statusCode: z.number(),
//         message: z.object({}).partial().passthrough(),
//         error: z.string(),
//     })
//     .passthrough()
// const UpdateProjectDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000),
//         color: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             ),
//         settings: ProjectSettingsDTO,
//     })
//     .partial()
//     .passthrough()
// const CannotDeleteLastItemErrorResponse = z
//     .object({
//         statusCode: z.number(),
//         message: z.object({}).partial().passthrough(),
//         error: z.string(),
//     })
//     .passthrough()
// const UpdateProjectSettingsDto = z
//     .object({ settings: ProjectSettings })
//     .passthrough()
// const FeatureApprovalWorkflowDTO = z
//     .object({
//         enabled: z.boolean(),
//         allowPublisherBypass: z.boolean(),
//         defaultReviewers: z.array(z.string()),
//     })
//     .passthrough()
// const ReleasedStalenessDTO = z.object({ enabled: z.boolean() }).passthrough()
// const UnmodifiedLongStalenessDTO = z
//     .object({ enabled: z.boolean() })
//     .passthrough()
// const UnmodifiedShortStalenessDTO = z
//     .object({ enabled: z.boolean() })
//     .passthrough()
// const UnusedStalenessDTO = z.object({ enabled: z.boolean() }).passthrough()
// const EmailSettingsDTO = z
//     .object({
//         enabled: z.boolean(),
//         users: z.array(z.string()),
//         frequency: z.enum(['weekly', 'biweekly', 'monthly']),
//     })
//     .passthrough()
// const StalenessSettingsDTO = z
//     .object({
//         enabled: z.boolean(),
//         released: ReleasedStalenessDTO,
//         unmodifiedLong: UnmodifiedLongStalenessDTO,
//         unmodifiedShort: UnmodifiedShortStalenessDTO,
//         unused: UnusedStalenessDTO,
//         email: EmailSettingsDTO,
//     })
//     .passthrough()
// const ProtectedProjectSettingsDto = z
//     .object({
//         featureApprovalWorkflow: FeatureApprovalWorkflowDTO,
//         staleness: StalenessSettingsDTO,
//     })
//     .passthrough()
// const UpdateProtectedProjectSettingsDto = z
//     .object({ settings: ProtectedProjectSettingsDto })
//     .passthrough()
const FeatureStalenessEntity = z
    .object({
        stale: z.boolean(),
        updatedAt: z.string().datetime({ offset: true }).optional(),
        disabled: z.boolean(),
        snoozedUntil: z.string().datetime({ offset: true }).optional(),
        reason: z
            .enum(['released', 'unused', 'unmodifiedShort', 'unmodifiedLong'])
            .optional(),
        metaData: z.object({}).partial().passthrough().optional(),
    })
    .passthrough()
// const EnvironmentSettings = z
//     .object({ appIconURI: z.string().max(2048) })
//     .partial()
//     .passthrough()
// const CreateEnvironmentDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000).optional(),
//         color: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             )
//             .optional(),
//         type: z.enum([
//             'development',
//             'staging',
//             'production',
//             'disaster_recovery',
//         ]),
//         settings: EnvironmentSettings.optional(),
//     })
//     .passthrough()
// const APIKey = z.object({}).partial().passthrough()
// const SDKKeys = z
//     .object({
//         mobile: z.array(APIKey),
//         client: z.array(APIKey),
//         server: z.array(APIKey),
//     })
//     .passthrough()
// const Environment = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000).optional(),
//         color: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             )
//             .optional(),
//         _id: z.string(),
//         _project: z.string(),
//         type: z.enum([
//             'development',
//             'staging',
//             'production',
//             'disaster_recovery',
//         ]),
//         _createdBy: z.string(),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//         sdkKeys: SDKKeys.optional(),
//         settings: EnvironmentSettings.optional(),
//         readonly: z.boolean(),
//     })
//     .passthrough()
// const UpdateEnvironmentDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000),
//         color: z
//             .string()
//             .max(9)
//             .regex(
//                 /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
//             ),
//         type: z.enum([
//             'development',
//             'staging',
//             'production',
//             'disaster_recovery',
//         ]),
//         settings: EnvironmentSettings,
//     })
//     .partial()
//     .passthrough()
// const GenerateSdkTokensDto = z
//     .object({ client: z.boolean(), server: z.boolean(), mobile: z.boolean() })
//     .partial()
//     .passthrough()
const AllFilter = z.object({ type: z.literal('all').default('all') })
const OptInFilter = z.object({
    type: z.literal('optIn').default('optIn'),
    _audiences: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
})
const UserFilter = z.object({
    subType: z.enum(['user_id', 'email', 'platform', 'deviceModel']),
    comparator: z.enum([
        '=',
        '!=',
        'exist',
        '!exist',
        'contain',
        '!contain',
        'startWith',
        '!startWith',
        'endWith',
        '!endWith',
    ]),
    values: z.array(z.string()).optional(),
    type: z.literal('user').default('user'),
})
const UserCountryFilter = z
    .object({
        subType: z.literal('country').default('country'),
        comparator: z.enum([
            '=',
            '!=',
            'exist',
            '!exist',
            'contain',
            '!contain',
            'startWith',
            '!startWith',
            'endWith',
            '!endWith',
        ]),
        values: z.array(z.string()).optional(),
        type: z.literal('user').default('user'),
    })
    .describe('values must be valid ISO31661 Alpha2 country codes')
const UserAppVersionFilter = z
    .object({
        comparator: z.enum([
            '=',
            '!=',
            '>',
            '>=',
            '<',
            '<=',
            'exist',
            '!exist',
        ]),
        values: z.array(z.string()).optional(),
        type: z.literal('user').default('user'),
        subType: z.literal('appVersion').default('appVersion'),
    })
    .describe('values must be valid semver versions')
const UserPlatformVersionFilter = z.object({
    comparator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']),
    values: z.array(z.string()).optional(),
    type: z.literal('user').default('user'),
    subType: z.literal('appVersion').default('appVersion'),
})
const UserCustomFilter = z
    .object({
        comparator: z.enum([
            '=',
            '!=',
            '>',
            '>=',
            '<',
            '<=',
            'exist',
            '!exist',
            'contain',
            '!contain',
            'startWith',
            '!startWith',
            'endWith',
            '!endWith',
        ]),
        dataKey: z.string().min(1),
        dataKeyType: z.enum(['String', 'Boolean', 'Number']),
        values: z
            .array(z.union([z.boolean(), z.string(), z.number()]))
            .optional(),
        type: z.literal('user').default('user'),
        subType: z.literal('customData').default('customData'),
    })
    .describe(
        'Filters users by comparing customData[dataKey] (coerced to dataKeyType) to values using the specified comparator',
    )
    .passthrough()
// const AudienceOperator = z
//     .object({
//         filters: z.array(
//             z.union([
//                 AllFilter,
//                 UserFilter,
//                 UserCountryFilter,
//                 UserAppVersionFilter,
//                 UserPlatformVersionFilter,
//                 UserCustomFilter,
//             ]),
//         ),
//         operator: z.enum(['and', 'or']),
//     })
//     .passthrough()
// const CreateAudienceDto = z
//     .object({
//         name: z.string().min(1).max(100).optional(),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/)
//             .optional(),
//         description: z.string().max(1000).optional(),
//         filters: AudienceOperator,
//         tags: z.array(z.string()).optional(),
//     })
//     .passthrough()
// const Audience = z
//     .object({
//         name: z.string().min(1).max(100).optional(),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/)
//             .optional(),
//         description: z.string().max(1000).optional(),
//         _id: z.string(),
//         _project: z.string(),
//         filters: AudienceOperator,
//         source: z
//             .enum([
//                 'api',
//                 'dashboard',
//                 'importer',
//                 'github.code_usages',
//                 'github.pr_insights',
//                 'gitlab.code_usages',
//                 'gitlab.pr_insights',
//                 'bitbucket.code_usages',
//                 'bitbucket.pr_insights',
//                 'terraform',
//                 'cli',
//                 'slack',
//                 'mcp',
//             ])
//             .optional(),
//         _createdBy: z.string().optional(),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//         tags: z.array(z.string()).optional(),
//         readonly: z.boolean(),
//         hasUsage: z.boolean().optional(),
//     })
//     .passthrough()
// const UpdateAudienceDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000),
//         filters: AudienceOperator,
//         tags: z.array(z.string()),
//     })
//     .partial()
//     .passthrough()
// const AudienceEnvironments = z.object({}).partial().passthrough()
// const AudienceFeature = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         name: z.string().min(1).max(100),
//         id: z.string(),
//         environments: AudienceEnvironments,
//     })
//     .passthrough()
// const AudienceUsage = z
//     .object({ features: z.array(AudienceFeature) })
//     .passthrough()
const VariableValidationEntity = z.object({
    schemaType: z.enum(['enum', 'regex', 'jsonSchema']),
    enumValues: z.union([z.array(z.string()), z.array(z.number())]).optional(),
    regexPattern: z.string().optional(),
    jsonSchema: z.string().optional(),
    description: z.string(),
    exampleValue: z.any(),
})
export const CreateVariableDto = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    _feature: z.string().optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
    defaultValue: z.any().optional(),
    validationSchema: VariableValidationEntity.optional(),
    tags: z.array(z.string()).optional(),
})
// Remove defaultValue from CreateVariableDto for Features V2 endpoints
export const FeatureVariableDto = CreateVariableDto.omit({ defaultValue: true })
export const Variable = z
    .object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        _id: z.string(),
        _project: z.string(),
        _feature: z.string().optional(),
        type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
        status: z.enum(['active', 'archived']),
        defaultValue: z.any().optional(),
        source: z.enum([
            'api',
            'dashboard',
            'importer',
            'github.code_usages',
            'github.pr_insights',
            'gitlab.code_usages',
            'gitlab.pr_insights',
            'bitbucket.code_usages',
            'bitbucket.pr_insights',
            'terraform',
            'cli',
            'slack',
            'mcp',
        ]),
        _createdBy: z.string().optional(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
        validationSchema: VariableValidationEntity.optional(),
        persistent: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
    })
    .passthrough()
// const UpdateVariableDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         description: z.string().max(1000),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
//         validationSchema: VariableValidationEntity,
//         persistent: z.boolean(),
//         tags: z.array(z.string()),
//     })
//     .partial()
//     .passthrough()
// const PreconditionFailedErrorResponse = z
//     .object({
//         statusCode: z.number(),
//         message: z.object({}).partial().passthrough(),
//         error: z.string(),
//     })
//     .passthrough()
// const UpdateVariableStatusDto = z
//     .object({ status: z.enum(['active', 'archived']) })
//     .passthrough()
const RolloutStage = z.object({
    percentage: z.number().gte(0).lte(1),
    type: z.enum(['linear', 'discrete']),
    date: z.string().datetime({ offset: true }),
})
const Rollout = z.object({
    startPercentage: z.number().gte(0).lte(1).optional(),
    type: z.enum(['schedule', 'gradual', 'stepped']),
    startDate: z.string().datetime({ offset: true }),
    stages: z.array(RolloutStage).optional(),
})
const TargetDistribution = z.object({
    percentage: z.number().gte(0).lte(1),
    _variation: z.string(),
})
const AudienceMatchFilter = z.object({
    type: z.literal('audienceMatch').default('audienceMatch'),
    comparator: z.enum(['=', '!=']).optional(),
    _audiences: z.array(z.string()).optional(),
})
const AudienceOperatorWithAudienceMatchFilter = z.object({
    filters: z.array(
        z.union([
            AllFilter.passthrough(),
            OptInFilter.passthrough(),
            UserFilter.passthrough(),
            UserCountryFilter.passthrough(),
            UserAppVersionFilter.passthrough(),
            UserPlatformVersionFilter.passthrough(),
            UserCustomFilter.passthrough(),
            AudienceMatchFilter.passthrough(),
        ]),
    ),
    operator: z.enum(['and', 'or']),
})
const TargetAudience = z.object({
    name: z.string().min(1).max(100).optional(),
    filters: AudienceOperatorWithAudienceMatchFilter,
})
const UpdateTargetDto = z
    .object({
        _id: z.string().optional(),
        name: z.string().optional(),
        rollout: Rollout.optional(),
        distribution: z.array(TargetDistribution),
        audience: TargetAudience,
    })
    .passthrough()
const UpdateFeatureConfigDto = z
    .object({
        status: z.enum(['active', 'inactive']).default('inactive'),
        targets: z
            .array(UpdateTargetDto)
            .optional()
            .describe(
                'Setting an empty array will remove all targets for this configuration',
            ),
    })
    .partial()
    .passthrough()
const CreateVariationDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    variables: z
        .record(
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.array(z.any()),
                z.object({}).partial().passthrough(),
            ]),
        )
        .optional(),
})
const FeatureSettingsDto = z.object({
    publicName: z.string().max(100),
    publicDescription: z.string().max(1000),
    optInEnabled: z.boolean(),
})
const FeatureSDKVisibilityDto = z
    .object({ mobile: z.boolean(), client: z.boolean(), server: z.boolean() })
    .passthrough()

export const CreateFeatureDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    configurations: z.record(UpdateFeatureConfigDto).optional(),
    type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
    tags: z.array(z.string()).optional(),
    variations: z.array(CreateVariationDto).optional(),
    controlVariation: z.string().optional(),
    variables: z.array(FeatureVariableDto).optional(),
    settings: FeatureSettingsDto.optional(),
    sdkVisibility: FeatureSDKVisibilityDto.optional(),
})

const Variation = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        variables: z
            .record(
                z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.array(z.any()),
                    z.object({}).partial().passthrough(),
                ]),
            )
            .optional(),
        _id: z.string(),
    })
    .passthrough()
const FeatureSettings = z
    .object({
        publicName: z.string().max(100),
        publicDescription: z.string().max(1000),
        optInEnabled: z.boolean(),
    })
    .passthrough()
const FeatureSDKVisibility = z
    .object({ mobile: z.boolean(), client: z.boolean(), server: z.boolean() })
    .passthrough()
const Target = z
    .object({
        _id: z.string(),
        name: z.string().optional(),
        audience: TargetAudience,
        rollout: Rollout.optional(),
        distribution: z.array(TargetDistribution),
        bucketingKey: z.string().optional(),
    })
    .passthrough()
const FeatureConfig = z
    .object({
        _feature: z.string(),
        _environment: z.string(),
        _createdBy: z.string().optional(),
        status: z.enum(['active', 'inactive']),
        startedAt: z.string().datetime({ offset: true }).optional(),
        updatedAt: z.string().datetime({ offset: true }),
        targets: z.array(Target),
        readonly: z.boolean(),
        hasStaticConfig: z.boolean(),
    })
    .passthrough()
const AuditLogEntity = z
    .object({
        date: z.string().datetime({ offset: true }),
        a0_user: z.string(),
        changes: z.array(z.object({}).partial().passthrough()),
    })
    .passthrough()
// const FeatureStaleness = z.object({}).partial().passthrough()
const Link = z.object({ url: z.string(), title: z.string() }).passthrough()
const FeatureSummary = z
    .object({
        maintainers: z.array(z.string()),
        links: z.array(Link),
        markdown: z.string(),
    })
    .passthrough()
export const Feature = z
    .object({
        _id: z.string(),
        _project: z.string(),
        source: z.enum([
            'api',
            'dashboard',
            'importer',
            'github.code_usages',
            'github.pr_insights',
            'gitlab.code_usages',
            'gitlab.pr_insights',
            'bitbucket.code_usages',
            'bitbucket.pr_insights',
            'terraform',
            'cli',
            'slack',
            'mcp',
        ]),
        status: z.enum(['active', 'complete', 'archived']).optional(),
        type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
        name: z.string(),
        key: z.string(),
        description: z.string().optional(),
        _createdBy: z.string().optional(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
        prodTargetingUpdatedAt: z
            .string()
            .datetime({ offset: true })
            .optional(),
        variations: z.array(Variation).optional(),
        controlVariation: z.string(),
        staticVariation: z.string().optional(),
        variables: z.array(Variable).optional(),
        tags: z.array(z.string()),
        ldLink: z.string().optional(),
        readonly: z.boolean(),
        settings: FeatureSettings.partial().optional(),
        sdkVisibility: FeatureSDKVisibility.optional(),
        configurations: z.array(FeatureConfig.partial()).optional(),
        latestUpdate: AuditLogEntity.optional(),
        changeRequests: z
            .array(z.object({}).partial().passthrough())
            .optional(),
        staleness: FeatureStalenessEntity.optional(),
        summary: FeatureSummary.partial().optional(),
    })
    .passthrough()
const UpdateVariationDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        variables: z
            .record(
                z.union([
                    z.string(),
                    z.number(),
                    z.boolean(),
                    z.array(z.any()),
                    z.object({}).partial().passthrough(),
                ]),
            )
            .optional(),
        _id: z.string().optional(),
    })
    .passthrough()
const UpdateFeatureSummaryDto = z
    .object({
        maintainers: z.array(z.string()),
        links: z.array(Link),
        markdown: z.string(),
    })
    .partial()
    .passthrough()
export const UpdateFeatureDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        configurations: z.record(UpdateFeatureConfigDto),
        variables: z.array(FeatureVariableDto),
        variations: z.array(UpdateVariationDto),
        summary: UpdateFeatureSummaryDto,
        type: z.enum(['release', 'experiment', 'permission', 'ops']),
        tags: z.array(z.string()),
        controlVariation: z.string(),
        settings: FeatureSettingsDto,
        sdkVisibility: FeatureSDKVisibilityDto,
    })
    .partial()
export const UpdateFeatureStatusDto = z.object({
    status: z.enum(['active', 'complete', 'archived']),
    staticVariation: z.string().optional(),
})
// const StaticConfiguration = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/)
//             .optional(),
//         name: z.string().min(1).max(100).optional(),
//         description: z.string().max(1000).optional(),
//         variables: z.object({}).partial().passthrough(),
//         environments: z.object({}).partial().passthrough(),
//         readonly: z.boolean(),
//         type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
//         tags: z.array(z.string()).optional(),
//         controlVariation: z.string().optional(),
//         settings: FeatureSettingsDto.optional(),
//         sdkVisibility: FeatureSDKVisibilityDto.optional(),
//         staleness: z.object({}).partial().passthrough().optional(),
//         summary: UpdateFeatureSummaryDto.optional(),
//     })
//     .passthrough()
// const UpdateStaticConfigurationDto = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         name: z.string().min(1).max(100),
//         description: z.string().max(1000),
//         type: z.enum(['release', 'experiment', 'permission', 'ops']),
//         tags: z.array(z.string()),
//         controlVariation: z.string(),
//         settings: FeatureSettingsDto,
//         sdkVisibility: FeatureSDKVisibilityDto,
//         staleness: z.object({}).partial().passthrough(),
//         summary: UpdateFeatureSummaryDto,
//         variables: z.object({}).partial().passthrough(),
//         environments: z.object({}).partial().passthrough(),
//     })
//     .partial()
//     .passthrough()
// const LinkJiraIssueDto = z.object({ issueId: z.string() }).passthrough()
// const JiraIssueLink = z.object({ issueId: z.string() }).passthrough()
// const FeatureVariationDto = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         name: z.string().min(1).max(100),
//         variables: z
//             .record(
//                 z.union([
//                     z.string(),
//                     z.number(),
//                     z.boolean(),
//                     z.array(z.any()),
//                     z.object({}).partial().passthrough(),
//                 ]),
//             )
//             .optional(),
//     })
//     .passthrough()
// const UpdateFeatureVariationDto = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         name: z.string().min(1).max(100),
//         variables: z.record(
//             z.union([
//                 z.string(),
//                 z.number(),
//                 z.boolean(),
//                 z.array(z.any()),
//                 z.object({}).partial().passthrough(),
//             ]),
//         ),
//         _id: z.string(),
//     })
//     .partial()
//     .passthrough()
// const FeatureDataPoint = z
//     .object({
//         values: z.object({}).partial().passthrough(),
//         date: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const ResultWithFeatureData = z
//     .object({ evaluations: z.array(FeatureDataPoint) })
//     .passthrough()
// const ResultEvaluationsByHourDto = z
//     .object({
//         result: ResultWithFeatureData,
//         cached: z.boolean(),
//         updatedAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const ProjectDataPoint = z
//     .object({ date: z.string().datetime({ offset: true }), value: z.number() })
//     .passthrough()
// const ResultsWithProjectData = z
//     .object({ evaluations: z.array(ProjectDataPoint) })
//     .passthrough()
// const ResultProjectEvaluationsByHourDto = z
//     .object({
//         result: ResultsWithProjectData,
//         cached: z.boolean(),
//         updatedAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const ProjectUserProfile = z
//     .object({
//         _id: z.string(),
//         _project: z.string(),
//         a0_user: z.string(),
//         dvcUserId: z.string().nullish(),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const UpdateUserProfileDto = z
//     .object({ dvcUserId: z.string().nullable() })
//     .partial()
//     .passthrough()
// const AllowedValue = z
//     .object({ label: z.string(), value: z.object({}).partial().passthrough() })
//     .passthrough()
// const EnumSchema = z
//     .object({
//         allowedValues: z.array(AllowedValue),
//         allowAdditionalValues: z.boolean(),
//     })
//     .passthrough()
// const PropertySchema = z
//     .object({
//         schemaType: z.enum(['enum', null]),
//         required: z.boolean(),
//         enumSchema: EnumSchema,
//     })
//     .partial()
//     .passthrough()
// const CreateCustomPropertyDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         type: z.enum(['String', 'Boolean', 'Number']),
//         propertyKey: z.string(),
//         schema: PropertySchema.optional(),
//     })
//     .passthrough()
// const CustomProperty = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         _id: z.string(),
//         _project: z.string(),
//         _createdBy: z.string(),
//         propertyKey: z.string(),
//         type: z.enum(['String', 'Boolean', 'Number']),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//         schema: PropertySchema.optional(),
//         hasUsage: z.boolean().optional(),
//     })
//     .passthrough()
// const UpdateCustomPropertyDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         propertyKey: z.string(),
//         type: z.enum(['String', 'Boolean', 'Number']),
//         schema: PropertySchema,
//     })
//     .partial()
//     .passthrough()
// const CreateMetricDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000).optional(),
//         event: z.string(),
//         dimension: z.enum([
//             'COUNT_PER_UNIQUE_USER',
//             'COUNT_PER_VARIABLE_EVALUATION',
//             'SUM_PER_UNIQUE_USER',
//             'AVERAGE_PER_UNIQUE_USER',
//             'TOTAL_AVERAGE',
//             'TOTAL_SUM',
//         ]),
//         optimize: z.enum(['increase', 'decrease']),
//     })
//     .passthrough()
// const Metric = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000).optional(),
//         _id: z.string(),
//         _project: z.string(),
//         source: z
//             .enum([
//                 'api',
//                 'dashboard',
//                 'importer',
//                 'github.code_usages',
//                 'github.pr_insights',
//                 'gitlab.code_usages',
//                 'gitlab.pr_insights',
//                 'bitbucket.code_usages',
//                 'bitbucket.pr_insights',
//                 'terraform',
//                 'cli',
//                 'slack',
//                 'mcp',
//             ])
//             .optional(),
//         event: z.string(),
//         dimension: z.enum([
//             'COUNT_PER_UNIQUE_USER',
//             'COUNT_PER_VARIABLE_EVALUATION',
//             'SUM_PER_UNIQUE_USER',
//             'AVERAGE_PER_UNIQUE_USER',
//             'TOTAL_AVERAGE',
//             'TOTAL_SUM',
//         ]),
//         optimize: z.enum(['increase', 'decrease']),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const UpdateMetricDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         description: z.string().max(1000),
//         event: z.string(),
//         dimension: z.enum([
//             'COUNT_PER_UNIQUE_USER',
//             'COUNT_PER_VARIABLE_EVALUATION',
//             'SUM_PER_UNIQUE_USER',
//             'AVERAGE_PER_UNIQUE_USER',
//             'TOTAL_AVERAGE',
//             'TOTAL_SUM',
//         ]),
//         optimize: z.enum(['increase', 'decrease']),
//     })
//     .partial()
//     .passthrough()
// const VariationValues = z.object({}).partial().passthrough()
// const DataPoint = z
//     .object({
//         date: z.string().datetime({ offset: true }),
//         values: VariationValues,
//     })
//     .passthrough()
// const VariationResult = z
//     .object({
//         key: z.string(),
//         name: z.string(),
//         numerator: z.number(),
//         denominator: z.number(),
//         rate: z.number(),
//         avgValue: z.number().optional(),
//         totalValue: z.number().optional(),
//         stdev: z.number().optional(),
//         percentDifference: z.number().nullable(),
//         chanceToBeatControl: z.number().nullable(),
//     })
//     .passthrough()
// const Result = z
//     .object({
//         dataSeries: z.array(DataPoint),
//         variations: z.array(VariationResult),
//     })
//     .passthrough()
// const MetricResult = z
//     .object({
//         result: Result,
//         cached: z.boolean(),
//         updatedAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const MetricAssociation = z
//     .object({
//         _project: z.string(),
//         feature: Feature,
//         metric: Metric,
//         createdAt: z.string().datetime({ offset: true }),
//     })
//     .passthrough()
// const CreateMetricAssociationDto = z
//     .object({ metric: z.string(), feature: z.string() })
//     .passthrough()
// const UpdateOverrideDto = z
//     .object({ environment: z.string(), variation: z.string() })
//     .passthrough()
// const Override = z
//     .object({
//         _project: z.string(),
//         _environment: z.string(),
//         _feature: z.string(),
//         _variation: z.string(),
//         dvcUserId: z.string(),
//         createdAt: z.number(),
//         updatedAt: z.number(),
//         a0_user: z.string().optional(),
//     })
//     .passthrough()
// const FeatureOverride = z
//     .object({ _environment: z.string(), _variation: z.string() })
//     .passthrough()
// const OverrideResponse = z
//     .object({ overrides: z.array(FeatureOverride) })
//     .passthrough()
// const FeatureOverrides = z
//     .object({
//         overrides: z.record(z.array(Override)),
//         uniqueTeamMembers: z.number(),
//     })
//     .passthrough()
// const UserOverride = z
//     .object({
//         _feature: z.string(),
//         featureName: z.string(),
//         _environment: z.string(),
//         environmentName: z.string(),
//         _variation: z.string(),
//         variationName: z.string(),
//     })
//     .passthrough()
// const AudiencePatchAction = z
//     .object({
//         values: z.object({}).partial().passthrough(),
//         filterIndex: z.string(),
//     })
//     .passthrough()
// const AudiencePatchInstructionsDto = z
//     .object({
//         op: z.enum(['addFilterValues', 'removeFilterValues']),
//         action: AudiencePatchAction,
//     })
//     .passthrough()
// const AudiencePatchDto = z
//     .object({ instructions: z.array(AudiencePatchInstructionsDto) })
//     .passthrough()
// const UpdateStalenessDto = z
//     .object({
//         snoozedUntil: z.string(),
//         disabled: z.boolean(),
//         metaData: z.object({}).partial().passthrough(),
//     })
//     .partial()
//     .passthrough()
// const Reviewers = z.object({}).partial().passthrough()
// const ReviewReason = z.object({}).partial().passthrough()
// const FeatureDetails = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//         name: z.string().min(1).max(100),
//         id: z.string(),
//     })
//     .passthrough()
// const FeatureChangeRequestSummary = z
//     .object({
//         _id: z.string(),
//         _project: z.string(),
//         _feature: z.string(),
//         status: z.enum([
//             'draft',
//             'pending',
//             'approved',
//             'applied',
//             'rejected',
//             'cancelled',
//         ]),
//         operation: z.enum([
//             'featureUpdate',
//             'featureStatusUpdate',
//             'featureStaticConfigurationUpdate',
//         ]),
//         description: z.string().optional(),
//         reviewers: Reviewers,
//         reviews: z.array(ReviewReason),
//         _createdBy: z.string(),
//         _updatedBy: z.string().optional(),
//         createdAt: z.string().datetime({ offset: true }).optional(),
//         updatedAt: z.string().datetime({ offset: true }).optional(),
//         feature: FeatureDetails,
//     })
//     .passthrough()
// const CreateFeatureChangeRequestDto = z
//     .object({
//         path: z.string(),
//         method: z.literal('PATCH'),
//         body: z.object({}).partial().passthrough(),
//     })
//     .passthrough()
// const FeatureChangeRequest = z
//     .object({
//         _id: z.string(),
//         _project: z.string(),
//         _baseFeatureSnapshot: z.string(),
//         _feature: z.string(),
//         status: z.enum([
//             'draft',
//             'pending',
//             'approved',
//             'applied',
//             'rejected',
//             'cancelled',
//         ]),
//         changes: z.array(z.object({}).partial().passthrough()).optional(),
//         operation: z.enum([
//             'featureUpdate',
//             'featureStatusUpdate',
//             'featureStaticConfigurationUpdate',
//         ]),
//         description: z.string().optional(),
//         reviewers: Reviewers,
//         reviews: z.array(ReviewReason),
//         _createdBy: z.string(),
//         _updatedBy: z.string().optional(),
//         createdAt: z.string().datetime({ offset: true }).optional(),
//         updatedAt: z.string().datetime({ offset: true }).optional(),
//     })
//     .passthrough()
// const SubmitFeatureChangeRequestDto = z
//     .object({
//         description: z.string().max(1000),
//         reviewers: z.array(z.string()),
//     })
//     .passthrough()
// const ReviewFeatureChangeRequestDto = z
//     .object({ action: z.enum(['approved', 'rejected']), comment: z.string() })
//     .passthrough()
// const ApplyFeatureChangeRequestDto = z
//     .object({ description: z.string().max(1000), action: z.literal('applied') })
//     .passthrough()
// const CreateWebhookDto = z
//     .object({
//         name: z.string().min(1).max(100),
//         description: z.string().max(1000).optional(),
//         outputFormat: z.object({}).partial().passthrough().optional(),
//         _feature: z.string().optional(),
//         _environments: z.array(z.string()).optional(),
//         events: z.array(z.string()),
//         url: z.string(),
//     })
//     .passthrough()
// const Webhook = z
//     .object({
//         name: z.string().min(1).max(100),
//         description: z.string().max(1000).optional(),
//         _id: z.string(),
//         _project: z.string(),
//         _feature: z.string().optional(),
//         _environments: z.array(z.string()),
//         url: z.string(),
//         events: z.array(z.string()),
//         source: z
//             .enum([
//                 'api',
//                 'dashboard',
//                 'importer',
//                 'github.code_usages',
//                 'github.pr_insights',
//                 'gitlab.code_usages',
//                 'gitlab.pr_insights',
//                 'bitbucket.code_usages',
//                 'bitbucket.pr_insights',
//                 'terraform',
//                 'cli',
//                 'slack',
//                 'mcp',
//             ])
//             .optional(),
//         createdBy: z.string().optional(),
//         createdAt: z.string().datetime({ offset: true }),
//         updatedAt: z.string().datetime({ offset: true }),
//         outputFormat: z.object({}).partial().passthrough().optional(),
//         _slackIntegration: z.string().optional(),
//     })
//     .passthrough()
// const UpdateWebhookDto = z
//     .object({
//         name: z.string().min(1).max(100).optional(),
//         description: z.string().max(1000).optional(),
//         _feature: z.string(),
//         _environments: z.array(z.string()),
//         events: z.array(z.string()).optional(),
//         url: z.string().optional(),
//         outputFormat: z.object({}).partial().passthrough().optional(),
//     })
//     .passthrough()
// const CreateDynatraceIntegrationDto = z
//     .object({
//         dynatraceEnvironmentId: z.string(),
//         accessToken: z.string(),
//         environmentUrl: z.string(),
//     })
//     .passthrough()
// const DynatraceEnvironment = z
//     .object({
//         dynatraceEnvironmentId: z.string(),
//         accessToken: z.string(),
//         environmentUrl: z.string(),
//         projects: z.array(Project),
//     })
//     .passthrough()
// const DynatraceIntegration = z
//     .object({ environments: z.array(DynatraceEnvironment) })
//     .passthrough()
// const ReassociateVariableDto = z
//     .object({
//         key: z
//             .string()
//             .min(1)
//             .max(100)
//             .regex(/^[a-z0-9-_.]+$/),
//     })
//     .passthrough()
