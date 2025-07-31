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
        <html lang="en">
            <head>
                <title>DevCycle - Authorization Request</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <style>
                    @font-face {
                        font-family: Uni;
                        src: url(https://assets.website-files.com/614e240a0e0b0fa195b146ed/6165f74563f3fd79359837fd_UniNeue-Heavy.otf);
                    }

                    @font-face {
                        font-family: Inter;
                        src: url(https://assets.website-files.com/614e240a0e0b0fa195b146ed/614e240a0e0b0fed5fb1473e_Inter-Regular.woff);
                    }

                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    html,
                    body {
                        height: 100%;
                        overflow: hidden;
                        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                        background: #f8fafc;
                    }

                    .consent-container {
                        display: flex;
                        height: 100vh;
                        width: 100vw;
                    }

                    .marketing-column {
                        flex: 1;
                        background: linear-gradient(135deg, #1d49f4 0%, #0c1f66 100%);
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 3rem 2rem;
                        color: white;
                        position: relative;
                        overflow: hidden;
                    }

                    .marketing-column::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                        opacity: 0.3;
                    }

                    .marketing-content {
                        max-width: 480px;
                        text-align: center;
                        z-index: 1;
                    }

                    .marketing-logo {
                        width: 180px;
                        height: auto;
                        margin-bottom: 1.5rem;
                    }

                    .marketing-title {
                        font-family: Uni, sans-serif;
                        font-size: 1.125rem;
                        font-weight: 300;
                        line-height: 1.2;
                        margin-bottom: 1rem;
                    }

                    .marketing-subtitle {
                        font-size: 1rem;
                        line-height: 1.5;
                        opacity: 0.9;
                        margin-bottom: 1.5rem;
                    }

                    .consent-column {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 1.5rem;
                        background: 
                            linear-gradient(29deg, rgba(109, 40, 217, 0.1) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0) 23%),
                            linear-gradient(305deg, rgba(29, 78, 216, 0.1) 0%, rgba(255, 255, 255, 0.5) 25.5%, rgba(255, 255, 255, 0) 26.5%);
                        position: relative;
                    }

                    .consent-wrapper {
                        max-width: 500px;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .consent-container-inner {
                        width: 100%;
                        background: white;
                        border-radius: 1rem;
                        padding: 1.5rem;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    }

                    .client-logo-section {
                        text-align: center;
                        margin-bottom: 1.5rem;
                    }

                    .client-logo-section img {
                        max-width: 64px;
                        max-height: 64px;
                        border-radius: 8px;
                    }

                    .consent-header {
                        text-align: center;
                        margin-bottom: 1.5rem;
                    }

                    .consent-header h1 {
                        font-family: Uni, sans-serif !important;
                        font-size: 1.375rem;
                        color: #1f2937;
                        margin-bottom: 0.5rem;
                    }

                    .consent-header p {
                        color: #6b7280;
                        font-size: 0.9rem;
                        line-height: 1.4;
                    }

                    .client-info {
                        background: #f8fafc;
                        border-radius: 0.75rem;
                        padding: 1rem;
                        margin: 1rem 0;
                        border: 1px solid #e5e7eb;
                    }

                    .client-info strong {
                        color: #1f2937;
                        font-weight: 600;
                    }

                    .client-info p {
                        color: #4b5563;
                        line-height: 1.5;
                        margin-top: 0.5rem;
                    }

                    .permissions {
                        margin: 1rem 0;
                    }

                    .permissions h3 {
                        color: #374151;
                        margin-bottom: 0.75rem;
                        font-size: 0.95rem;
                        font-weight: 600;
                        line-height: 1.3;
                    }

                    .permissions ul {
                        list-style: none;
                        padding: 0;
                        background: #f9fafb;
                        border-radius: 0.5rem;
                        padding: 0.75rem;
                    }

                    .permissions li {
                        margin: 0.5rem 0;
                        color: #4b5563;
                        display: flex;
                        align-items: center;
                        font-size: 0.875rem;
                    }

                    .permissions li::before {
                        content: '•';
                        color: #1d49f4;
                        font-weight: bold;
                        margin-right: 0.75rem;
                        font-size: 1.25rem;
                    }

                    .security-notice {
                        background: #fef3cd;
                        border: 1px solid #fde68a;
                        border-radius: 0.5rem;
                        padding: 0.75rem;
                        margin: 1rem 0;
                    }

                    .security-notice p {
                        color: #92400e;
                        font-size: 0.825rem;
                        line-height: 1.4;
                    }

                    .security-notice strong {
                        color: #78350f;
                    }

                    .security-notice em {
                        font-style: italic;
                        color: #a16207;
                    }

                    .actions {
                        display: flex;
                        gap: 0.75rem;
                        justify-content: center;
                        margin-top: 1.5rem;
                    }

                    .btn {
                        padding: 0.75rem 2rem;
                        border: none;
                        border-radius: 0.75rem;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        text-align: center;
                        min-width: 120px;
                        font-family: Inter, sans-serif;
                        transition: all 0.2s ease;
                    }

                    .btn-primary {
                        background: #1d49f4;
                        color: white;
                    }

                    .btn-primary:hover {
                        background: #1940d1;
                        transform: translateY(-1px);
                    }

                    .btn-secondary {
                        background: white;
                        color: #6b7280;
                        border: 2px solid #e5e7eb;
                    }

                    .btn-secondary:hover {
                        background: #f9fafb;
                        border-color: #d1d5db;
                        transform: translateY(-1px);
                    }

                    .footer {
                        text-align: center;
                        margin-top: 1.5rem;
                        color: #9ca3af;
                        font-size: 0.8rem;
                        line-height: 1.4;
                        max-width: 400px;
                    }

                    /* Mobile logo - only shows on mobile */
                    .mobile-logo-simple {
                        display: none;
                    }

                    /* Responsive design */
                    @media (max-width: 999px) {
                        .mobile-logo-simple {
                            display: block;
                            max-width: 150px;
                            margin: 1rem auto 1rem auto;
                        }

                        html, body {
                            min-height: 100%;
                            overflow: auto;
                            background: 
                                linear-gradient(29deg, rgba(109, 40, 217, 0.1) 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0) 23%),
                                linear-gradient(305deg, rgba(29, 78, 216, 0.1) 0%, rgba(255, 255, 255, 0.5) 25.5%, rgba(255, 255, 255, 0) 26.5%);
                            height: auto;
                        }

                        .consent-container {
                            display: block;
                            height: auto;
                            width: auto;
                        }

                        .marketing-column {
                            display: none;
                        }

                        .consent-column {
                            display: block;
                            flex: none;
                            justify-content: normal;
                            align-items: normal;
                            padding: 1rem;
                            background: none;
                            position: static;
                        }

                        .consent-wrapper {
                            display: block;
                            max-width: none;
                        }

                        .consent-container-inner {
                            margin-top: 1rem;
                            margin-bottom: 2rem;
                        }

                        .footer {
                            margin-bottom: 2rem;
                        }
                    }

                    /* Remove gradients on small mobile screens */
                    @media (max-width: 600px) {
                        html, body {
                            background: #ffffff !important;
                        }
                        
                        .consent-column {
                            padding: 0.5rem;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="consent-container">
                    <!-- Marketing Column -->
                    <div class="marketing-column">
                        <div class="marketing-content">
                            <img class="marketing-logo" src="https://devcycle.com/_next/static/media/logo.dark.9590d9ad.svg" alt="DevCycle" />
                            
                            <p class="marketing-title">
                                DevCycle MCP Server provides secure access to feature flag management.
                            </p>
                            
                            <p class="marketing-subtitle">
                                Connect your tools directly to DevCycle's API with OAuth-secured authentication for seamless feature flag operations.
                            </p>
                        </div>
                    </div>

                    <!-- Consent Column -->
                    <div class="consent-column">
                        <img class="mobile-logo-simple" src="https://devcycle.com/_next/static/media/logo.e96b1670.svg" alt="DevCycle" />
                        
                        <div class="consent-wrapper">
                            <div class="consent-container-inner">
                                ${clientLogo?.length
                                    ? `<div class="client-logo-section">
                                        <img src="${clientLogo}" alt="${clientName} logo" />
                                       </div>`
                                    : ''}

                                <div class="consent-header">
                                    <h1>Authorization Request</h1>
                                    <p>Review the permissions before granting access to your DevCycle account</p>
                                </div>

                                <div class="client-info">

                                    <p>
                                        <strong>${clientName}</strong> is requesting permission to access the
                                        <strong>DevCycle API</strong> using your account credentials.
                                    </p>
                                </div>

                                <div class="permissions">
                                    <h3>
                                        This application will be able to:
                                    </h3>
                                    <ul>
                                        ${raw(
                                            requestedScopes
                                                .map((scope) => `<li>${scope}</li>`)
                                                .join('\n'),
                                        )}
                                    </ul>
                                </div>

                                <div class="security-notice">
                                    <p>
                                        <strong>Security Notice:</strong> Only authorize applications you trust. 
                                        If you didn't initiate this request from <strong>${clientName}</strong> you should deny access.
                                    </p>
                                </div>

                                <form method="POST" action="/oauth/authorize/consent">
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
                                            Deny Access
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
                            </div>

                            <div class="footer">
                                <p>
                                    You're signing in to a third-party application. Your 
                                    account information is never shared without your permission.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>`
}
