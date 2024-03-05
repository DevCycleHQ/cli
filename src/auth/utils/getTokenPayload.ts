type TokenPayload = {
    exp: number
    'https://devcycle.com/org_id'?: string // client credential tokens
    org_id?: string // user sso tokens
}

export const getTokenPayload = (token: string): TokenPayload | undefined => {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    } catch (err) {
        return undefined
    }
}
