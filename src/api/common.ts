import axios from 'axios'

export const BASE_URL = 'https://api.devcycle.com/'
export const AUTH_URL = 'https://auth.devcycle.com/'

export const setDVCReferrer = (
    command = 'unknown',
    version: string,
    caller = 'cli'
): void => {
    axios.defaults.headers.common['dvc-referrer'] = 'cli'
    axios.defaults.headers.common['dvc-referrer-metadata'] = JSON.stringify({
        command,
        version,
        caller
    })
}
