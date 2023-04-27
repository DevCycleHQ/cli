import crypto, { createHash } from 'crypto'
import http, { IncomingMessage, ServerResponse } from 'http'
import url, { URL } from 'url'

import { cli } from 'cli-ux'
import axios from 'axios'
import { Organization } from './organizations'
import Writer from '../ui/writer'

const CLI_CLIENT_ID = 'Ev9J0DGxR3KhrKaZwY6jlccmjl7JGKEX'

type OauthResponse = {
    data: {
        access_token: string
    }
}
const SUPPORTED_PORTS = [80, 8080, 2194, 2195, 2196]
const PORT = Number.parseInt(process.env.PORT || '2194')

type OauthParams = {
    grant_type: string
    client_id: string
    code_verifier: string
    code: string
    redirect_uri: string
    scope: string
}

export default class SSOAuth {
    private organization: Organization | null
    private server: http.Server
    private done: boolean
    private codeVerifier: string
    private accessToken: string | null | undefined
    private writer: Writer

    constructor(writer: Writer) {
        this.writer = writer
    }

    public async getAccessToken(
        organization: Organization | null = null,
    ): Promise<string> {
        this.organization = organization
        this.startLocalServer()
        await this.waitForServerClosed()
        return this.waitForToken()
    }

    private async waitForServerClosed(): Promise<void> {
        if (this.done) {
            return
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100))
            return this.waitForServerClosed()
        }
    }

    private async waitForToken(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100))
            return this.waitForToken()
        }
    }

    private startLocalServer() {
        const host = 'localhost'

        if (!SUPPORTED_PORTS.includes(PORT)) {
            throw new Error(
                `Invalid PORT. Only ${SUPPORTED_PORTS.join(
                    ', ',
                )} are supported`,
            )
        }

        this.codeVerifier = this.createRandomString()
        const authorizeUrl = this.buildAuthorizeUrl()

        this.server = http.createServer(this.handleAuthRedirect.bind(this))
        this.server.on('error', function (e) {
            console.error(`Local server error ${e}`)
        })
        // prevents keep-alive connections from keeping the server running after close()
        this.server.on('connection', function (socket) {
            socket.unref()
        })
        this.server.listen(PORT, host, () => {
            this.writer.statusMessage('Opening browser for authentication...')
            cli.open(authorizeUrl)
        })
        this.server.on('close', this.handleServerClosed.bind(this))
    }

    private handleServerClosed() {
        this.done = true
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
        const data: OauthParams = {
            grant_type: 'authorization_code',
            client_id: CLI_CLIENT_ID,
            code_verifier: this.codeVerifier,
            code,
            redirect_uri: `http://${host}:${PORT}/callback`,
            scope: 'offline_access',
        }

        const authUrl = `https://${authHost}/oauth/token`
        const response = await axios
            .post<OauthParams, OauthResponse>(authUrl, data)
            .catch(function (error) {
                console.error(error)
            })

        this.server.close()
        this.accessToken = response?.data.access_token
        if (this.organization) {
            this.writer.successMessage(
                `Access token retrieved for "${this.organization.display_name}" organization`,
            )
        } else {
            this.writer.successMessage('Personal access token retrieved')
        }
    }

    public buildAuthorizeUrl(): string {
        const authHost = 'auth.devcycle.com'
        const host = 'localhost'

        const state = this.createRandomString()
        const code_challenge = createHash('sha256')
            .update(this.codeVerifier)
            .digest('base64url')

        const url = new URL(`https://${authHost}/authorize`)
        url.searchParams.append('response_type', 'code')
        url.searchParams.append('client_id', CLI_CLIENT_ID)
        url.searchParams.append(
            'redirect_uri',
            `http://${host}:${PORT}/callback`,
        )
        url.searchParams.append('state', state)
        url.searchParams.append('code_challenge', code_challenge)
        url.searchParams.append('code_challenge_method', 'S256')
        url.searchParams.append('audience', 'https://api.devcycle.com/')
        if (this.organization) {
            url.searchParams.append('organization', this.organization.id)
        }

        return url.toString()
    }

    private createRandomString() {
        const buffer = crypto.randomBytes(43)
        return buffer.toString('base64url')
    }

    private resultHtml(resultMessage: string) {
        return `
<html><body align='center'>
<p>${resultMessage}. You may close this browser window.</p>
<button type="button" onclick="javascript:window.close()">Close Window</button>
</body></html>
`
    }
}
