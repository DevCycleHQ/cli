import axios, { AxiosError } from 'axios'
import { BASE_URL } from './common'

export const apiClient = axios.create({
    baseURL: `${BASE_URL}`,
})

export const setDVCReferrer = (
    command = 'unknown',
    version: string,
    caller = 'cli',
): void => {
    axios.defaults.headers.common['dvc-referrer'] = 'cli'
    axios.defaults.headers.common['dvc-referrer-metadata'] = JSON.stringify({
        command,
        version,
        caller,
    })
}

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.info('Authorization Error: Please login again.')
        }
        const responseData = error.response?.data as Record<string, any>
        console.info('DevCycle Error:', responseData.message)
        return null
    },
)

export default apiClient
