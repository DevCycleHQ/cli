import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

const EdgeDBSettings = z.object({ enabled: z.boolean() })
const ColorSettings = z.object({
    primary: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/),
    secondary: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/),
})
const OptInSettings = z.object({
    title: z.string().max(100),
    description: z.string().max(1000),
    enabled: z.boolean(),
    imageURL: z.string(),
    colors: ColorSettings,
    poweredByAlignment: z.enum(['center', 'left', 'right', 'hidden']),
})
const SDKTypeVisibilitySettings = z.object({
    enabledInFeatureSettings: z.boolean(),
})
const ObfuscationSettings = z.object({
    enabled: z.boolean(),
    required: z.boolean(),
})
const StalenessSettings = z
    .object({
        enabled: z.boolean(),
    })
    .optional()
const ProjectSettings = z.object({
    edgeDB: EdgeDBSettings,
    optIn: OptInSettings,
    sdkTypeVisibility: SDKTypeVisibilitySettings,
    obfuscation: ObfuscationSettings,
    staleness: StalenessSettings,
})
const CreateProjectDto = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/)
        .optional(),
    settings: ProjectSettings.optional(),
})
const Project = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/)
        .optional(),
    _id: z.string(),
    _organization: z.string(),
    _createdBy: z.string(),
    settings: ProjectSettings,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    hasJiraIntegration: z.boolean(),
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
const UpdateProjectDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        description: z.string().max(1000),
        color: z
            .string()
            .max(9)
            .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/),
        settings: ProjectSettings,
    })
    .partial()
const CannotDeleteLastItemErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})
const EnvironmentSettings = z
    .object({ appIconURI: z.string().max(2048) })
    .partial()
const CreateEnvironmentDto = z.object({
    name: z.string().max(100).nonempty(),
    key: z
        .string()
        .max(100)
        .nonempty()
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/)
        .optional(),
    type: z.enum(['development', 'staging', 'production', 'disaster_recovery']),
    settings: EnvironmentSettings.optional(),
})
const APIKey = z.object({
    key: z.string(),
    createdAt: z.string().datetime(),
    compromised: z.boolean(),
})
const SDKKeys = z.object({
    mobile: z.array(APIKey),
    client: z.array(APIKey),
    server: z.array(APIKey),
})
const Environment = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    color: z
        .string()
        .max(9)
        .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/)
        .optional(),
    _id: z.string(),
    _project: z.string(),
    type: z.enum(['development', 'staging', 'production', 'disaster_recovery']),
    _createdBy: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    sdkKeys: SDKKeys,
    settings: EnvironmentSettings.optional(),
    readonly: z.boolean(),
})
const UpdateEnvironmentDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        description: z.string().max(1000),
        color: z
            .string()
            .max(9)
            .regex(/^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/),
        type: z.enum([
            'development',
            'staging',
            'production',
            'disaster_recovery',
        ]),
        settings: EnvironmentSettings,
    })
    .partial()
const GenerateSdkTokensDto = z
    .object({ client: z.boolean(), server: z.boolean(), mobile: z.boolean() })
    .partial()
const AllFilter = z.object({ type: z.literal('all').default('all') })
const OptInFilter = z.object({ type: z.literal('optIn').default('optIn') })
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
const UserCountryFilter = z.object({
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
    values: z.array(z.string()),
    type: z.literal('user').default('user'),
})
const UserAppVersionFilter = z.object({
    comparator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']),
    values: z.array(z.string()).optional(),
    type: z.literal('user').default('user'),
    subType: z.literal('appVersion').default('appVersion'),
})
const UserPlatformVersionFilter = z.object({
    comparator: z.enum(['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist']),
    values: z.array(z.string()).optional(),
    type: z.literal('user').default('user'),
    subType: z.literal('platformVersion').default('platformVersion'),
})
const UserCustomFilter = z.object({
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
    values: z.array(z.union([z.boolean(), z.string(), z.number()])).optional(),
    type: z.literal('user').default('user'),
    subType: z.literal('customData').default('customData'),
})
const AudienceOperator = z.object({
    filters: z.array(
        z.union([
            AllFilter.passthrough(),
            OptInFilter.passthrough(),
            UserFilter.passthrough(),
            UserCountryFilter.passthrough(),
            UserAppVersionFilter.passthrough(),
            UserPlatformVersionFilter.passthrough(),
            UserCustomFilter.passthrough(),
        ]),
    ),
    operator: z.enum(['and', 'or']),
})
const CreateAudienceDto = z.object({
    name: z.string().max(100).optional(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .optional(),
    description: z.string().max(1000).optional(),
    filters: AudienceOperator,
    tags: z.array(z.string()).optional(),
})
const Audience = z.object({
    name: z.string().max(100).optional(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/)
        .optional(),
    description: z.string().max(1000).optional(),
    _id: z.string(),
    _project: z.string(),
    filters: AudienceOperator,
    source: z
        .enum([
            'api',
            'dashboard',
            'importer',
            'github.code_usages',
            'github.pr_insights',
            'bitbucket.code_usages',
            'bitbucket.pr_insights',
            'terraform',
            'cli',
        ])
        .optional(),
    _createdBy: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    tags: z.array(z.string()).optional(),
})
const UpdateAudienceDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        description: z.string().max(1000),
        filters: AudienceOperator,
        tags: z.array(z.string()),
    })
    .partial()
const VariableValidationEntity = z.object({
    schemaType: z.string(),
    enumValues: z.array(z.any()).optional(),
    regexPattern: z.string().optional(),
    jsonSchema: z.string().optional(),
    description: z.string(),
    exampleValue: z.any(),
})
const CreateVariableDto = z.object({
    name: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    _feature: z.string().optional(),
    type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
    defaultValue: z.any().optional(),
    validationSchema: VariableValidationEntity.optional(),
})
const Variable = z.object({
    name: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    key: z
        .string()
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
        'bitbucket.code_usages',
        'bitbucket.pr_insights',
        'terraform',
        'cli',
    ]),
    _createdBy: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    validationSchema: VariableValidationEntity.optional(),
    persistent: z.boolean().optional(),
})
const UpdateVariableDto = z
    .object({
        name: z.string().max(100),
        description: z.string().max(1000),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        type: z.enum(['String', 'Boolean', 'Number', 'JSON']),
        validationSchema: VariableValidationEntity,
    })
    .partial()
const UpdateVariableStatusDto = z.object({
    status: z.enum(['active', 'archived']),
})
const ReassociateVariableDto = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
})
const FeatureVariationDto = z.object({
    _id: z.string(),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().max(100),
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
const FeatureSDKVisibilityDto = z.object({
    mobile: z.boolean(),
    client: z.boolean(),
    server: z.boolean(),
})
const CreateFeatureDto = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    variables: z
        .array(z.union([CreateVariableDto, ReassociateVariableDto]))
        .optional(),
    configurations: z
        .record(
            z.string(),
            z.object({
                targets: z.array(z.any()).optional(),
                status: z.string().optional(),
            }),
        )
        .optional(),
    variations: z.array(FeatureVariationDto.partial()).optional(),
    controlVariation: z.string().optional(),
    settings: FeatureSettingsDto.optional(),
    sdkVisibility: FeatureSDKVisibilityDto.optional(),
    type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
    tags: z.array(z.string()).optional(),
})
const Variation = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().max(100),
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
const CreateVariationDto = z.object({
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    name: z.string().max(100),
    variables: z.record(z.any()).optional(),
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
const PreconditionFailedErrorResponse = z.object({
    statusCode: z.number(),
    message: z.object({}).partial(),
    error: z.string(),
})
const UpdateFeatureDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        description: z.string().max(1000),
        variables: z.array(
            z.union([CreateVariableDto, ReassociateVariableDto]),
        ),
        variations: z.array(FeatureVariationDto),
        settings: FeatureSettingsDto,
        sdkVisibility: FeatureSDKVisibilityDto,
        type: z.enum(['release', 'experiment', 'permission', 'ops']),
        tags: z.array(z.string()),
        controlVariation: z.string(),
    })
    .partial()
const LinkJiraIssueDto = z.object({ issueId: z.string() })
const JiraIssueLink = z.object({ issueId: z.string() })
const UpdateFeatureVariationDto = z
    .object({
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        name: z.string().max(100),
        variables: z.record(
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
                z.array(z.any()),
                z.object({}).partial().passthrough(),
            ]),
        ),
        _id: z.string(),
    })
    .partial()
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
    name: z.string().max(100).optional(),
    filters: AudienceOperatorWithAudienceMatchFilter,
})
const RolloutStage = z.object({
    percentage: z.number().gte(0).lte(1),
    type: z.enum(['linear', 'discrete']),
    date: z.string().datetime(),
})
const Rollout = z.object({
    startPercentage: z.number().gte(0).lte(1).optional(),
    type: z.enum(['schedule', 'gradual', 'stepped']),
    startDate: z.string().datetime(),
    stages: z.array(RolloutStage).optional(),
})
const TargetDistribution = z.object({
    percentage: z.number().gte(0).lte(1),
    _variation: z.string(),
})
const Target = z.object({
    _id: z.string(),
    name: z.string().optional(),
    audience: TargetAudience,
    rollout: Rollout.nullable().optional(),
    distribution: z.array(TargetDistribution),
})
const FeatureConfig = z.object({
    _feature: z.string(),
    _environment: z.string(),
    _createdBy: z.string(),
    status: z.enum(['active', 'inactive', 'archived']),
    startedAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime(),
    targets: z.array(Target),
    readonly: z.boolean(),
})
const UpdateTargetDto = z.object({
    _id: z.string().optional(),
    name: z.string().optional(),
    rollout: Rollout.nullable().optional(),
    distribution: z.array(TargetDistribution),
    audience: TargetAudience,
})
const UpdateFeatureConfigDto = z
    .object({
        targets: z.array(UpdateTargetDto),
        status: z.enum(['active', 'inactive', 'archived']),
    })
    .partial()
const ResultSummaryDto = z.object({
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
const Feature = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    _id: z.string(),
    _project: z.string(),
    source: z.enum([
        'api',
        'dashboard',
        'importer',
        'github.code_usages',
        'github.pr_insights',
        'bitbucket.code_usages',
        'bitbucket.pr_insights',
        'terraform',
        'cli',
    ]),
    type: z.enum(['release', 'experiment', 'permission', 'ops']).optional(),
    status: z.enum(['active', 'complete', 'archived']).optional(),
    configurations: z.array(FeatureConfig.partial()).optional(),
    _createdBy: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    variations: z.array(Variation),
    controlVariation: z.string(),
    variables: z.array(Variable),
    tags: z.array(z.string()).optional(),
    ldLink: z.string().optional(),
    readonly: z.boolean(),
    settings: FeatureSettings.partial().optional(),
    sdkVisibility: FeatureSDKVisibility.optional(),
    staleness: z
        .object({
            stale: z.boolean(),
            updatedAt: z.string().datetime().optional(),
            disabled: z.boolean().optional(),
            snoozedUntil: z.string().datetime().optional(),
            reason: z.string().optional(),
            metaData: z.record(z.string(), z.unknown()).optional(),
        })
        .optional(),
})
const FeatureDataPoint = z.object({
    values: z.object({}).partial(),
    date: z.string().datetime(),
})
const ResultEvaluationsByHourDto = z.object({
    result: z.object({ evaluations: z.array(FeatureDataPoint) }).partial(),
    cached: z.boolean(),
    updatedAt: z.string().datetime(),
})
const ProjectDataPoint = z.object({
    date: z.string().datetime(),
    value: z.number(),
})
const ResultProjectEvaluationsByHourDto = z.object({
    result: z.object({ evaluations: z.array(ProjectDataPoint) }).partial(),
    cached: z.boolean(),
    updatedAt: z.string().datetime(),
})
const CreateCustomPropertyDto = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    type: z.enum(['String', 'Boolean', 'Number']),
    propertyKey: z.string(),
})
const CustomProperty = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    _id: z.string(),
    _project: z.string(),
    _createdBy: z.string(),
    propertyKey: z.string(),
    schema: z
        .object({
            schemaType: z.enum(['enum']),
            required: z.boolean().optional(),
            enumSchema: z
                .object({
                    allowedValues: z.array(
                        z.object({
                            label: z.string(),
                            value: z.union([z.string(), z.number()]),
                        }),
                    ),
                    allowAdditionalValues: z.boolean().optional(),
                })
                .optional(),
        })
        .optional(),
    type: z.enum(['String', 'Boolean', 'Number']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
})
const UpdateCustomPropertyDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
        propertyKey: z.string(),
        type: z.enum(['String', 'Boolean', 'Number']),
    })
    .partial()
const CreateMetricDto = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
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
const Metric = z.object({
    name: z.string().max(100),
    key: z
        .string()
        .max(100)
        .regex(/^[a-z0-9-_.]+$/),
    description: z.string().max(1000).optional(),
    _id: z.string(),
    _project: z.string(),
    source: z
        .enum([
            'api',
            'dashboard',
            'importer',
            'github.code_usages',
            'github.pr_insights',
            'bitbucket.code_usages',
            'bitbucket.pr_insights',
            'terraform',
            'cli',
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
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
})
const UpdateMetricDto = z
    .object({
        name: z.string().max(100),
        key: z
            .string()
            .max(100)
            .regex(/^[a-z0-9-_.]+$/),
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
    date: z.string().datetime(),
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
const MetricResult = z.object({
    result: z
        .object({
            dataSeries: z.array(DataPoint),
            variations: z.array(VariationResult),
        })
        .partial(),
    cached: z.boolean(),
    updatedAt: z.string().datetime(),
})
const MetricAssociation = z.object({
    _project: z.string(),
    feature: Feature,
    metric: Metric,
    createdAt: z.string().datetime(),
})
const CreateMetricAssociationDto = z.object({
    metric: z.string(),
    feature: z.string(),
})
const DeleteMetricAssociationDto = z.object({
    metric: z.string(),
    feature: z.string(),
})
const ProjectUserProfile = z.object({
    _id: z.string(),
    _project: z.string(),
    a0_user: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    dvcUserId: z.string().optional(),
})
const UpdateProjectUserProfileDto = z.object({
    dvcUserId: z.string().nullable(),
})
const Override = z.object({
    _project: z.string(),
    _environment: z.string(),
    _feature: z.string(),
    _variation: z.string(),
    dvcUserId: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    a0_user: z.string().optional(),
})
const Overrides = z.array(Override)
const UpdateUserOverrideDto = z.object({
    environment: z.string(),
    variation: z.string(),
})
const FeatureOverride = z.object({
    _environment: z.string(),
    _variation: z.string(),
})
const FeatureOverrideResponse = z.object({
    overrides: z.array(FeatureOverride),
})
const UserOverride = z.object({
    _feature: z.string(),
    featureName: z.string(),
    _environment: z.string(),
    environmentName: z.string(),
    _variation: z.string(),
    variationName: z.string(),
})
const UserOverrides = z.array(UserOverride)

export const schemas = {
    EdgeDBSettings,
    ColorSettings,
    OptInSettings,
    SDKTypeVisibilitySettings,
    ProjectSettings,
    CreateProjectDto,
    Project,
    BadRequestErrorResponse,
    ConflictErrorResponse,
    NotFoundErrorResponse,
    UpdateProjectDto,
    CannotDeleteLastItemErrorResponse,
    EnvironmentSettings,
    CreateEnvironmentDto,
    APIKey,
    SDKKeys,
    Environment,
    UpdateEnvironmentDto,
    GenerateSdkTokensDto,
    AllFilter,
    OptInFilter,
    UserFilter,
    UserCountryFilter,
    UserAppVersionFilter,
    UserPlatformVersionFilter,
    UserCustomFilter,
    AudienceOperator,
    CreateAudienceDto,
    Audience,
    UpdateAudienceDto,
    VariableValidationEntity,
    CreateVariableDto,
    Variable,
    UpdateVariableDto,
    UpdateVariableStatusDto,
    ReassociateVariableDto,
    FeatureVariationDto,
    FeatureSettingsDto,
    FeatureSDKVisibilityDto,
    CreateFeatureDto,
    Variation,
    CreateVariationDto,
    FeatureSettings,
    FeatureSDKVisibility,
    Feature,
    PreconditionFailedErrorResponse,
    UpdateFeatureDto,
    LinkJiraIssueDto,
    JiraIssueLink,
    UpdateFeatureVariationDto,
    AudienceMatchFilter,
    AudienceOperatorWithAudienceMatchFilter,
    TargetAudience,
    RolloutStage,
    Rollout,
    TargetDistribution,
    Target,
    FeatureConfig,
    UpdateTargetDto,
    UpdateFeatureConfigDto,
    ResultSummaryDto,
    FeatureDataPoint,
    ResultEvaluationsByHourDto,
    ProjectDataPoint,
    ResultProjectEvaluationsByHourDto,
    CreateCustomPropertyDto,
    CustomProperty,
    UpdateCustomPropertyDto,
    CreateMetricDto,
    Metric,
    UpdateMetricDto,
    VariationValues,
    DataPoint,
    VariationResult,
    MetricResult,
    MetricAssociation,
    CreateMetricAssociationDto,
    DeleteMetricAssociationDto,
    ProjectUserProfile,
    UpdateProjectUserProfileDto,
    UpdateUserOverrideDto,
    Override,
    Overrides,
    FeatureOverrideResponse,
    UserOverride,
    UserOverrides,
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
                name: 'type',
                type: 'Query',
                schema: z
                    .enum(['release', 'experiment', 'permission', 'ops'])
                    .optional(),
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
        response: UserOverrides,
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
])

export const api = new Zodios(endpoints)
export const v2Api = new Zodios(v2Endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options)
}

export function createV2ApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, v2Endpoints, options)
}
