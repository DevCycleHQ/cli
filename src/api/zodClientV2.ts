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
const CreateVariableDto = z.object({
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
        variations: z.array(UpdateVariationDto),
        staleness: z.object({}).partial().passthrough(),
        summary: UpdateFeatureSummaryDto,
        variables: z.array(FeatureVariableDto),
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

// export const schemas = {
//     EdgeDBSettingsDTO,
//     ColorSettingsDTO,
//     OptInSettingsDTO,
//     SDKTypeVisibilitySettingsDTO,
//     LifeCycleSettingsDTO,
//     ObfuscationSettingsDTO,
//     DynatraceProjectSettingsDTO,
//     ProjectSettingsDTO,
//     CreateProjectDto,
//     EdgeDBSettings,
//     ColorSettings,
//     OptInSettings,
//     SDKTypeVisibilitySettings,
//     LifeCycleSettings,
//     ObfuscationSettings,
//     FeatureApprovalWorkflowSettings,
//     ReleasedStalenessSettings,
//     UnmodifiedLongStalenessSettings,
//     UnmodifiedShortStalenessSettings,
//     UnusedStalenessSettings,
//     StalenessEmailSettings,
//     StalenessSettings,
//     DynatraceProjectSettings,
//     ProjectSettings,
//     VercelEdgeConfigConnection,
//     Project,
//     BadRequestErrorResponse,
//     ConflictErrorResponse,
//     NotFoundErrorResponse,
//     UpdateProjectDto,
//     CannotDeleteLastItemErrorResponse,
//     UpdateProjectSettingsDto,
//     FeatureApprovalWorkflowDTO,
//     ReleasedStalenessDTO,
//     UnmodifiedLongStalenessDTO,
//     UnmodifiedShortStalenessDTO,
//     UnusedStalenessDTO,
//     EmailSettingsDTO,
//     StalenessSettingsDTO,
//     ProtectedProjectSettingsDto,
//     UpdateProtectedProjectSettingsDto,
//     FeatureStalenessEntity,
//     EnvironmentSettings,
//     CreateEnvironmentDto,
//     APIKey,
//     SDKKeys,
//     Environment,
//     UpdateEnvironmentDto,
//     GenerateSdkTokensDto,
//     AllFilter,
//     OptInFilter,
//     UserFilter,
//     UserCountryFilter,
//     UserAppVersionFilter,
//     UserPlatformVersionFilter,
//     UserCustomFilter,
//     AudienceOperator,
//     CreateAudienceDto,
//     Audience,
//     UpdateAudienceDto,
//     AudienceEnvironments,
//     AudienceFeature,
//     AudienceUsage,
//     VariableValidationEntity,
//     CreateVariableDto,
//     Variable,
//     UpdateVariableDto,
//     PreconditionFailedErrorResponse,
//     UpdateVariableStatusDto,
//     RolloutStage,
//     Rollout,
//     TargetDistribution,
//     AudienceMatchFilter,
//     AudienceOperatorWithAudienceMatchFilter,
//     TargetAudience,
//     UpdateTargetDto,
//     UpdateFeatureConfigDto,
//     CreateVariationDto,
//     FeatureSettingsDto,
//     FeatureSDKVisibilityDto,
//     CreateFeatureDto,
//     Variation,
//     FeatureSettings,
//     FeatureSDKVisibility,
//     Target,
//     FeatureConfig,
//     AuditLogEntity,
//     FeatureStaleness,
//     Link,
//     FeatureSummary,
//     Feature,
//     UpdateVariationDto,
//     UpdateFeatureSummaryDto,
//     UpdateFeatureDto,
//     UpdateFeatureStatusDto,
//     StaticConfiguration,
//     UpdateStaticConfigurationDto,
//     LinkJiraIssueDto,
//     JiraIssueLink,
//     FeatureVariationDto,
//     UpdateFeatureVariationDto,
//     FeatureDataPoint,
//     ResultWithFeatureData,
//     ResultEvaluationsByHourDto,
//     ProjectDataPoint,
//     ResultsWithProjectData,
//     ResultProjectEvaluationsByHourDto,
//     ProjectUserProfile,
//     UpdateUserProfileDto,
//     AllowedValue,
//     EnumSchema,
//     PropertySchema,
//     CreateCustomPropertyDto,
//     CustomProperty,
//     UpdateCustomPropertyDto,
//     CreateMetricDto,
//     Metric,
//     UpdateMetricDto,
//     VariationValues,
//     DataPoint,
//     VariationResult,
//     Result,
//     MetricResult,
//     MetricAssociation,
//     CreateMetricAssociationDto,
//     UpdateOverrideDto,
//     Override,
//     FeatureOverride,
//     OverrideResponse,
//     FeatureOverrides,
//     UserOverride,
//     AudiencePatchAction,
//     AudiencePatchInstructionsDto,
//     AudiencePatchDto,
//     UpdateStalenessDto,
//     Reviewers,
//     ReviewReason,
//     FeatureDetails,
//     FeatureChangeRequestSummary,
//     CreateFeatureChangeRequestDto,
//     FeatureChangeRequest,
//     SubmitFeatureChangeRequestDto,
//     ReviewFeatureChangeRequestDto,
//     ApplyFeatureChangeRequestDto,
//     CreateWebhookDto,
//     Webhook,
//     UpdateWebhookDto,
//     CreateDynatraceIntegrationDto,
//     DynatraceEnvironment,
//     DynatraceIntegration,
//     ReassociateVariableDto,
// }

// const endpoints = makeApi([
//     {
//         method: 'post',
//         path: '/v1/integrations/dynatrace',
//         alias: 'DynatraceIntegrationController_createIntegration',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateDynatraceIntegrationDto,
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/integrations/dynatrace',
//         alias: 'DynatraceIntegrationController_getIntegrations',
//         requestFormat: 'json',
//         response: DynatraceIntegration,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/integrations/dynatrace/:dynatraceEnvironmentId',
//         alias: 'DynatraceIntegrationController_deleteEnvironment',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'dynatraceEnvironmentId',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/integrations/jira/:token',
//         alias: 'JiraIntegrationController_remove',
//         description: `DEPRECATED - Not recommended to be used. Use /integrations/jira/organization/:token or /integrations/jira/project/:token instead.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'token',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//     },
//     {
//         method: 'delete',
//         path: '/v1/integrations/jira/organization/:token',
//         alias: 'JiraIntegrationController_removeOrganizationConnection',
//         description: `Remove the Jira integration configuration for an organization. This will remove the integration for an organization wide connection, but not project connections.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'token',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/integrations/jira/project/:token',
//         alias: 'JiraIntegrationController_removeProjectConnection',
//         description: `Remove a specific project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'token',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects',
//         alias: 'ProjectsController_create',
//         description: `Creates a new project within the authed organization.
// The project key must be unique within the organization.
// If this is called in an Organization that has permissions controlled via an external IdP (https://docs.devcycle.com/platform/security-and-guardrails/permissions#full-role-based-access-control-project-level-roles--enterprise-only) - then no users will have permission to access this project.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateProjectDto,
//             },
//         ],
//         response: Project,
//         errors: [
//             {
//                 status: 400,
//                 description: `Invalid request - missing or invalid properties`,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 description: `Project key already exists`,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects',
//         alias: 'ProjectsController_findAll',
//         description: `Lists all projects that the current API Token has permission to view.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//         ],
//         response: z.array(Project),
//         errors: [
//             {
//                 status: 400,
//                 description: `Invalid request - missing or invalid properties`,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:key',
//         alias: 'ProjectsController_findOne',
//         description: `Get a Project by ID or key.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Project,
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 description: `Project does not exist by key or ID. Keys are able to be changed so try switching to ID to have a consistent value that cannot be changed.This can also be returned if the current token does not have permission to view the project.`,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:key',
//         alias: 'ProjectsController_update',
//         description: `Update a Project by ID or key. Certain facets of the project settings require additional permissions to update.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateProjectDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Project,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:key',
//         alias: 'ProjectsController_remove',
//         description: `Delete a Project by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 description: `Project not found.This can also be returned if the current token does not have permission to view the project.`,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 description: `Cannot delete the last project in an organization. Please contact support to delete the organization.`,
//                 schema: CannotDeleteLastItemErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:key/settings',
//         alias: 'ProjectsController_updateSettings',
//         description: `Update a subset of settings for a Project that only requires publisher permissions`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateProjectSettingsDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Project,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:key/settings/protected',
//         alias: 'ProjectsController_updateProtectedSettings',
//         description: `Update the Protect Settings for a Project by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateProtectedProjectSettingsDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Project,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:key/staleness',
//         alias: 'ProjectsController_getStaleness',
//         description: `Get all stale Features for a Project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'includeSilenced',
//                 type: 'Query',
//                 schema: z.boolean().optional().default(false),
//             },
//         ],
//         response: z.array(FeatureStalenessEntity),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 description: `Project not found. This can also be returned if the current token does not have permission to view the project.`,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/audiences',
//         alias: 'AudiencesController_create',
//         description: `Create a new Audience`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateAudienceDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Audience,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/audiences',
//         alias: 'AudiencesController_findAll',
//         description: `List Audiences`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'includeUsage',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Audience),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/audiences/:key',
//         alias: 'AudiencesController_findOne',
//         description: `Get an Audience by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Audience,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/audiences/:key',
//         alias: 'AudiencesController_update',
//         description: `Update an Audience by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateAudienceDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Audience,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/audiences/:key',
//         alias: 'AudiencesController_remove',
//         description: `Delete an Audience by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/audiences/:key/usage',
//         alias: 'AudiencesController_findUsages',
//         description: `Get the direct usages of an Audiences Usage by Features OR other Audiences by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: AudienceUsage,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/customProperties',
//         alias: 'CustomPropertiesController_create',
//         description: `Create a new Custom Property`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateCustomPropertyDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: CustomProperty,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/customProperties',
//         alias: 'CustomPropertiesController_findAll',
//         description: `List Custom Properties`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'type',
//                 type: 'Query',
//                 schema: z.enum(['String', 'Boolean', 'Number']).optional(),
//             },
//             {
//                 name: 'includeUsage',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(CustomProperty),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/customProperties/:key',
//         alias: 'CustomPropertiesController_findOne',
//         description: `Get a Custom Property by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: CustomProperty,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/customProperties/:key',
//         alias: 'CustomPropertiesController_update',
//         description: `Update an Custom Property by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateCustomPropertyDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: CustomProperty,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/customProperties/:key',
//         alias: 'CustomPropertiesController_remove',
//         description: `Delete an Custom Property by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/environments',
//         alias: 'EnvironmentsController_create',
//         description: `Create a new environment for a project. The environment key must be unique within the project. Multiple environments can share a type.
// Creating an environment will auto-generate a set of SDK Keys for the various types of SDKs.
// When permissions are enabled for the organization, the token must have Publisher permissions for the environment to be created.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateEnvironmentDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Environment,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/environments',
//         alias: 'EnvironmentsController_findAll',
//         description: `List all environments for a project. If a token does not have permission to view protected environments the environments will be filtered to only show non-protected environments SDK Keys for security.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Environment),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/environments/:environment/sdk-keys',
//         alias: 'SdkKeysController_generate',
//         description: `Generate new SDK keys for an environment, for any or all of the SDK types. This is the expected and recommended way to rotate SDK keys. Adding a new SDK key will not invalidate existing SDK keys.
// Generating new keys is restricted for protected environments to those with Publisher permissions`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: GenerateSdkTokensDto,
//             },
//             {
//                 name: 'environment',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Environment,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/environments/:environment/sdk-keys/:key',
//         alias: 'SdkKeysController_invalidate',
//         description: `This will invalidate all configs associated with a given key. This is an instantaneous change and all SDKs using this key will stop working immediately. This is the expected and recommended way to rotate SDK keys.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: CannotDeleteLastItemErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/environments/:key',
//         alias: 'EnvironmentsController_findOne',
//         description: `Returns the environment; if the token does not have permission to view protected environments, the environment will be filtered to only show non-protected SDK Keys for security.`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Environment,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/environments/:key',
//         alias: 'EnvironmentsController_update',
//         description: `Update an environment by ID or key. The environment key (if edited) must be unique within the project. If permissions are enabled, changing a protected environment type requires Publisher permissions`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateEnvironmentDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Environment,
//         errors: [
//             {
//                 status: 400,
//                 description: `Invalid request body`,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 description: `Environment not found`,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 description: `Environment key already exists, cannot rename an environment to an existing one.`,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/environments/:key',
//         alias: 'EnvironmentsController_remove',
//         description: `Delete an Environment by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: CannotDeleteLastItemErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/features',
//         alias: 'FeaturesController_create',
//         description: `Create a new Feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateFeatureDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features',
//         alias: 'FeaturesController_findAll',
//         description: `List Features`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'type',
//                 type: 'Query',
//                 schema: z
//                     .enum(['release', 'experiment', 'permission', 'ops'])
//                     .optional(),
//             },
//             {
//                 name: 'status',
//                 type: 'Query',
//                 schema: z.enum(['active', 'complete', 'archived']).optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Feature),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature',
//         alias: 'FeaturesController_findOne',
//         description: `Get a Feature by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/features/:feature',
//         alias: 'FeaturesController_update',
//         description: `Update a Feature by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/features/:feature',
//         alias: 'FeaturesController_remove',
//         description: `Delete a Feature by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'deleteVariables',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/audit',
//         alias: 'AuditLogController_findAll',
//         description: `Get Audit Log For Feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'a0_user',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }).optional(),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }).optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(AuditLogEntity),
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/configurations',
//         alias: 'FeatureConfigsController_findAll',
//         description: `List Feature configurations for all environments or by environment key or ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(FeatureConfig),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/features/:feature/configurations',
//         alias: 'FeatureConfigsController_update',
//         description: `Update a Feature configuration by environment key or ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureConfigDto,
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureConfig,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/features/:feature/integrations/jira/issues',
//         alias: 'FeaturesController_linkIssue',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: z.object({ issueId: z.string() }).passthrough(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.object({ issueId: z.string() }).passthrough(),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/integrations/jira/issues',
//         alias: 'FeaturesController_findAllLinkedIssues',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(JiraIssueLink),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/features/:feature/integrations/jira/issues/:issue_id',
//         alias: 'FeaturesController_removeLinkedIssue',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'issue_id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/overrides',
//         alias: 'OverridesController_findOverridesForFeature',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'addMetadata',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureOverrides,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'put',
//         path: '/v1/projects/:project/features/:feature/overrides/current',
//         alias: 'OverridesController_updateFeatureOverride',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateOverrideDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Override,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/overrides/current',
//         alias: 'OverridesController_findOne',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: OverrideResponse,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/features/:feature/overrides/current',
//         alias: 'OverridesController_deleteOverridesForFeature',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/results/total-evaluations',
//         alias: 'ResultsController_getTotalEvaluationsPerHourByFeature',
//         description: `Fetch total variable evaluations per hour for a feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'platform',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'variable',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'period',
//                 type: 'Query',
//                 schema: z.enum(['day', 'hour', 'month']).optional(),
//             },
//             {
//                 name: 'sdkType',
//                 type: 'Query',
//                 schema: z
//                     .enum(['client', 'server', 'mobile', 'api'])
//                     .optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: ResultEvaluationsByHourDto,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/static-configuration',
//         alias: 'FeaturesController_findStaticConfiguration',
//         description: `Get a completed Feature&#x27;s static configuration`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: StaticConfiguration,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/features/:feature/static-configuration',
//         alias: 'FeaturesController_updateStaticConfiguration',
//         description: `Update a completed Feature&#x27;s static configuration`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateStaticConfigurationDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: StaticConfiguration,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/features/:feature/status',
//         alias: 'FeaturesController_updateStatus',
//         description: `Update a Feature&#x27;s status by key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureStatusDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/features/:feature/variations',
//         alias: 'VariationsController_create',
//         description: `Create a new variation within a Feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: FeatureVariationDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/variations',
//         alias: 'VariationsController_findAll',
//         description: `Get a list of variations for a feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Variation),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/features/:feature/variations/:key',
//         alias: 'VariationsController_findOne',
//         description: `Get a variation by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Variation,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/features/:feature/variations/:key',
//         alias: 'VariationsController_update',
//         description: `Update a variation by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureVariationDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/features/multiple',
//         alias: 'FeaturesController_createMultiple',
//         description: `Create multiple new Features`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: z.array(z.string()),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Feature),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/metric-associations',
//         alias: 'MetricAssociationsController_findAll',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'metric',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(MetricAssociation),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/metric-associations',
//         alias: 'MetricAssociationsController_create',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateMetricAssociationDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: MetricAssociation,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/metric-associations',
//         alias: 'MetricAssociationsController_remove',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'metric',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/metrics',
//         alias: 'MetricsController_create',
//         description: `Create a new Metric`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateMetricDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Metric,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/metrics',
//         alias: 'MetricsController_findAll',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'dimension',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'COUNT_PER_UNIQUE_USER',
//                         'COUNT_PER_VARIABLE_EVALUATION',
//                         'SUM_PER_UNIQUE_USER',
//                         'AVERAGE_PER_UNIQUE_USER',
//                         'TOTAL_AVERAGE',
//                         'TOTAL_SUM',
//                     ])
//                     .optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Metric),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/metrics/:key',
//         alias: 'MetricsController_findOne',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Metric,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/metrics/:key',
//         alias: 'MetricsController_update',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateMetricDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Metric,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/metrics/:key',
//         alias: 'MetricsController_remove',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/metrics/:key/results',
//         alias: 'MetricsController_fetchResults',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }),
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: MetricResult,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/overrides/current',
//         alias: 'OverridesController_findOverridesForProject',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(UserOverride),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/overrides/current',
//         alias: 'OverridesController_deleteOverridesForProject',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/results/evaluations',
//         alias: 'ResultsController_getEvaluationsPerHourByProject',
//         description: `Fetch unique user variable evaluations per hour for a project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'period',
//                 type: 'Query',
//                 schema: z.enum(['day', 'hour', 'month']).optional(),
//             },
//             {
//                 name: 'sdkType',
//                 type: 'Query',
//                 schema: z
//                     .enum(['client', 'server', 'mobile', 'api'])
//                     .optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: ResultProjectEvaluationsByHourDto,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/results/total-evaluations',
//         alias: 'ResultsController_getTotalEvaluationsPerHourByProject',
//         description: `Fetch total variable evaluations per hour for a project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.number().optional(),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'period',
//                 type: 'Query',
//                 schema: z.enum(['day', 'hour', 'month']).optional(),
//             },
//             {
//                 name: 'sdkType',
//                 type: 'Query',
//                 schema: z
//                     .enum(['client', 'server', 'mobile', 'api'])
//                     .optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: ResultProjectEvaluationsByHourDto,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/test-metric-results',
//         alias: 'TestMetricResultsController_fetch',
//         description: `Fetch metric results with the given parameters`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'control',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'optimize',
//                 type: 'Query',
//                 schema: z.enum(['increase', 'decrease']),
//             },
//             {
//                 name: 'environment',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'event',
//                 type: 'Query',
//                 schema: z.string(),
//             },
//             {
//                 name: 'dimension',
//                 type: 'Query',
//                 schema: z.enum([
//                     'COUNT_PER_UNIQUE_USER',
//                     'COUNT_PER_VARIABLE_EVALUATION',
//                     'SUM_PER_UNIQUE_USER',
//                     'AVERAGE_PER_UNIQUE_USER',
//                     'TOTAL_AVERAGE',
//                     'TOTAL_SUM',
//                 ]),
//             },
//             {
//                 name: 'startDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }),
//             },
//             {
//                 name: 'endDate',
//                 type: 'Query',
//                 schema: z.string().datetime({ offset: true }),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: MetricResult,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/userProfile/current',
//         alias: 'UserProfilesController_findAll',
//         description: `Get User Profile for the authenticated User in the specified Project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: ProjectUserProfile,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/userProfile/current',
//         alias: 'UserProfilesController_createOrUpdate',
//         description: `Create or Update a User Profile for Overrides`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: z
//                     .object({ dvcUserId: z.string().nullable() })
//                     .partial()
//                     .passthrough(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: ProjectUserProfile,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/variables',
//         alias: 'VariablesController_create',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateVariableDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Variable,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/variables',
//         alias: 'VariablesController_findAll',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'type',
//                 type: 'Query',
//                 schema: z
//                     .enum(['String', 'Boolean', 'Number', 'JSON'])
//                     .optional(),
//             },
//             {
//                 name: 'status',
//                 type: 'Query',
//                 schema: z.enum(['active', 'archived']).optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Variable),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/variables/:key',
//         alias: 'VariablesController_findOne',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Variable,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/variables/:key',
//         alias: 'VariablesController_update',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateVariableDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Variable,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/variables/:key',
//         alias: 'VariablesController_remove',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/variables/:key/status',
//         alias: 'VariablesController_updateStatus',
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateVariableStatusDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Variable,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v1/projects/:project/webhooks',
//         alias: 'WebhooksController_create',
//         description: `Create a new Webhook`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateWebhookDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Webhook,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/webhooks',
//         alias: 'WebhooksController_findAll',
//         description: `List Webhooks`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Webhook),
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/projects/:project/webhooks/:id',
//         alias: 'WebhooksController_update',
//         description: `Update a Webhook`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateWebhookDto,
//             },
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Webhook,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v1/projects/:project/webhooks/:id',
//         alias: 'WebhooksController_findOne',
//         description: `Get a webhook by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Webhook,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'delete',
//         path: '/v1/projects/:project/webhooks/:id',
//         alias: 'WebhooksController_remove',
//         description: `Delete a webhook by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Webhook,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v1/semantic/projects/:project/audiences/:key',
//         alias: 'SemanticPatchController_semanticUpdate',
//         description: `Semantic Patch Update an Audience by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: AudiencePatchDto,
//             },
//             {
//                 name: 'key',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/change-requests',
//         alias: 'ProjectChangeRequestsController_getFeatureChangeRequests',
//         description: `Get a list of Feature Change Requests for a Project`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'status',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'draft',
//                         'pending',
//                         'approved',
//                         'applied',
//                         'rejected',
//                         'cancelled',
//                     ])
//                     .optional(),
//             },
//             {
//                 name: 'reviewer',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(FeatureChangeRequestSummary),
//         errors: [
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v2/projects/:project/features',
//         alias: 'FeaturesController_create',
//         description: `Create a new Feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateFeatureDto,
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features',
//         alias: 'FeaturesController_findAll',
//         description: `List Features`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'page',
//                 type: 'Query',
//                 schema: z.number().gte(1).optional().default(1),
//             },
//             {
//                 name: 'perPage',
//                 type: 'Query',
//                 schema: z.number().gte(1).lte(1000).optional().default(100),
//             },
//             {
//                 name: 'sortBy',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'createdAt',
//                         'updatedAt',
//                         'name',
//                         'key',
//                         'createdBy',
//                         'propertyKey',
//                     ])
//                     .optional()
//                     .default('createdAt'),
//             },
//             {
//                 name: 'sortOrder',
//                 type: 'Query',
//                 schema: z.enum(['asc', 'desc']).optional().default('desc'),
//             },
//             {
//                 name: 'search',
//                 type: 'Query',
//                 schema: z.string().min(3).optional(),
//             },
//             {
//                 name: 'createdBy',
//                 type: 'Query',
//                 schema: z.string().optional(),
//             },
//             {
//                 name: 'type',
//                 type: 'Query',
//                 schema: z
//                     .enum(['release', 'experiment', 'permission', 'ops'])
//                     .optional(),
//             },
//             {
//                 name: 'status',
//                 type: 'Query',
//                 schema: z.enum(['active', 'complete', 'archived']).optional(),
//             },
//             {
//                 name: 'keys',
//                 type: 'Query',
//                 schema: z.array(z.string()).optional(),
//             },
//             {
//                 name: 'includeLatestUpdate',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'staleness',
//                 type: 'Query',
//                 schema: z
//                     .enum([
//                         'all',
//                         'unused',
//                         'released',
//                         'unmodified',
//                         'notStale',
//                     ])
//                     .optional(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(Feature),
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature',
//         alias: 'FeaturesController_update',
//         description: `Update a Feature by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature',
//         alias: 'FeaturesController_findOne',
//         description: `Get a Feature by ID or key`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'post',
//         path: '/v2/projects/:project/features/:feature/change-requests',
//         alias: 'FeatureChangeRequestsController_createChangeRequest',
//         description: `Create a new Feature Change Request`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: CreateFeatureChangeRequestDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureChangeRequest,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 409,
//                 schema: z.void(),
//             },
//             {
//                 status: 412,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature/change-requests',
//         alias: 'FeatureChangeRequestsController_getPendingFeatureChangeRequests',
//         description: `Get all pending Feature Change Requests for a Feature`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.array(FeatureChangeRequest),
//         errors: [
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature/change-requests/:id',
//         alias: 'FeatureChangeRequestsController_getFeatureChangeRequest',
//         description: `Get a Feature Change Request by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureChangeRequest,
//         errors: [
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/change-requests/:id/apply',
//         alias: 'FeatureChangeRequestsController_applyFeatureChangeRequest',
//         description: `Update a Feature Change Request by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: ApplyFeatureChangeRequestDto,
//             },
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/change-requests/:id/cancel',
//         alias: 'FeatureChangeRequestsController_cancelFeatureChangeRequest',
//         description: `Cancel a Feature Change Request by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/change-requests/:id/review',
//         alias: 'FeatureChangeRequestsController_reviewFeatureChangeRequest',
//         description: `Update a Feature Change Request by ID`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: ReviewFeatureChangeRequestDto,
//             },
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'apply',
//                 type: 'Query',
//                 schema: z.boolean().optional(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: z.void(),
//         errors: [
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/change-requests/:id/submit',
//         alias: 'FeatureChangeRequestsController_submitChangeRequestForReview',
//         description: `Submit a Feature Change Request for Review`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: SubmitFeatureChangeRequestDto,
//             },
//             {
//                 name: 'id',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureChangeRequest,
//         errors: [
//             {
//                 status: 400,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature/change-requests/latest',
//         alias: 'FeatureChangeRequestsController_getLatestFeatureChangeRequest',
//         description: `Get the latest Feature Change Request for a Feature that is NOT in the &#x27;draft&#x27; state`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureChangeRequest,
//         errors: [
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 405,
//                 schema: z.void(),
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature/staleness',
//         alias: 'FeaturesController_getStaleness',
//         description: `Get a Feature&#x27;s Staleness`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/staleness',
//         alias: 'FeaturesController_updateStaleness',
//         description: `Update a Feature&#x27;s Staleness`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateStalenessDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureStalenessEntity,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'get',
//         path: '/v2/projects/:project/features/:feature/static-configuration',
//         alias: 'FeaturesController_findStaticConfiguration',
//         description: `Get a completed Feature&#x27;s static configuration`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: StaticConfiguration,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/static-configuration',
//         alias: 'FeaturesController_updateStaticConfiguration',
//         description: `Update a completed Feature&#x27;s static configuration`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateStaticConfigurationDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: StaticConfiguration,
//         errors: [
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: z.void(),
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/status',
//         alias: 'FeaturesController_updateStatus',
//         description: `Update a Feature&#x27;s status`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureStatusDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: Feature,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 409,
//                 schema: ConflictErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
//     {
//         method: 'patch',
//         path: '/v2/projects/:project/features/:feature/summary',
//         alias: 'FeaturesController_updateSummary',
//         description: `Update a Feature&#x27;s summary`,
//         requestFormat: 'json',
//         parameters: [
//             {
//                 name: 'body',
//                 type: 'Body',
//                 schema: UpdateFeatureSummaryDto,
//             },
//             {
//                 name: 'feature',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//             {
//                 name: 'project',
//                 type: 'Path',
//                 schema: z.string(),
//             },
//         ],
//         response: FeatureSummary,
//         errors: [
//             {
//                 status: 400,
//                 schema: BadRequestErrorResponse,
//             },
//             {
//                 status: 401,
//                 schema: z.void(),
//             },
//             {
//                 status: 403,
//                 schema: z.void(),
//             },
//             {
//                 status: 404,
//                 schema: NotFoundErrorResponse,
//             },
//             {
//                 status: 412,
//                 schema: PreconditionFailedErrorResponse,
//             },
//         ],
//     },
// ])

// export const api = new Zodios(endpoints)

// export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
//     return new Zodios(baseUrl, endpoints, options)
// }
