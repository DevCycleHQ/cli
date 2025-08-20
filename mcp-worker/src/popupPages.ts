import { html } from 'hono/html'

/**
 * Renders the popup success page HTML
 */
export function renderPopupSuccessPage({
    redirectTo,
}: {
    redirectTo?: string | null
}) {
    const result = {
        success: true,
        redirectTo: redirectTo
    }

    return html`<!DOCTYPE html>
        <html>
            <head>
                <title>Authentication Complete</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                            Roboto, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f8fafc;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        max-width: 400px;
                    }
                    .success {
                        color: #059669;
                    }
                    .loading {
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #1d49f4;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">
                        <h2>✓ Authentication Successful</h2>
                        <p>You can close this window.</p>
                    </div>
                    <div class="loading" id="loading"></div>
                    <p id="status">Completing authentication...</p>
                </div>

                <script>
                    (function () {
                        const result = ${JSON.stringify(result)};

                        try {
                            // Try to communicate with parent window
                            if (window.opener && !window.opener.closed) {
                                // Post message to parent window
                                window.opener.postMessage(
                                    {
                                        type: 'oauth_result',
                                        ...result,
                                    },
                                    '*'
                                );

                                // Update UI
                                document.getElementById('loading').style.display =
                                    'none';
                                document.getElementById('status').textContent =
                                    'Authentication complete. This window will close automatically.';

                                // Close popup after a short delay
                                setTimeout(() => {
                                    window.close();
                                }, 1500);
                            } else {
                                // No parent window, just show completion message
                                document.getElementById('loading').style.display =
                                    'none';
                                document.getElementById('status').textContent =
                                    'Authentication complete. You can close this window.';
                            }
                        } catch (error) {
                            console.error(
                                'Error communicating with parent window:',
                                error
                            );
                            document.getElementById('loading').style.display =
                                'none';
                            document.getElementById('status').textContent =
                                'Authentication complete. You can close this window.';
                        }
                    })();
                </script>
            </body>
        </html>`
}

/**
 * Renders the popup error page HTML
 */
export function renderPopupErrorPage({
    error,
    errorDescription,
    state,
}: {
    error?: string | null
    errorDescription?: string | null
    state?: string | null
}) {
    const result = {
        success: false,
        error: error,
        error_description: errorDescription,
        state: state,
    }

    return html`<!DOCTYPE html>
        <html>
            <head>
                <title>Authentication Failed</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                            Roboto, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f8fafc;
                    }
                    .container {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        max-width: 400px;
                    }
                    .error {
                        color: #dc2626;
                    }
                    .loading {
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #dc2626;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% {
                            transform: rotate(0deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error">
                        <h2>✗ Authentication Failed</h2>
                        <p>
                            ${errorDescription || error || 'An error occurred'}
                        </p>
                    </div>
                    <div class="loading" id="loading"></div>
                    <p id="status">Completing authentication...</p>
                </div>

                <script>
                    (function () {
                        const result = ${JSON.stringify(result)};

                        try {
                            // Try to communicate with parent window
                            if (window.opener && !window.opener.closed) {
                                // Post message to parent window
                                window.opener.postMessage(
                                    {
                                        type: 'oauth_result',
                                        ...result,
                                    },
                                    '*'
                                );

                                // Update UI
                                document.getElementById('loading').style.display =
                                    'none';
                                document.getElementById('status').textContent =
                                    'Authentication failed. This window will close automatically.';

                                // Close popup after a short delay
                                setTimeout(() => {
                                    window.close();
                                }, 3000);
                            } else {
                                // No parent window, just show completion message
                                document.getElementById('loading').style.display =
                                    'none';
                                document.getElementById('status').textContent =
                                    'Authentication failed. You can close this window.';
                            }
                        } catch (error) {
                            console.error(
                                'Error communicating with parent window:',
                                error
                            );
                            document.getElementById('loading').style.display =
                                'none';
                            document.getElementById('status').textContent =
                                'Authentication failed. You can close this window.';
                        }
                    })();
                </script>
            </body>
        </html>`
}
