import axios from 'axios'
import { AUTH_URL } from './common'

export const authenticate = async (client_id: string, client_secret: string): Promise<string> => {
    const url = new URL("/oauth/token", AUTH_URL)

    const response = await axios.post(url.href, {
        grant_type: "client_credentials",
        client_id,
        client_secret,
        audience: "https://api.devcycle.com",
    })

    return response.data.access_token
}
