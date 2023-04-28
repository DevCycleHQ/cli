import axios from 'axios'
import { BASE_URL } from './common'
import { IsNotEmpty, IsString } from 'class-validator'

type AudiencePayload = {
    name?: string
    key?: string
    description?: string
    filters: {
        filters: FilterOrOperator[]
        operator: OperatorType
    }
    tags?: string[]
}
type FilterOrOperator = Filter | Operator

type Filter = {
    type: string
    subType?: string
    comparator?: string
    values?: any[]
    _audiences?: string[]
    dataKey?: string
    dataKeyType?: string
}

type Operator = {
    operator: OperatorType
    filters: FilterOrOperator[]
}

enum OperatorType {
    or = 'or',
    and = 'and',
}
export type TargetingRule = {
    _id?: string
    name?: string
    rollout?: {
        startPercentage: number
        type: string
        startDate: string
        stages: {
            percentage: number
            type: string
            date: string
        }[]
    }
    distribution: {
        percentage: number
        _variation: string
    }[]
    audience: AudiencePayload
}

export type FeatureConfiguration = {
    targets: TargetingRule[]
    status: 'active' | 'inactive' | 'archived'

    _id?: string

    _feature?: string

    /**
     * ID of the Environment owning the Configuration
     * @example '61450f3daec96f5cf4a49946'
     */
    _environment?: string

    /**
     * User who created the Feature Configuration
     */
    _createdBy?: string
    updatedAt?: Date
    startedAt?: Date
    readonly?: boolean
}

export class CreateTargetingRuleParams {
    @IsNotEmpty()
    environment: string

    @IsNotEmpty()
    feature: string
}

export class ListTargetingRuleParams {
    @IsNotEmpty()
    environment: string

    @IsNotEmpty()
    feature: string

    @IsNotEmpty()
    projectKey: string
}

export const getFeatureConfigurations = async (
    token: string,
    projectKey: string,
    featureKey: string,
    environment: string,
): Promise<FeatureConfiguration | null> => {
    const url = new URL(
        `/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=${environment}`,
        BASE_URL,
    )
    try {
        const response = await axios.get(url.href, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
        return response.data[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }
}

export const addAllUserRule = async (
    token: string,
    projectKey: string,
    featureKey: string,
    environment: string,
    variationId: string,
): Promise<FeatureConfiguration | null> => {
    const currentFeatureConfigurations = await getFeatureConfigurations(
        token,
        projectKey,
        featureKey,
        environment,
    )
    if (!currentFeatureConfigurations) {
        return null
    }
    if (
        currentFeatureConfigurations.targets.find((target) =>
            target.audience.filters.filters.find(
                (filter: any) => filter.type === 'all',
            ),
        )
    ) {
        console.log('All Users rule already exists')
        return currentFeatureConfigurations
    }
    currentFeatureConfigurations.targets.push({
        name: 'All Users',
        distribution: [
            {
                percentage: 1,
                _variation: variationId,
            },
        ],
        audience: {
            name: 'All Users',
            filters: {
                filters: [
                    {
                        type: 'all',
                    },
                ],
                operator: OperatorType.and,
            },
        },
    })

    delete currentFeatureConfigurations._feature
    delete currentFeatureConfigurations._environment
    delete currentFeatureConfigurations._createdBy
    delete currentFeatureConfigurations.updatedAt
    delete currentFeatureConfigurations.readonly
    delete currentFeatureConfigurations.startedAt

    const url = new URL(
        `/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=${environment}`,
        BASE_URL,
    )
    try {
        const response = await axios.patch(
            url.href,
            currentFeatureConfigurations,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            },
        )
        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.log(e.response)
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }
}

export const toggleTargetingRule = async (
    token: string,
    projectKey: string,
    featureKey: string,
    environment: string,
    status: 'active' | 'inactive' | 'archived',
): Promise<FeatureConfiguration | null> => {
    const currentFeatureConfigurations = await getFeatureConfigurations(
        token,
        projectKey,
        featureKey,
        environment,
    )
    if (!currentFeatureConfigurations) {
        return null
    }

    delete currentFeatureConfigurations._feature
    delete currentFeatureConfigurations._environment
    delete currentFeatureConfigurations._createdBy
    delete currentFeatureConfigurations.updatedAt
    delete currentFeatureConfigurations.readonly
    delete currentFeatureConfigurations.startedAt
    const url = new URL(
        `/v1/projects/${projectKey}/features/${featureKey}/configurations?environment=${environment}`,
        BASE_URL,
    )

    if (currentFeatureConfigurations.status === status) {
        console.log(`Feature configuration already ${status}`)
        return currentFeatureConfigurations
    }

    currentFeatureConfigurations.status = status

    try {
        const response = await axios.patch(
            url.href,
            currentFeatureConfigurations,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            },
        )
        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.log(e.response)
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }
}
