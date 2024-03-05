export const BASE_URL = 'https://api.devcycle.com/'
export const AUTH_URL = 'https://auth.devcycle.com/'

export const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
})
