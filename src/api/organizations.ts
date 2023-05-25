import apiClient from './apiClient'

export type Organization = {
    id: string
    name: string
    display_name: string
}

export const fetchOrganizations = async (token: string): Promise<Organization[]> => {
    const url = '/v1/organizations'
    const response = await apiClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
