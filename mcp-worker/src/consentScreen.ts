import { html, raw } from 'hono/html'

/**
 * Renders the consent screen HTML
 */
export function renderConsentScreen({
    clientName,
    clientLogo,
    clientUri,
    redirectUri,
    requestedScopes,
    transactionState,
    consentToken,
}: {
    clientName: string
    clientLogo: string
    clientUri: string
    redirectUri: string
    requestedScopes: string[]
    transactionState: string
    consentToken: string
}) {
    return html`<!doctype html>
        <html>
            <head>
                <title>Authorization Request</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 2rem auto;
                        padding: 2rem;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        border-radius: 8px;
                        padding: 2rem;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    }
                    .logo {
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .logo img {
                        max-width: 64px;
                        max-height: 64px;
                    }
                    h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    .client-info {
                        background: #f8f9fa;
                        border-radius: 4px;
                        padding: 1rem;
                        margin: 1rem 0;
                    }
                    .permissions {
                        margin: 1.5rem 0;
                    }
                    .permissions h3 {
                        color: #555;
                        margin-bottom: 0.5rem;
                    }
                    .permissions ul {
                        list-style-type: disc;
                        padding-left: 1.5rem;
                    }
                    .permissions li {
                        margin: 0.5rem 0;
                        color: #666;
                    }
                    .actions {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        margin-top: 2rem;
                    }
                    .btn {
                        padding: 0.75rem 2rem;
                        border: none;
                        border-radius: 4px;
                        font-size: 1rem;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        text-align: center;
                        min-width: 120px;
                    }
                    .btn-primary {
                        background: #007bff;
                        color: white;
                    }
                    .btn-secondary {
                        background: #6c757d;
                        color: white;
                    }
                    .btn:hover {
                        opacity: 0.9;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 2rem;
                        color: #666;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        ${clientLogo?.length
                            ? `<img src="${clientLogo}" alt="${clientName} logo" />`
                            : ''}
                    </div>

                    <h1>DevCycle MCP Server - Authorization Request</h1>

                    <div class="client-info">
                        <strong>${clientName}</strong>
                        <p>
                            <strong>${clientName}</strong> is requesting
                            permission to access the
                            <strong>DevCycle API</strong> using your account.
                            Please review the permissions before proceeding.
                        </p>
                    </div>

                    <div class="permissions">
                        <h3>
                            By clicking "Allow Access", you authorize
                            <strong>${clientName}</strong> to access the
                            following resources:
                        </h3>
                        <ul>
                            ${raw(
                                requestedScopes
                                    .map((scope) => `<li>${scope}</li>`)
                                    .join('\n'),
                            )}
                        </ul>
                    </div>

                    <div class="permissions">
                        <p>
                            If you did not initiate the request coming from
                            <strong>${clientName}</strong>
                            (<em>${redirectUri}</em>) or you do not trust this
                            application, you should deny access.
                        </p>
                    </div>

                    <form method="POST" action="/authorize/consent">
                        <input
                            type="hidden"
                            name="transaction_state"
                            value="${transactionState}"
                        />
                        <input
                            type="hidden"
                            name="consent_token"
                            value="${consentToken}"
                        />
                        <div class="actions">
                            <button
                                type="submit"
                                name="consent_action"
                                value="deny"
                                class="btn btn-secondary"
                            >
                                Deny
                            </button>
                            <button
                                type="submit"
                                name="consent_action"
                                value="approve"
                                class="btn btn-primary"
                            >
                                Allow Access
                            </button>
                        </div>
                    </form>

                    <div class="footer">
                        <p>
                            You're signing in to a third-party application. Your
                            account information is never shared without your
                            permission.
                        </p>
                    </div>
                </div>
            </body>
        </html>`
}
