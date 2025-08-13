import { ux as cliUx } from '@oclif/core'
import {
    FeatureConfig,
    Environment,
    Variation,
    Audience as AudienceSchema,
} from '../api/schemas'
import chalk from 'chalk'
import { COLORS } from './constants/colors'
import {
    buildAudienceNameMap,
    replaceAudienceIdInFilter,
} from '../utils/audiences'

type Distribution = FeatureConfig['targets'][0]['distribution']
type Audience = FeatureConfig['targets'][0]['audience']
type Rollout = FeatureConfig['targets'][0]['rollout']
type Rule = Pick<
    FeatureConfig['targets'][0],
    'audience' | 'distribution' | 'rollout'
>
type Filters = Audience['filters']['filters']
type Operator = Audience['filters']['operator']

const subTypeMap = {
    email: 'Email',
    user_id: 'User ID',
    platform: 'Platform',
    platformVersion: 'Platform Version',
    country: 'Country',
    appVersion: 'App Version',
    deviceModel: 'Device Model',
    customData: 'Custom Data',
    audienceMatch: 'Audience Match',
    deviceType: 'Device Type',
}
const comparatorMap = {
    '=': 'is',
    '!=': 'is not',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '<': 'is less than',
    '<=': 'is less than or equal to',
    contain: 'contains',
    '!contain': 'does not contain',
    startWith: 'starts with',
    '!startWith': 'does not start with',
    endWith: 'ends with',
    '!endWith': 'does not end with',
    exist: 'exists',
    '!exist': 'does not exist',
}

export const renderTargetingTree = (
    featureConfigs: FeatureConfig[],
    environments: Environment[],
    variations: Variation[],
    audiences: AudienceSchema[],
) => {
    const targetingTree = cliUx.tree()
    featureConfigs.forEach((config) => {
        const environmentTree = cliUx.tree()

        insertStatusTree(environmentTree, config.status)
        insertRulesTree(environmentTree, config.targets, variations, audiences)

        const environmentName = environments.find(
            (env) => env._id === config._environment,
        )?.name
        targetingTree.insert(
            environmentName || config._environment,
            environmentTree,
        )
    })
    targetingTree.display()
}

export const renderRulesTree = (
    targets: Rule[],
    variations: Variation[],
    audiences: AudienceSchema[],
) => {
    const rulesTree = buildRulesTree(targets, variations, audiences)
    rulesTree.display()
}

export const renderDefinitionTree = (
    filters: Filters,
    operator: Operator,
    audiences: AudienceSchema[],
) => {
    const definitionTree = buildDefinitionTree(filters, operator, audiences)
    definitionTree.display()
}

const insertStatusTree = (
    rootTree: ReturnType<typeof cliUx.tree>,
    status: FeatureConfig['status'],
) => {
    const statusTree = cliUx.tree()
    const convertedStatus = status === 'active' ? 'enabled' : 'disabled'
    const displayStatus = coloredStatus(convertedStatus)
    statusTree.insert(displayStatus)
    const statusTitle = coloredTitle('status')
    rootTree.insert(statusTitle, statusTree)
}

const buildRulesTree = (
    targets: Rule[],
    variations: Variation[],
    audiences: AudienceSchema[],
) => {
    const rulesTree = cliUx.tree()
    targets.forEach((target, idx) => {
        const ruleTree = cliUx.tree()

        insertDefinitionTree(ruleTree, target.audience, audiences)
        insertServeTree(ruleTree, target.distribution, variations)
        insertScheduleTree(ruleTree, target.rollout)

        rulesTree.insert(
            `${idx + 1}. ${target.audience.name || 'Audience'}`,
            ruleTree,
        )
    })
    return rulesTree
}

const insertRulesTree = (
    rootTree: ReturnType<typeof cliUx.tree>,
    targets: Rule[],
    variations: Variation[],
    audiences: AudienceSchema[],
) => {
    if (!targets.length) return

    const rulesTree = buildRulesTree(targets, variations, audiences)
    const rulesTitle = coloredTitle('rules')
    rootTree.insert(rulesTitle, rulesTree)
}

const buildDefinitionTree = (
    filters: Filters,
    operator: Operator,
    audiences: AudienceSchema[],
) => {
    const definitionTree = cliUx.tree()
    const prefixWithOperator = (value: string, index: number) =>
        index !== 0 ? `${operator.toUpperCase()} ${value}` : value

    filters.forEach((filter, index) => {
        if (filter.type === 'all') {
            const prefixedProperty = prefixWithOperator('All Users', index)
            definitionTree.insert(prefixedProperty)
        } else if (filter.type === 'user') {
            const userFilter = cliUx.tree()
            const values = cliUx.tree()
            if (
                Array.isArray(filter.values) &&
                !['exist', '!exist'].includes(filter.subType)
            ) {
                filter.values.forEach((value) =>
                    values.insert(value.toString()),
                )
            }
            userFilter.insert(comparatorMap[filter.comparator], values)
            const userProperty =
                filter.subType === 'customData'
                    ? filter.dataKey
                    : subTypeMap[filter.subType]
            const prefixedProperty = prefixWithOperator(userProperty, index)
            definitionTree.insert(prefixedProperty, userFilter)
        } else if (filter.type === 'audienceMatch') {
            const audienceFilter = cliUx.tree()
            const audienceTree = cliUx.tree()
            const audienceMap = buildAudienceNameMap(audiences)
            const replacedIdFilter = (replaceAudienceIdInFilter(
                filter,
                audienceMap,
            ) || filter) as typeof filter
            replacedIdFilter._audiences?.forEach((audience) =>
                audienceTree.insert(audience),
            )
            audienceFilter.insert(
                comparatorMap[filter.comparator!],
                audienceTree,
            )
            definitionTree.insert(
                prefixWithOperator('Audience', index),
                audienceFilter,
            )
        }
    })
    return definitionTree
}

const insertDefinitionTree = (
    rootTree: ReturnType<typeof cliUx.tree>,
    audience: Audience,
    audiences: AudienceSchema[],
) => {
    const { filters, operator } = audience.filters
    const definitionTree = buildDefinitionTree(filters, operator, audiences)
    const definitionTitle = coloredTitle('definition')
    rootTree.insert(definitionTitle, definitionTree)
}

const insertServeTree = (
    rootTree: ReturnType<typeof cliUx.tree>,
    distribution: Distribution,
    variations: Variation[],
) => {
    const variationById = variations.reduce(
        (acc, variation) => {
            acc[variation._id] = variation
            return acc
        },
        {} as Record<string, Variation>,
    )

    const serveTree = cliUx.tree()
    if (distribution.length === 1) {
        const variationId = distribution[0]._variation
        const variationName = variationById[variationId]?.name
        const coloredValue = coloredVariation(variationName || variationId)
        serveTree.insert(coloredValue)
    } else {
        distribution.forEach((dist) => {
            const variationTree = cliUx.tree()
            variationTree.insert(`${dist.percentage * 100}%`)
            const variationName = variationById[dist._variation]?.name
            const coloredValue = coloredVariation(
                variationName || dist._variation,
            )
            serveTree.insert(coloredValue, variationTree)
        })
    }
    const serveTitle = coloredTitle('serve')
    rootTree.insert(serveTitle, serveTree)
}

const insertScheduleTree = (
    rootTree: ReturnType<typeof cliUx.tree>,
    rollout?: Rollout,
) => {
    if (!rollout) return

    const scheduleTree = cliUx.tree()
    if (rollout.type === 'schedule') {
        const startTree = cliUx.tree()
        scheduleTree.insert('start', startTree)
        startTree.insert(rollout.startDate)
        rootTree.insert('schedule', scheduleTree)
    } else if (rollout.type === 'gradual' && rollout.stages?.[0]) {
        // Start
        const startTree = cliUx.tree()
        scheduleTree.insert('start', startTree)

        const startDateTree = cliUx.tree()
        startDateTree.insert(rollout.startDate)
        startTree.insert('date', startDateTree)

        const startPercentTree = cliUx.tree()
        startPercentTree.insert((rollout.startPercentage || 0) * 100 + '%')
        startTree.insert('percentage', startPercentTree)

        // End
        const endTree = cliUx.tree()
        const endStage = rollout.stages[0]
        scheduleTree.insert('end', endTree)

        const endPercentTree = cliUx.tree()
        endPercentTree.insert(endStage.percentage * 100 + '%')
        endTree.insert('percentage', endPercentTree)

        const endDateTree = cliUx.tree()
        endDateTree.insert(endStage.date)
        endTree.insert('date', endDateTree)

        rootTree.insert('gradual rollout', scheduleTree)
    }
}

const coloredTitle = (title: string) => {
    return chalk.hex(COLORS.lightBlue)(title)
}

const coloredStatus = (status: 'enabled' | 'disabled') => {
    return status === 'enabled'
        ? chalk.hex(COLORS.lightGreen)(status)
        : chalk.hex(COLORS.coral)(status)
}

const coloredVariation = (variationName: string) => {
    return chalk.hex(COLORS.lightYellow)(variationName)
}
