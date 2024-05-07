import { axiosClient } from './apiClient'

export type OrganizationMember = {
    user_id?: string | undefined
    picture?: string | undefined
    name?: string | undefined
    email?: string | undefined
}

export const fetchOrganizationMembers = async (token: string): Promise<OrganizationMember[]> => {
    const members: OrganizationMember[] = []
    const perPage = 100
    const url = '/v1/organizations/current/members?perPage=' + perPage
    const response = await axiosClient.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    members.push(...response.data)

    if (response.headers.count > response.data.length) {
        const pages = Math.ceil(response.headers.count / perPage)
        const promises = Array.from({ length: pages - 1 }, (_, i) =>
            axiosClient.get(`/v1/organizations/current/members?perPage=${perPage}&page=${i + 2}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
            })
        )
        const results = await Promise.all(promises)
        members.push(...results.map((result) => result.data))
    } 

    return members
}
