import apiClient from './apiClient'

enum TargetingStatus {
    active = 'active',
    inactive = 'inactive',
    archived = 'archived'
}

enum RolloutType {
    schedule = 'schedule',
    gradual = 'gradual',
    stepped = 'stepped'
}

enum RolloutStageType {
    linear = 'linear',
    discrete = 'discrete'
}

class Distribution {
    _variation: string
    percentage: number
}

class RolloutStage {
    type: RolloutStageType
    date: Date
    percentage: number
}

class Rollout {
    type: RolloutType
    startPercentage?: number
    startDate?: Date
    stages?: RolloutStage[]
}

export class TargetingRules {
    _id: string
    _feature: string
    _environment: string
    _createdBy: string
    status: TargetingStatus
    name?: string
    _audience: string
    rollout?: Rollout
    distribution: Distribution[]
    createdAt: Date
    updatedAt: Date
}

export const fetchTargetingForFeature = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key?: string
): Promise<TargetingRules> => {
    const url = `/v1/projects/${project_id}/features/${feature_key}/configurations` +
        `${environment_key ? `?environment=${environment_key}` : ''}`
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data[0]
}
