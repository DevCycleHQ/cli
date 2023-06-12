import apiClient from './apiClient'

enum TargetingStatus {
    active = 'active',
    inactive = 'inactive',
    archived = 'archived'
}

export const fetchTargetingForFeature = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key?: string
) => {
    const url = '/v1/projects/:project/features/:feature/configurations'
    return await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            feature: feature_key
        },
        queries: {
            environment: environment_key
        }
    })

}

export const enableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string
) => {
    return await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.active
    )
}

export const disableTargeting = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string
)=> {
    return await updateTargetingStatusForFeatureAndEnvironment(
        token,
        project_id,
        feature_key,
        environment_key,
        TargetingStatus.inactive
    )
}

const updateTargetingStatusForFeatureAndEnvironment = async (
    token: string,
    project_id: string,
    feature_key: string,
    environment_key: string,
    status: TargetingStatus
) => {
    const url = '/v1/projects/:project/features/:feature/configurations'
    return apiClient.patch(url, { status }, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        params: {
            project: project_id,
            feature: feature_key,
        },
        queries: {
            environment: environment_key,
        }
    })
}
