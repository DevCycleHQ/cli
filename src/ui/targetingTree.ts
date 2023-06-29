import { ux } from '@oclif/core'
import { Tree } from '@oclif/core/lib/cli-ux/styled/tree'
import { FeatureConfig, Environment, Variation } from '../api/schemas'

type Distribution = FeatureConfig['targets'][0]['distribution']
type Audience = FeatureConfig['targets'][0]['audience']
type Rollout = FeatureConfig['targets'][0]['rollout']

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

const insertStatusTree = (rootTree: Tree, status: FeatureConfig['status']) => {
    const statusTree = ux.tree()
    statusTree.insert(status === 'active' ? 'enabled' : 'disabled')
    rootTree.insert('status', statusTree)
}

const insertRulesTree = (rootTree: Tree, targets: FeatureConfig['targets'], variations: Variation[]) => {
    if (!targets.length) return

    const rules = ux.tree()
    targets.forEach((target, idx) => {
        const ruleTree = ux.tree()

        insertDefinitionTree(ruleTree, target.audience)
        insertServeTree(ruleTree, target.distribution, variations)
        insertScheduleTree(ruleTree, target.rollout)

        rules.insert(`${idx + 1}. ${target.audience.name || 'Audience'}`, ruleTree)
    })
    rootTree.insert('rules', rules)
}

const insertDefinitionTree = (rootTree: Tree, audience: Audience) => {
    const definitionTree = ux.tree()
    audience.filters.filters.forEach((filter, index) => {
        if (filter.type === 'all') {
            const prefixedProperty = prefixWithAnd('All Users', index)
            definitionTree.insert(prefixedProperty)
        } else if (filter.type === 'user') {
            const userFilter = ux.tree()
            const values = ux.tree()
            if (Array.isArray(filter.values) && !['exist', '!exist'].includes(filter.subType)) {
                filter.values.forEach((value) => values.insert(value))
            }
            userFilter.insert(comparatorMap[filter.comparator], values)
            const userProperty = filter.subType === 'customData' ? filter.dataKey : subTypeMap[filter.subType]
            const prefixedProperty = prefixWithAnd(userProperty, index)
            definitionTree.insert(prefixedProperty, userFilter)

        } else {
            // TODO handle audienceMatch
        }
    })
    rootTree.insert('definition', definitionTree)
}

const prefixWithAnd = (value: string, index: number) => {
    return index !== 0 ? `AND ${value}` : value
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
        serveTree.insert(variationName || variationId)
    } else {
        distribution.forEach((dist) => {
            const variationTree = ux.tree()
            variationTree.insert(`${dist.percentage * 100}%`)
            const variationName = variationById[dist._variation]?.name
            serveTree.insert(variationName || dist._variation, variationTree)
        })
    }
    rootTree.insert('serve', serveTree)
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