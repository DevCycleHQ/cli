import { axiosClient } from './apiClient'

export type Organization = {
    id: string
    name: string
    display_name: string
}

export const fetchOrganizations = async (token: string): Promise<Organization[]> => {
    const response = await axiosClient.get('/v1/organizations', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
