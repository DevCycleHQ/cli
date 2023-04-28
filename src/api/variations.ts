import axios from 'axios'
import { BASE_URL } from './common'
import { IsNotEmpty, IsString } from 'class-validator'

export type Variation = {
    _id: string
    key: string
    name?: string
    variables?: {
        [key: string]: string | number | boolean | Record<string, unknown>
    }
}

export const getVariation = async (
    token: string,
    projectKey: string,
    featureKey: string,
    variation: string,
): Promise<Variation | null> => {
    const url = new URL(
        `/v1/projects/${projectKey}/features/${featureKey}/variation/${variation}`,
        BASE_URL,
    )
    try {
        const response = await axios.get(url.href, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
        return response.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        if (e.response?.status === 404) {
            return null
        }
        throw e
    }
}
