import { axiosClient } from './apiClient'

export type OrganizationMember = {
    user_id?: string | undefined
    picture?: string | undefined
    name?: string | undefined
    email?: string | undefined
}

export const fetchOrganizationMembers = async (
    token: string,
): Promise<OrganizationMember[]> => {
    const members: OrganizationMember[] = []
    const perPage = 100

    const fetchMembers = (page = 1) => {
        const url = `/v1/organizations/current/members?perPage=${perPage}&page=${page}`
        return axiosClient.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
    }

    const response = await fetchMembers()
    members.push(...response.data)
    const total = response.headers.count

    const promises = []
    const totalPages = Math.ceil(total / perPage)
    for (let i = 2; i <= totalPages; i++) {
        promises.push(fetchMembers(i))
    }

    const responses = await Promise.all(promises)
    for (const response of responses) {
        members.push(...response.data)
    }
    return members
}
