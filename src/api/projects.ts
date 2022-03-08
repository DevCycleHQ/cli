import axios from 'axios'
import { BASE_URL } from './common'

export type Project = {
    id: string
    name: string
    key: string
}

export const fetchProjects = async (token: string): Promise<Project[]> => {
    const url = new URL('/v1/projects', BASE_URL)
    const response = await axios.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    })

    return response.data
}
