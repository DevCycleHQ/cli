export const BASE_URL = 'http://localhost:4001'
export const AUTH_URL = 'https://auth.devcycle.com/'

export const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
})
