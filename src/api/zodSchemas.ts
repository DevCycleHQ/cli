/**
 * IMPORTANT: MCP Schema Compatibility
 *
 * The MCP (Model Context Protocol) requires that all array types in JSON schemas
 * have an 'items' property. When using Zod schemas that will be converted to JSON
 * schemas for MCP tools:
 *
 * ❌ NEVER use: z.array(z.any()) - This doesn't generate the required 'items' property
 * ✅ ALWAYS use: z.array(z.unknown()) - This generates proper JSON schemas
 *
 * Similarly:
 * ❌ NEVER use: z.record(z.any())
 * ✅ ALWAYS use: z.record(z.unknown())
 *
 * The z.unknown() type provides the same runtime flexibility as z.any() but
 * generates valid JSON schemas that pass MCP validation.
 */
import { z } from 'zod'

export const GetProjectsParams = z.object({
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
export const ResultSummaryDto = z.object({
    result: z
        .object({
            counts: z
                .object({
                    total: z.number(),
                    withFeature: z.number(),
                    accessedFeature: z.number(),
                })
                .partial(),
        })
        .partial(),
    cached: z.boolean(),
    updatedAt: z.string().datetime(),
})

// Zod Schemas
const EdgeDBSettingsDTO = z.object({ enabled: z.boolean() })
const ColorSettingsDTO = z.object({
    primary: z
        .string()
        .max(9)
        .regex(
            /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
        ),
    secondary: z
        .string()
        .max(9)
        .regex(
            /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
        ),
})
const OptInSettingsDTO = z
    .object({
        title: z.string().min(1).max(100),
        description: z.string().max(1000),
        enabled: z.boolean(),
        imageURL: z.string(),
        colors: ColorSettingsDTO,
        poweredByAlignment: z.enum(['center', 'left', 'right', 'hidden']),
    })
    .passthrough()
const SDKTypeVisibilitySettingsDTO = z
    .object({ enabledInFeatureSettings: z.boolean() })
    .passthrough()
const LifeCycleSettingsDTO = z
    .object({ disableCodeRefChecks: z.boolean() })
    .passthrough()
const ObfuscationSettingsDTO = z
    .object({ enabled: z.boolean(), required: z.boolean() })
    .passthrough()
const DynatraceProjectSettingsDTO = z
    .object({
        enabled: z.boolean(),
        environmentMap: z.record(z.unknown()),
    })
    .partial()
    .passthrough()
export const ProjectSettingsDTO = z
    .object({
        edgeDB: EdgeDBSettingsDTO,
        optIn: OptInSettingsDTO,
        sdkTypeVisibility: SDKTypeVisibilitySettingsDTO,
        lifeCycle: LifeCycleSettingsDTO,
        obfuscation: ObfuscationSettingsDTO,
        disablePassthroughRollouts: z.boolean(),
        dynatrace: DynatraceProjectSettingsDTO,
    })
    .passthrough()
export const CreateProjectDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(
            /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
        )
        .optional(),
    settings: ProjectSettingsDTO.optional(),
})
const EdgeDBSettings = z.object({ enabled: z.boolean() })
const ColorSettings = z.object({ primary: z.string(), secondary: z.string() })
const OptInSettings = z.object({
    enabled: z.boolean(),
    title: z.string(),
    description: z.string(),
    imageURL: z.string(),
    colors: ColorSettings,
    poweredByAlignment: z.record(z.unknown()),
})
const SDKTypeVisibilitySettings = z.object({
    enabledInFeatureSettings: z.boolean(),
})
const LifeCycleSettings = z.object({ disableCodeRefChecks: z.boolean() })
const ObfuscationSettings = z.object({
    enabled: z.boolean(),
    required: z.boolean(),
})
const FeatureApprovalWorkflowSettings = z
    .object({
        enabled: z.boolean(),
        allowPublisherBypass: z.boolean(),
        defaultReviewers: z.array(z.string()),
    })
    .passthrough()
const ReleasedStalenessSettings = z.object({ enabled: z.boolean() })
const UnmodifiedLongStalenessSettings = z.object({ enabled: z.boolean() })
const UnmodifiedShortStalenessSettings = z.object({ enabled: z.boolean() })
const UnusedStalenessSettings = z.object({ enabled: z.boolean() })
const StalenessEmailSettings = z.object({
    enabled: z.boolean(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly']),
    users: z.array(z.string()),
    lastNotification: z.string().datetime({ offset: true }),
})
const StalenessSettings = z
    .object({
        enabled: z.boolean(),
        released: ReleasedStalenessSettings,
        unmodifiedLong: UnmodifiedLongStalenessSettings,
        unmodifiedShort: UnmodifiedShortStalenessSettings,
        unused: UnusedStalenessSettings,
        email: StalenessEmailSettings,
    })
    .passthrough()
const DynatraceProjectSettings = z
    .object({
        enabled: z.boolean(),
        environmentMap: z.record(z.unknown()),
    })
    .passthrough()
export const ProjectSettings = z
    .object({
        edgeDB: EdgeDBSettings,
        optIn: OptInSettings,
        sdkTypeVisibility: SDKTypeVisibilitySettings,
        lifeCycle: LifeCycleSettings,
        obfuscation: ObfuscationSettings,
        featureApprovalWorkflow: FeatureApprovalWorkflowSettings,
        disablePassthroughRollouts: z.boolean(),
        staleness: StalenessSettings,
        dynatrace: DynatraceProjectSettings,
    })
    .passthrough()
const VercelEdgeConfigConnection = z
    .object({ edgeConfigName: z.string(), configurationId: z.string() })
    .passthrough()
export const Project = z
    .object({
        _id: z.string(),
        _organization: z.string(),
        _createdBy: z.string(),
        name: z.string(),
        key: z.string(),
        description: z.string().optional(),
        color: z.string().optional(),
        settings: ProjectSettings,
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
        hasJiraIntegration: z.boolean(),
        hasReceivedCodeUsages: z.boolean(),
        hasUserConfigFetch: z.boolean(),
        jiraBaseUrl: z.string(),
        readonly: z.boolean(),
        vercelEdgeConfigConnections: z
            .array(VercelEdgeConfigConnection)
            .optional(),
    })
    .passthrough()
export const UpdateProjectDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        color: z
            .string()
            .max(9)
            .regex(
                /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
            ),
        settings: ProjectSettingsDTO,
    })
    .partial()
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
        metaData: z.record(z.unknown()).optional(),
    })
    .passthrough()
const EnvironmentSettings = z
    .object({ appIconURI: z.string().max(2048) })
    .partial()
export const CreateEnvironmentDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(
            /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
        )
        .optional(),
    type: z.enum(['development', 'staging', 'production', 'disaster_recovery']),
    settings: EnvironmentSettings.optional(),
})
const APIKey = z.object({
    key: z.string(),
    createdAt: z.string().datetime(),
    compromised: z.boolean(),
})
export const SDKKeys = z.object({
    mobile: z.array(APIKey),
    client: z.array(APIKey),
    server: z.array(APIKey),
})
export const Environment = z.object({
    _id: z.string(),
    _project: z.string(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(
            /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
        )
        .optional(),
    type: z.enum(['development', 'staging', 'production', 'disaster_recovery']),
    _createdBy: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    sdkKeys: SDKKeys,
    settings: EnvironmentSettings.optional(),
    readonly: z.boolean(),
})
export const UpdateEnvironmentDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        color: z
            .string()
            .max(9)
            .regex(
                /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
            ),
        type: z.enum([
            'development',
            'staging',
            'production',
            'disaster_recovery',
        ]),
        settings: EnvironmentSettings,
    })
    .partial()
export const GenerateSdkTokensDto = z
    .object({ client: z.boolean(), server: z.boolean(), mobile: z.boolean() })
    .partial()
export const AllFilter = z.object({ type: z.literal('all').default('all') })
export const OptInFilter = z.object({
    type: z.literal('optIn').default('optIn'),
    _audiences: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
})
export const UserFilter = z.object({
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
export const UserCountryFilter = z
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
export const UserAppVersionFilter = z
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
export const UserPlatformVersionFilter = z.object({
    comparator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']),
    values: z.array(z.string()).optional(),
    type: z.literal('user').default('user'),
    subType: z.literal('platformVersion').default('platformVersion'),
})
export const UserCustomFilter = z
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
export const AudienceOperator = z.object({
    filters: z.array(
        z.union([
            AllFilter.passthrough(),
            UserFilter.passthrough(),
            UserCountryFilter.passthrough(),
            UserAppVersionFilter.passthrough(),
            UserPlatformVersionFilter.passthrough(),
            UserCustomFilter.passthrough(),
        ]),
    ),
    operator: z.enum(['and', 'or']),
})
export const CreateAudienceDto = z.object({
    name: z.string().min(1).max(100).optional(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .optional(),
    description: z.string().max(1000).optional(),
    filters: AudienceOperator,
    tags: z.array(z.string()).optional(),
})
export const Audience = z
    .object({
        _id: z.string(),
        _project: z.string(),
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/)
            .optional(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(1000).optional(),
        filters: AudienceOperator,
        source: z
            .enum([
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
            ])
            .optional(),
        _createdBy: z.string().optional(),
        createdAt: z.string().datetime({ offset: true }),
        updatedAt: z.string().datetime({ offset: true }),
        tags: z.array(z.string()).optional(),
        readonly: z.boolean(),
        hasUsage: z.boolean().optional(),
    })
    .passthrough()
export const UpdateAudienceDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        filters: AudienceOperator,
        tags: z.array(z.string()),
    })
    .partial()
// const AudienceEnvironments = z.record(z.unknown())
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
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
    defaultValue: z.any().optional(),
    _feature: z.string().optional(),
    validationSchema: VariableValidationEntity.optional(),
    persistent: z.boolean().optional(),
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
export const UpdateVariableDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
        validationSchema: VariableValidationEntity,
        persistent: z.boolean(),
        tags: z.array(z.string()),
    })
    .partial()
export const UpdateVariableStatusDto = z.object({
    status: z.enum(['active', 'archived']),
})
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
export const AudienceMatchFilter = z.object({
    type: z.literal('audienceMatch').default('audienceMatch'),
    comparator: z.enum(['=', '!=']).optional(),
    _audiences: z.array(z.string()).optional(),
})
export const AudienceOperatorWithAudienceMatchFilter = z.object({
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
export const UpdateTargetDto = z.object({
    _id: z.string().optional(),
    name: z.string().optional(),
    rollout: Rollout.nullable().optional(),
    distribution: z.array(TargetDistribution),
    audience: TargetAudience,
})
export const UpdateFeatureConfigDto = z
    .object({
        status: z.enum(['active', 'inactive']).default('inactive'),
        targets: z
            .array(UpdateTargetDto)
            .describe(
                'Setting an empty array will remove all targets for this configuration',
            ),
    })
    .partial()
export const CreateVariationDto = z.object({
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
                z.array(z.unknown()),
                z.record(z.unknown()),
            ]),
        )
        .optional(),
})
export const FeatureSettingsDto = z.object({
    publicName: z.string().max(100),
    publicDescription: z.string().max(1000),
    optInEnabled: z.boolean(),
})
export const FeatureSDKVisibilityDto = z.object({
    mobile: z.boolean(),
    client: z.boolean(),
    server: z.boolean(),
})

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

export const Variation = z.object({
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
                z.array(z.unknown()),
                z.record(z.unknown()),
            ]),
        )
        .optional(),
    _id: z.string(),
})
const FeatureSettings = z.object({
    publicName: z.string().max(100),
    publicDescription: z.string().max(1000),
    optInEnabled: z.boolean(),
})
const FeatureSDKVisibility = z.object({
    mobile: z.boolean(),
    client: z.boolean(),
    server: z.boolean(),
})
export const Target = z.object({
    _id: z.string(),
    name: z.string().optional(),
    audience: TargetAudience,
    rollout: Rollout.nullable().optional(),
    distribution: z.array(TargetDistribution),
    bucketingKey: z.string().optional(),
})
export const FeatureConfig = z.object({
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
const AuditLogEntity = z
    .object({
        date: z.string().datetime({ offset: true }),
        a0_user: z.string(),
        changes: z.array(z.record(z.unknown())),
    })
    .passthrough()
// const FeatureStaleness = z.record(z.unknown())
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
        changeRequests: z.array(z.record(z.unknown())).optional(),
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
                    z.array(z.unknown()),
                    z.record(z.unknown()),
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
//         variables: z.record(z.unknown()),
//         environments: z.record(z.unknown()),
//         readonly: z.boolean(),
//         type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
//         tags: z.array(z.string()).optional(),
//         controlVariation: z.string().optional(),
//         settings: FeatureSettingsDto.optional(),
//         sdkVisibility: FeatureSDKVisibilityDto.optional(),
//         staleness: z.record(z.unknown()).optional(),
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
//         staleness: z.record(z.unknown()),
//         summary: UpdateFeatureSummaryDto,
//         variables: z.record(z.unknown()),
//         environments: z.record(z.unknown()),
//     })
//     .partial()
//     .passthrough()
const LinkJiraIssueDto = z.object({ issueId: z.string() })
export const JiraIssueLink = z.object({ issueId: z.string() })
export const FeatureVariationDto = z.object({
    _id: z.string(),
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
                z.array(z.unknown()),
                z.record(z.unknown()),
            ]),
        )
        .optional(),
})
export const UpdateFeatureVariationDto = z
    .object({
        _id: z.string(),
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        variables: z.record(
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.array(z.unknown()),
                z.record(z.unknown()),
            ]),
        ),
    })
    .partial()
const FeatureDataPoint = z.object({
    values: z.record(z.unknown()),
    date: z.string().datetime({ offset: true }),
})
const ResultWithFeatureData = z
    .object({
        evaluations: z.array(FeatureDataPoint),
    })
    .partial()
export const ResultEvaluationsByHourDto = z.object({
    result: ResultWithFeatureData,
    cached: z.boolean(),
    updatedAt: z.string().datetime({ offset: true }),
})
const ProjectDataPoint = z.object({
    date: z.string().datetime({ offset: true }),
    value: z.number(),
})
const ResultsWithProjectData = z
    .object({
        evaluations: z.array(ProjectDataPoint),
    })
    .partial()
export const ResultProjectEvaluationsByHourDto = z.object({
    result: ResultsWithProjectData,
    cached: z.boolean(),
    updatedAt: z.string().datetime({ offset: true }),
})
export const ProjectUserProfile = z.object({
    _id: z.string(),
    _project: z.string(),
    a0_user: z.string(),
    dvcUserId: z.string().nullish(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
})
export const UpdateProjectUserProfileDto = z.object({
    dvcUserId: z.string().nullable(),
})
const UpdateUserProfileDto = z
    .object({ dvcUserId: z.string().nullable() })
    .partial()
const AllowedValue = z.object({
    label: z.string(),
    value: z.record(z.unknown()),
})
const EnumSchema = z.object({
    allowedValues: z.array(AllowedValue),
    allowAdditionalValues: z.boolean(),
})
const PropertySchema = z
    .object({
        schemaType: z.enum(['enum']),
        required: z.boolean(),
        enumSchema: EnumSchema,
    })
    .partial()
export const CreateCustomPropertyDto = z.object({
    name: z.string().min(1).max(100),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    type: z.enum(['String', 'Boolean', 'Number']),
    propertyKey: z.string(),
    schema: PropertySchema.optional(),
})
export const CustomProperty = z.object({
    _id: z.string(),
    _project: z.string(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    _createdBy: z.string(),
    propertyKey: z.string(),
    type: z.enum(['String', 'Boolean', 'Number']),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    schema: PropertySchema.optional(),
    hasUsage: z.boolean().optional(),
})
export const UpdateCustomPropertyDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        propertyKey: z.string(),
        type: z.enum(['String', 'Boolean', 'Number']),
        schema: PropertySchema,
    })
    .partial()
export const CreateMetricDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    event: z.string(),
    dimension: z.enum([
        'COUNT_PER_UNIQUE_USER',
        'COUNT_PER_VARIABLE_EVALUATION',
        'SUM_PER_UNIQUE_USER',
        'AVERAGE_PER_UNIQUE_USER',
        'TOTAL_AVERAGE',
        'TOTAL_SUM',
    ]),
    optimize: z.enum(['increase', 'decrease']),
})
export const Metric = z.object({
    _id: z.string(),
    _project: z.string(),
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    source: z
        .enum([
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
        ])
        .optional(),
    event: z.string(),
    dimension: z.enum([
        'COUNT_PER_UNIQUE_USER',
        'COUNT_PER_VARIABLE_EVALUATION',
        'SUM_PER_UNIQUE_USER',
        'AVERAGE_PER_UNIQUE_USER',
        'TOTAL_AVERAGE',
        'TOTAL_SUM',
    ]),
    optimize: z.enum(['increase', 'decrease']),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
})
export const UpdateMetricDto = z
    .object({
        key: z
            .string()
            .min(1)
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().min(1).max(100),
        description: z.string().max(1000),
        event: z.string(),
        dimension: z.enum([
            'COUNT_PER_UNIQUE_USER',
            'COUNT_PER_VARIABLE_EVALUATION',
            'SUM_PER_UNIQUE_USER',
            'AVERAGE_PER_UNIQUE_USER',
            'TOTAL_AVERAGE',
            'TOTAL_SUM',
        ]),
        optimize: z.enum(['increase', 'decrease']),
    })
    .partial()
const VariationValues = z.object({}).partial()
const DataPoint = z.object({
    date: z.string().datetime({ offset: true }),
    values: VariationValues,
})
const VariationResult = z.object({
    key: z.string(),
    name: z.string(),
    numerator: z.number(),
    denominator: z.number(),
    rate: z.number(),
    avgValue: z.number().optional(),
    totalValue: z.number().optional(),
    stdev: z.number().optional(),
    percentDifference: z.number().nullable(),
    chanceToBeatControl: z.number().nullable(),
})
const Result = z
    .object({
        dataSeries: z.array(DataPoint),
        variations: z.array(VariationResult),
    })
    .partial()
export const MetricResult = z.object({
    result: Result,
    cached: z.boolean(),
    updatedAt: z.string().datetime({ offset: true }),
})
export const MetricAssociation = z.object({
    _project: z.string(),
    feature: Feature,
    metric: Metric,
    createdAt: z.string().datetime({ offset: true }),
})
export const CreateMetricAssociationDto = z.object({
    metric: z.string(),
    feature: z.string(),
})
export const DeleteMetricAssociationDto = z.object({
    metric: z.string(),
    feature: z.string(),
})
export const UpdateUserOverrideDto = z.object({
    environment: z.string(),
    variation: z.string(),
})
export const Override = z.object({
    _project: z.string(),
    _environment: z.string(),
    _feature: z.string(),
    _variation: z.string(),
    dvcUserId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    a0_user: z.string().optional(),
})
export const FeatureOverride = z.object({
    _environment: z.string(),
    _variation: z.string(),
})
export const OverrideResponse = z.object({
    overrides: z.array(FeatureOverride),
})
export const FeatureOverrideResponse = z.object({
    overrides: z.record(z.array(Override)),
    uniqueTeamMembers: z.number(),
})
export const UserOverride = z.object({
    _feature: z.string(),
    featureName: z.string(),
    _environment: z.string(),
    environmentName: z.string(),
    _variation: z.string(),
    variationName: z.string(),
})
// const AudiencePatchAction = z
//     .object({
//         values: z.record(z.unknown()),
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
//         metaData: z.record(z.unknown()),
//     })
//     .partial()
//     .passthrough()
// const Reviewers = z.record(z.unknown())
// const ReviewReason = z.record(z.unknown())
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
//         body: z.record(z.unknown()),
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
//         changes: z.array(z.record(z.unknown())).optional(),
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
//         outputFormat: z.record(z.unknown()).optional(),
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
//         outputFormat: z.record(z.unknown()).optional(),
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
//         outputFormat: z.record(z.unknown()).optional(),
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
export const ReassociateVariableDto = z.object({
    key: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
})
