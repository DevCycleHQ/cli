import { ux } from '@oclif/core'
import { Tree } from '@oclif/core/lib/cli-ux/styled/tree'
import { FeatureConfig, Environment, Variation } from '../api/schemas'
import chalk from 'chalk'
import { COLORS } from './constants/colors'

type Distribution = FeatureConfig['targets'][0]['distribution']
type Audience = FeatureConfig['targets'][0]['audience']
type Rollout = FeatureConfig['targets'][0]['rollout']
type Rule = Pick<FeatureConfig['targets'][0], 'audience' | 'distribution' | 'rollout'>
type Filters = Audience['filters']['filters']
type Operator = Audience['filters']['operator']

const subTypeMap = {
    email: 'Email',
    user_id: 'User ID',
    platform: 'Platform',
    platformVersion: 'Platform Version',
    deviceModel: 'Device Model',
    country: 'Country',
    appVersion: 'App Version'
}
const comparatorMap = {
    '=': 'is',
    '!=': 'is not',
    'contain': 'contains',
    '!contain': 'does not contain',
    'exist': 'exists',
    '!exist': 'does not exist',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '<': 'is less than',
    '<=': 'is less than or equal to',
}

export const renderTargetingTree = (
    featureConfigs: FeatureConfig[],
    environments: Environment[],
    variations: Variation[]
) => {
    const targetingTree = ux.tree()

    featureConfigs.forEach((config) => {
        const environmentTree = ux.tree()

        insertStatusTree(environmentTree, config.status)
        insertRulesTree(environmentTree, config.targets, variations)

        const environmentName = environments.find((env) => env._id === config._environment)?.name
        targetingTree.insert(environmentName || config._environment, environmentTree)
    })
    targetingTree.display()
}

export const renderRulesTree = (
    targets: Rule[],
    variations: Variation[]
) => {
    const rulesTree = buildRulesTree(targets, variations)
    rulesTree.display()
}

export const renderDefinitionTree = (
    filters: Filters,
    operator: Operator
) => {
    const definitionTree = buildDefinitionTree(filters, operator)
    definitionTree.display()
}

const insertStatusTree = (rootTree: Tree, status: FeatureConfig['status']) => {
    const statusTree = ux.tree()
    const convertedStatus = status === 'active' ? 'enabled' : 'disabled'
    const displayStatus = coloredStatus(convertedStatus)
    statusTree.insert(displayStatus)
    const statusTitle = coloredTitle('status')
    rootTree.insert(statusTitle, statusTree)
}

const buildRulesTree = (targets: Rule[], variations: Variation[]) => {
    const rulesTree = ux.tree()
    targets.forEach((target, idx) => {
        const ruleTree = ux.tree()

        insertDefinitionTree(ruleTree, target.audience)
        insertServeTree(ruleTree, target.distribution, variations)
        insertScheduleTree(ruleTree, target.rollout)

        rulesTree.insert(`${idx + 1}. ${target.audience.name || 'Audience'}`, ruleTree)
    })
    return rulesTree
}

const insertRulesTree = (rootTree: Tree, targets: Rule[], variations: Variation[]) => {
    if (!targets.length) return

    const rulesTree = buildRulesTree(targets, variations)
    const rulesTitle = coloredTitle('rules')
    rootTree.insert(rulesTitle, rulesTree)
}

const buildDefinitionTree = (filters: Filters, operator: Operator) => {
    const definitionTree = ux.tree()
    const prefixWithOperator = (value: string, index: number) => (
        index !== 0 ? `${operator.toUpperCase()} ${value}` : value
    )

    filters.forEach((filter, index) => {
        if (filter.type === 'all') {
            const prefixedProperty = prefixWithOperator('All Users', index)
            definitionTree.insert(prefixedProperty)
        } else if (filter.type === 'user') {
            const userFilter = ux.tree()
            const values = ux.tree()
            if (Array.isArray(filter.values) && !['exist', '!exist'].includes(filter.subType)) {
                filter.values.forEach((value) => values.insert(value))
            }
            userFilter.insert(comparatorMap[filter.comparator], values)
            const userProperty = filter.subType === 'customData' ? filter.dataKey : subTypeMap[filter.subType]
            const prefixedProperty = prefixWithOperator(userProperty, index)
            definitionTree.insert(prefixedProperty, userFilter)

        } else {
            // TODO handle audienceMatch
        }
    })
    return definitionTree
}

const insertDefinitionTree = (rootTree: Tree, audience: Audience) => {
    const { filters, operator } = audience.filters
    const definitionTree = buildDefinitionTree(filters, operator)
    const definitionTitle = coloredTitle('definition')
    rootTree.insert(definitionTitle, definitionTree)
}

const insertServeTree = (rootTree: Tree, distribution: Distribution, variations: Variation[]) => {
    const variationById = variations.reduce((acc, variation) => {
        acc[variation._id] = variation
        return acc
    }, {} as Record<string, Variation>)

    const serveTree = ux.tree()
    if (distribution.length === 1) {
        const variationId = distribution[0]._variation
        const variationName = variationById[variationId]?.name
        const coloredValue = coloredVariation(variationName || variationId)
        serveTree.insert(coloredValue)
    } else {
        distribution.forEach((dist) => {
            const variationTree = ux.tree()
            variationTree.insert(`${dist.percentage * 100}%`)
            const variationName = variationById[dist._variation]?.name
            const coloredValue = coloredVariation(variationName || dist._variation)
            serveTree.insert(coloredValue, variationTree)
        })
    }
    const serveTitle = coloredTitle('serve')
    rootTree.insert(serveTitle, serveTree)
}

const insertScheduleTree = (rootTree: Tree, rollout?: Rollout) => {
    if (!rollout) return

    const scheduleTree = ux.tree()
    if (rollout.type === 'schedule') {
        const startTree = ux.tree()
        scheduleTree.insert('start', startTree)
        startTree.insert(rollout.startDate)
        rootTree.insert('schedule', scheduleTree)
    } else if (rollout.type === 'gradual' && rollout.stages?.[0]) {
        // Start
        const startTree = ux.tree()
        scheduleTree.insert('start', startTree)

        const startDateTree = ux.tree()
        startDateTree.insert(rollout.startDate)
        startTree.insert('date', startDateTree)

        const startPercentTree = ux.tree()
        startPercentTree.insert((rollout.startPercentage || 0) * 100 + '%')
        startTree.insert('percentage', startPercentTree)

        // End
        const endTree = ux.tree()
        const endStage = rollout.stages[0]
        scheduleTree.insert('end', endTree)

        const endPercentTree = ux.tree()
        endPercentTree.insert(endStage.percentage * 100 + '%')
        endTree.insert('percentage', endPercentTree)

        const endDateTree = ux.tree()
        endDateTree.insert(endStage.date)
        endTree.insert('date', endDateTree)

        rootTree.insert('gradual rollout', scheduleTree)
    }
}

const coloredTitle = (title: string) => {
    return chalk.hex(COLORS.lightBlue)(title)
}

const coloredStatus = (status: 'enabled' | 'disabled') => {
    return status === 'enabled' ? chalk.hex(COLORS.lightGreen)(status) : chalk.hex(COLORS.coral)(status)
}

const coloredVariation = (variationName: string) => {
    return chalk.hex(COLORS.lightYellow)(variationName)
}