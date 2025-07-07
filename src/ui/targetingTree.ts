import { ux } from '@oclif/core'
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

// Simple tree implementation
class Tree {
    private nodes: Map<string, any> = new Map()

    insert(key: string, value?: any) {
        this.nodes.set(key, value)
    }

    display(indent = 0) {
        const prefix = '  '.repeat(indent)
        for (const [key, value] of this.nodes) {
            console.log(prefix + key)
            if (value instanceof Tree) {
                value.display(indent + 1)
            }
        }
    }
}

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
    deviceModel: 'Device Model',
    country: 'Country',
    appVersion: 'App Version',
}
const comparatorMap = {
    '=': 'is',
    '!=': 'is not',
    contain: 'contains',
    '!contain': 'does not contain',
    exist: 'exists',
    '!exist': 'does not exist',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '<': 'is less than',
    '<=': 'is less than or equal to',
}

export const renderTargetingTree = (
    featureConfigs: FeatureConfig[],
    environments: Environment[],
    variations: Variation[],
    audiences: AudienceSchema[],
) => {
    const targetingTree = new Tree()
    featureConfigs.forEach((config) => {
        const environmentTree = new Tree()

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

const insertStatusTree = (rootTree: Tree, status: FeatureConfig['status']) => {
    const statusTree = new Tree()
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
    const rulesTree = new Tree()
    targets.forEach((target, idx) => {
        const ruleTree = new Tree()

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
    rootTree: Tree,
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
    const definitionTree = new Tree()
    const prefixWithOperator = (value: string, index: number) =>
        index !== 0 ? `${operator.toUpperCase()} ${value}` : value

    filters.forEach((filter, index) => {
        if (filter.type === 'all') {
            const prefixedProperty = prefixWithOperator('All Users', index)
            definitionTree.insert(prefixedProperty)
        } else if (filter.type === 'user') {
            const userFilter = new Tree()
            const values = new Tree()
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
            const audienceFilter = new Tree()
            const audienceTree = new Tree()
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
    rootTree: Tree,
    audience: Audience,
    audiences: AudienceSchema[],
) => {
    const { filters, operator } = audience.filters
    const definitionTree = buildDefinitionTree(filters, operator, audiences)
    const definitionTitle = coloredTitle('definition')
    rootTree.insert(definitionTitle, definitionTree)
}

const insertServeTree = (
    rootTree: Tree,
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

    const serveTree = new Tree()
    if (distribution.length === 1) {
        const variationId = distribution[0]._variation
        const variationName = variationById[variationId]?.name
        const coloredValue = coloredVariation(variationName || variationId)
        serveTree.insert(coloredValue)
    } else {
        distribution.forEach((dist) => {
            const variationTree = new Tree()
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

const insertScheduleTree = (rootTree: Tree, rollout?: Rollout) => {
    if (!rollout) return

    const scheduleTree = new Tree()
    if (rollout.type === 'schedule') {
        const startTree = new Tree()
        scheduleTree.insert('start', startTree)
        startTree.insert(rollout.startDate)
        rootTree.insert('schedule', scheduleTree)
    } else if (rollout.type === 'gradual' && rollout.stages?.[0]) {
        // Start
        const startTree = new Tree()
        scheduleTree.insert('start', startTree)

        const startDateTree = new Tree()
        startDateTree.insert(rollout.startDate)
        startTree.insert('date', startDateTree)

        const startPercentTree = new Tree()
        startPercentTree.insert((rollout.startPercentage || 0) * 100 + '%')
        startTree.insert('percentage', startPercentTree)

        // End
        const endTree = new Tree()
        const endStage = rollout.stages[0]
        scheduleTree.insert('end', endTree)

        const endPercentTree = new Tree()
        endPercentTree.insert(endStage.percentage * 100 + '%')
        endTree.insert('percentage', endPercentTree)

        const endDateTree = new Tree()
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
