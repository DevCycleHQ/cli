import axios, { AxiosError } from 'axios'
import { BASE_URL } from './common'
import { createApiClient } from './zodClient'

export const axiosClient = axios.create({
    baseURL: BASE_URL,
})

export const setDVCReferrer = (
    command = 'unknown',
    version: string,
    caller = 'cli',
): void => {
    axiosClient.defaults.headers.common['dvc-referrer'] = 'cli'
    axiosClient.defaults.headers.common['dvc-referrer-metadata'] = JSON.stringify({
        command,
        version,
        caller,
    })
}

axiosClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.info('Authorization Error: Please login using "dvc login again".')
        } else {
            const responseData = error.response?.data as Record<string, any>
            console.info('DevCycle Error:', responseData.message)
        }
        // TODO: Handle this error properly, DVC-7758
        return null
    },
)

export const apiClient = createApiClient(BASE_URL, { axiosInstance: axiosClient, validate: 'request' })
export default apiClient
