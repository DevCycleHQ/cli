import crypto, { createHash } from 'crypto'
import http, { IncomingMessage, ServerResponse } from 'http'
import url, { URL } from 'url'

import open from 'open'
import axios from 'axios'
import { Organization } from '../api/organizations'
import Writer from '../ui/writer'
import { toggleBotSadSvg, toggleBotSvg } from '../ui/togglebot'
import { storeAccessToken } from './config'
import { exit } from 'process'

export const CLI_CLIENT_ID = 'Ev9J0DGxR3KhrKaZwY6jlccmjl7JGKEX'

type OauthResponse = {
    data: {
        access_token: string
        refresh_token: string
    }
}
let SUPPORTED_PORTS = [8080, 2194, 2195, 2196]
let PORT = Number.parseInt(process.env.PORT || '2194')

type OauthParams = {
    grant_type: string
    client_id: string
    code_verifier: string
    code: string
    redirect_uri: string
    scope: string
}

type TokenResponse = {
    accessToken: string
    refreshToken: string
    personalAccessToken?: string
}

export default class SSOAuth {
    private organization: Organization | null
    private server: http.Server
    private done: boolean
    private codeVerifier: string
    private tokens: TokenResponse | undefined
    private writer: Writer
    private authPath: string

    constructor(writer: Writer, authPath: string) {
        this.writer = writer
        this.authPath = authPath
    }

    public async getAccessToken(): Promise<Required<TokenResponse>>
    public async getAccessToken(
        organization: Organization,
    ): Promise<Omit<TokenResponse, 'personalAccessToken'>>
    public async getAccessToken(
        organization?: Organization,
    ): Promise<TokenResponse> {
        if (organization) this.organization = organization
        this.startLocalServer()

        const timeout = setTimeout(() => {
            if (!this.done || !this.tokens) {
                this.writer.showError(
                    'Timed out waiting for authentication. Please try again',
                )
                exit(1)
            }
        }, 120000)

        await this.waitForServerClosed()
        const tokens = await this.waitForToken()
        clearTimeout(timeout)
        return tokens
    }

    private async waitForServerClosed(): Promise<void> {
        if (this.done) {
            return
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100))
            return this.waitForServerClosed()
        }
    }

    private async waitForToken(): Promise<TokenResponse> {
        if (this.tokens) {
            return this.tokens
        } else {
            await new Promise((resolve) => setTimeout(resolve, 100))
            return this.waitForToken()
        }
    }

    private startLocalServer() {
        const host = 'localhost'

        if (!SUPPORTED_PORTS.includes(PORT)) {
            throw new Error(
                `Invalid PORT. Only ${SUPPORTED_PORTS.join(', ')} are supported`,
            )
        }

        this.codeVerifier = this.createRandomString()
        const authorizeUrl = this.buildAuthorizeUrl()

        this.server = http.createServer(this.handleAuthRedirect.bind(this))
        this.server.on('error', (e) => {
            console.error(`Local server error ${e}`)
        })
        // prevents keep-alive connections from keeping the server running after close()
        this.server.on('connection', (socket) => {
            socket.unref()
        })

        this.server.on('error', (err: Error & { code: string }) => {
            if (err.code === 'EADDRINUSE') {
                this.writer.showError(
                    `Port ${PORT} already in use. Unable to log in.`,
                )
                SUPPORTED_PORTS = SUPPORTED_PORTS.filter((p) => p !== PORT)
                if (!SUPPORTED_PORTS.length) {
                    this.writer.showError(
                        'No available ports to start local server',
                    )
                    exit(1)
                }
                PORT = SUPPORTED_PORTS[0]
                setTimeout(() => {
                    this.server.close()
                    this.server.listen(PORT, host, () => {
                        this.writer.statusMessage(
                            'Opening browser for authentication...',
                        )
                        open(this.buildAuthorizeUrl())
                    })
                }, 1000)
            } else {
                this.writer.showError(`Error: ${err.message}`)
                exit(1)
            }
        })

        this.server.listen(PORT, host, () => {
            this.writer.statusMessage('Opening browser for authentication...')
            open(authorizeUrl)
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
                res.write(this.resultHtml('Authorization Error', false))
                res.end()
            } else if (parsed.query.code) {
                const code = parsed.query.code.toString()
                this.retrieveAccessToken(code)
                res.write(this.resultHtml('Authorization Successful!', true))
                res.end()
            } else {
                res.write(this.resultHtml('Unrecognized Response', false))
                res.end()
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
            .catch((error) => {
                console.error(error)
            })

        this.server.close()

        if (response?.data) {
            const { access_token, refresh_token } = response.data
            this.tokens = {
                accessToken: access_token,
                refreshToken: refresh_token,
                personalAccessToken: this.organization
                    ? undefined
                    : access_token,
            }
            storeAccessToken(this.tokens, this.authPath)
        }
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
        url.searchParams.append('scope', 'offline_access')
        if (this.organization) {
            url.searchParams.append('organization', this.organization.id)
        }

        return url.toString()
    }

    private createRandomString() {
        const buffer = crypto.randomBytes(43)
        return buffer.toString('base64url')
    }

    private resultHtml(resultMessage: string, success: boolean) {
        const fontUrl =
            'https://fonts.google.com/share?selection.family=Inter:wght@400;800'
        const backgroundUrl =
            'https://uploads-ssl.webflow.com/614e240a0e0b0fa195b146ed/64b815f3a776eee98d5375a7_backgroundCLI.png'
        return `
<html>
    <head>
        <link href='${fontUrl}' rel='stylesheet' type='text/css'>
        <style>
            #background {
                background-image: url("${backgroundUrl}");
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            h1 {
                font-family: 'Inter', sans-serif;
                font-size: 40px;
                font-weight: 800;
                color: #FFFFFF;
            }
            p {
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                font-weight: 400;
                color: #FFFFFF;
            }
            .container {
                height: fit-content;
                padding-bottom: 2em;
            }
            button {
                background-color: #1D4ED8;
                color: white;
                font-family: 'Inter', sans-serif;
                width: 200px;
                height: 38px;
                border-radius: 6px;
                border-style: none;
                margin-top: 1em;
            }
            button:hover {
                background-color:#335fdb;
                transition: 0.2s;
            }
        </style>
    </head>
    <body align='center' id="background">
        <div class="container">
            ${success ? toggleBotSvg : toggleBotSadSvg}
            <h1>
                ${resultMessage}
            </h1>
            <p>You may now close this page.</p>
        </div>
    </body>
</html>
`
    }
}
