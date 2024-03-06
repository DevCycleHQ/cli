export const BASE_URL =
    process.env.LOCAL === '1'
        ? 'http://localhost:4001'
        : 'https://api.devcycle.com'
export const AUTH_URL = 'https://auth.devcycle.com/'

export const buildHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: token,
})
