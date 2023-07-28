type TokenPayload = {
    exp: number
}

export const getTokenPayload = (token: string): TokenPayload | undefined => {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    } catch (err) {
        return undefined
    }
}
