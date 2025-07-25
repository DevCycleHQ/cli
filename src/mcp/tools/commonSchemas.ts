/**
 * Common schema definitions used across multiple MCP tool files
 */

// =============================================================================
// SHARED OUTPUT SCHEMA PROPERTIES
// =============================================================================

export const DASHBOARD_LINK_PROPERTY = {
    type: 'string' as const,
    format: 'uri' as const,
    description: 'URL to view and manage resources in the DevCycle dashboard',
}

export const MESSAGE_RESPONSE_SCHEMA = {
    type: 'object' as const,
    properties: {
        message: {
            type: 'string' as const,
        },
    },
    required: ['message'],
}

// =============================================================================
// SHARED INPUT SCHEMA PROPERTIES
// =============================================================================

export const FEATURE_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the feature (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

export const ENVIRONMENT_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The key of the environment (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

export const VARIATION_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'Unique variation key (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

export const VARIABLE_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The variable key (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

export const PROJECT_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The project key (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

export const CUSTOM_PROPERTY_KEY_PROPERTY = {
    type: 'string' as const,
    description:
        'The custom property key (unique, immutable, max 100 characters, pattern: ^[a-z0-9-_.]+$)',
}

// Filter type definitions based on DevCycle API swagger schemas

export const ALL_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter that matches all users',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['all'] as const,
        },
    },
    required: ['type'] as const,
}

export const USER_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by basic user properties',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['user'] as const,
        },
        subType: {
            type: 'string' as const,
            description: 'Sub type of this filter',
            enum: ['user_id', 'email', 'platform', 'deviceModel'] as const,
        },
        comparator: {
            type: 'string' as const,
            description: 'Comparator to use',
            enum: [
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
            ] as const,
        },
        values: {
            type: 'array' as const,
            description:
                'Array of values (required for all filters except exist/!exist)',
            items: {
                type: 'string' as const,
            },
        },
    },
    required: ['type', 'subType', 'comparator'] as const,
}

export const USER_COUNTRY_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by user country',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['user'] as const,
        },
        subType: {
            type: 'string' as const,
            description: 'Sub type of this filter',
            enum: ['country'] as const,
        },
        comparator: {
            type: 'string' as const,
            description: 'Comparator to use',
            enum: [
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
            ] as const,
        },
        values: {
            type: 'array' as const,
            description: 'Array of country codes (e.g., CA, US)',
            items: {
                type: 'string' as const,
            },
        },
    },
    required: ['type', 'subType', 'comparator'] as const,
}

export const USER_APP_VERSION_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by application version',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['user'] as const,
        },
        subType: {
            type: 'string' as const,
            description: 'Sub type of this filter',
            enum: ['appVersion'] as const,
        },
        comparator: {
            type: 'string' as const,
            description: 'Comparator to use',
            enum: ['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist'] as const,
        },
        values: {
            type: 'array' as const,
            description: 'Array of version strings (e.g., 1.0.2)',
            items: {
                type: 'string' as const,
            },
        },
    },
    required: ['type', 'subType', 'comparator'] as const,
}

export const USER_PLATFORM_VERSION_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by platform version',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['user'] as const,
        },
        subType: {
            type: 'string' as const,
            description: 'Sub type of this filter',
            enum: ['platformVersion'] as const,
        },
        comparator: {
            type: 'string' as const,
            description: 'Comparator to use',
            enum: ['=', '!=', '>', '>=', '<', '<=', 'exist', '!exist'] as const,
        },
        values: {
            type: 'array' as const,
            description: 'Array of platform version strings',
            items: {
                type: 'string' as const,
            },
        },
    },
    required: ['type', 'subType', 'comparator'] as const,
}

export const USER_CUSTOM_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by custom user data properties',
    properties: {
        type: {
            type: 'string' as const,
            description: 'Filter type of this audience',
            enum: ['user'] as const,
        },
        subType: {
            type: 'string' as const,
            description: 'Sub type of this filter',
            enum: ['customData'] as const,
        },
        comparator: {
            type: 'string' as const,
            description: 'Comparator to use',
            enum: [
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
            ] as const,
        },
        dataKey: {
            type: 'string' as const,
            description: 'Data Key used for custom data',
            minLength: 1,
        },
        dataKeyType: {
            type: 'string' as const,
            description: 'Data Key Type used for custom data',
            enum: ['String', 'Boolean', 'Number'] as const,
        },
        values: {
            type: 'array' as const,
            description: 'Array of values (type depends on dataKeyType)',
            items: {
                anyOf: [
                    { type: 'string' as const },
                    { type: 'number' as const },
                    { type: 'boolean' as const },
                ],
            },
        },
    },
    required: [
        'type',
        'subType',
        'comparator',
        'dataKey',
        'dataKeyType',
    ] as const,
}

export const AUDIENCE_MATCH_FILTER_SCHEMA = {
    type: 'object' as const,
    description: 'Filter by audience membership',
    properties: {
        type: {
            type: 'string' as const,
            enum: ['audienceMatch'] as const,
        },
        comparator: {
            type: 'string' as const,
            enum: ['=', '!='] as const,
        },
        _audiences: {
            type: 'array' as const,
            description: 'Array of audience IDs to match against',
            items: {
                type: 'string' as const,
            },
        },
    },
    required: ['type'] as const,
}

// Target Audience schema based on DevCycle API swagger definition
export const TARGET_AUDIENCE_PROPERTY = {
    type: 'object' as const,
    description: 'Audience definition for the target',
    properties: {
        name: {
            type: 'string' as const,
            description:
                'Audience display name, must be set for project-level audiences.',
            example: 'Android Users',
            maxLength: 100,
            minLength: 1,
        },
        filters: {
            type: 'object' as const,
            description:
                'Audience filters, describing logic for segmenting users',
            properties: {
                filters: {
                    type: 'array' as const,
                    description: 'Array of filter conditions',
                    items: {
                        anyOf: [
                            ALL_FILTER_SCHEMA,
                            USER_FILTER_SCHEMA,
                            USER_COUNTRY_FILTER_SCHEMA,
                            USER_APP_VERSION_FILTER_SCHEMA,
                            USER_PLATFORM_VERSION_FILTER_SCHEMA,
                            USER_CUSTOM_FILTER_SCHEMA,
                            AUDIENCE_MATCH_FILTER_SCHEMA,
                        ],
                    },
                },
                operator: {
                    type: 'string' as const,
                    description: 'Operator type for combining filters',
                    enum: ['and', 'or'] as const,
                },
            },
            required: ['filters', 'operator'] as const,
        },
    },
    required: ['filters'] as const,
}

// =============================================================================
// RESULTS AND ANALYTICS PROPERTIES
// =============================================================================

export const EVALUATION_QUERY_PROPERTIES = {
    startDate: {
        type: 'number' as const,
        description: 'Start date as Unix timestamp (milliseconds since epoch)',
    },
    endDate: {
        type: 'number' as const,
        description: 'End date as Unix timestamp (milliseconds since epoch)',
    },
    platform: {
        type: 'string' as const,
        description: 'Platform filter for evaluation results',
    },
    variable: {
        type: 'string' as const,
        description: 'Variable key filter for evaluation results',
    },
    environment: {
        type: 'string' as const,
        description: 'Environment key to filter results',
    },
    period: {
        type: 'string' as const,
        enum: ['day', 'hour', 'month'] as const,
        description: 'Time aggregation period for results',
    },
    sdkType: {
        type: 'string' as const,
        enum: ['client', 'server', 'mobile', 'api'] as const,
        description: 'Filter by SDK type',
    },
}

export const EVALUATION_DATA_POINT_SCHEMA = {
    type: 'object' as const,
    properties: {
        date: {
            type: 'string' as const,
            format: 'date-time' as const,
            description: 'ISO timestamp for this data point',
        },
        values: {
            type: 'object' as const,
            description: 'Evaluation values for this time period',
        },
    },
    required: ['date', 'values'] as const,
}

export const PROJECT_DATA_POINT_SCHEMA = {
    type: 'object' as const,
    properties: {
        date: {
            type: 'string' as const,
            format: 'date-time' as const,
            description: 'ISO timestamp for this data point',
        },
        value: {
            type: 'number' as const,
            description: 'Total evaluations in this time period',
        },
    },
    required: ['date', 'value'] as const,
}
