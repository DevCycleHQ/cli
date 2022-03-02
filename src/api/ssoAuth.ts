import crypto, { createHash } from 'crypto'
import http, { IncomingMessage, ServerResponse } from 'http'
import url, { URL } from 'url'

import { cli } from 'cli-ux'
import axios from 'axios'
import { Organization } from './organizations'
import { successMessage } from '../ui/output'

const CLI_CLIENT_ID='Ev9J0DGxR3KhrKaZwY6jlccmjl7JGKEX'

export default class SSOAuth {
    private organization: Organization|null
    private server: http.Server
    private codeVerifier: string
    private accessToken: string

    public async getAccessToken(organization:Organization|null = null): Promise<string> {
        this.organization = organization
        this.startLocalServer()
        return this.waitForToken()
    }

    private async waitForToken():Promise<string> {
        if(this.accessToken) {
            return this.accessToken
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return this.waitForToken()
        }
    }

    private startLocalServer() {
        const host = 'localhost'
        const port = 5000

        this.codeVerifier = this.createRandomString()
        const authorizeUrl = this.buildAuthorizeUrl()

        this.server = http.createServer(this.handleAuthRedirect.bind(this))
        // prevents keep-alive connections from keeping the server running after close()
        this.server.on('connection', function (socket) { socket.unref(); });
        this.server.listen(port, host, () => {
            console.log('Opening browser for authentication...')
            cli.open(authorizeUrl)
        })
    }

    private handleAuthRedirect(req: IncomingMessage, res: ServerResponse) {
        const requestUrl = req.url || ''
        const parsed = url.parse(requestUrl, true)
        if (parsed.pathname === '/callback') {
            if (parsed.query.error) {
                res.write(this.resultHtml('Authorization error'))
                res.end()
                throw new Error(parsed.query.error.toString())
            } else if (parsed.query.code) {
                const code = parsed.query.code.toString()
                this.retrieveAccessToken(code)
                res.write(this.resultHtml('Authorization successful'))
                res.end()
            } else {
                res.write(this.resultHtml('Unrecognized response'))
                res.end()
                throw new Error('Unrecognized response')
            }
        } else {
            res.writeHead(404)
            res.end()
        }
    }

    private async retrieveAccessToken(code: string) {
        const authHost = 'auth.devcycle.com'
        const host = 'localhost'
        const port = 5000
        const data = {
            grant_type: 'authorization_code',
            client_id: CLI_CLIENT_ID,
            code_verifier: this.codeVerifier,
            code,
            redirect_uri: `http://${host}:${port}/callback`,
            scope: 'offline_access'
        }

        const response:any = await axios.post(`https://${authHost}/oauth/token`, data)
        .catch(function (error) {
            console.error(error)
        })

        this.server.close()
        this.accessToken = response.data.access_token
        if(this.organization) {
            successMessage(`Access token retrieved for "${this.organization.display_name}" organization`)
        } else {
            successMessage('Personal access token retrieved')
        }
    }

    public buildAuthorizeUrl(): string {
        const authHost = 'auth.devcycle.com'
        const host = 'localhost'
        const port = 5000

        const state = this.createRandomString()
        const code_challenge = createHash('sha256')
            .update(this.codeVerifier)
            .digest('base64url')

        const url = new URL(`https://${authHost}/authorize`)
        url.searchParams.append('response_type', 'code')
        url.searchParams.append('client_id', CLI_CLIENT_ID)
        url.searchParams.append('redirect_uri', `http://${host}:${port}/callback`)
        url.searchParams.append('state', state)
        url.searchParams.append('code_challenge', code_challenge)
        url.searchParams.append('code_challenge_method', 'S256')
        url.searchParams.append('audience', 'https://api.devcycle.com/')
        if(this.organization) {
            url.searchParams.append('organization', this.organization.id)
        }

        return url.toString();
    }

    private createRandomString() {
        const buffer = crypto.randomBytes(43)
        return buffer.toString('base64url')
    }

    private resultHtml(resultMessage:string) {
        return `
<html><body align='center'>
<p>${resultMessage}. You may close this browser window.</p>
<button type="button" onclick="javascript:window.close()">Close Window</button>
</body></html>
`}
}
