import axios from 'axios'
import { BASE_URL } from './common'

export type Organization = {
    id: string
    name: string
    display_name: string
}

export const fetchOrganizations = async (token: string): Promise<Organization[]> => {
    const url = new URL(`/v1/organizations`, BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
