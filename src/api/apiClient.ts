import axios, { AxiosError } from 'axios'
import { BASE_URL } from './common'
import { createApiClient, createV2ApiClient } from './zodClient'
import { ZodIssueCode, ZodIssueOptionalMessage, ErrorMapCtx } from 'zod'

export const axiosClient = axios.create({
    baseURL: BASE_URL,
})

export const setDVCReferrer = (
    command = 'unknown',
    version: string,
    caller = 'cli',
): void => {
    axiosClient.defaults.headers.common['dvc-referrer'] = 'cli'
    axiosClient.defaults.headers.common['dvc-referrer-metadata'] =
        JSON.stringify({
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
        let isCallerCli = false
        if (error.config) {
            const parsedDvcReferrerMetadata = JSON.parse(
                error.config.headers['dvc-referrer-metadata'],
            )
            isCallerCli = parsedDvcReferrerMetadata.caller === 'cli'
        }

        if (error.response?.status === 401) {
            console.info(
                'Authorization Error: Please login using "dvc login again".',
            )
        } else if (isCallerCli && error.response?.data) {
            const responseData = error.response?.data as Record<string, any>
            console.info('DevCycle Error:', responseData?.message)
        } else if (isCallerCli && error.code) {
            console.info('DevCycle Error:', error.code)
        }
        // TODO: Handle this error properly, DVC-7758
        return Promise.reject(error)
    },
)

export const errorMap = (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx) => {
    if (!ctx.data) {
        return {
            message: `${issue.path.join('.')} is a required field`,
        }
    }

    switch (issue.code) {
        case ZodIssueCode.too_small:
            return {
                message:
                    issue.type === 'string'
                        ? `${issue.path.join('.')} length must be >= ${issue.minimum} but got ${ctx.data}`
                        : `${issue.path.join('.')} must be >= ${issue.minimum} but got ${ctx.data}`,
            }
        case ZodIssueCode.too_big:
            return {
                message:
                    issue.type === 'string'
                        ? `${issue.path.join('.')} length must be <= ${issue.maximum} but got ${ctx.data}`
                        : `${issue.path.join('.')} must be <= ${issue.maximum} but got ${ctx.data}`,
            }
        case ZodIssueCode.invalid_string:
            const regexError = `format of ${issue.path.join('.')} is invalid.`
            const invalidTypeError = `${issue.path.join('.')} must be a valid ${issue.validation}, but got ${ctx.data}`
            const noValidationError = `Invalid value: ${issue.path.join('.')}. ${issue.message || ''}`

            return {
                message:
                    issue.validation === 'regex'
                        ? regexError
                        : issue.validation
                          ? invalidTypeError
                          : noValidationError,
            }
        case ZodIssueCode.invalid_enum_value:
            return {
                message: `${issue.path.join('.')} must be one of ${issue.options.join(', ')}`,
            }
        default:
            return { message: ctx.defaultError }
    }
}

export const apiClient = createApiClient(BASE_URL, {
    axiosInstance: axiosClient,
    validate: 'request',
})
export default apiClient

export const v2ApiClient = createV2ApiClient(BASE_URL)
