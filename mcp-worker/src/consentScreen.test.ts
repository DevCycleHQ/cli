import { describe, expect, test } from 'vitest'
import { renderConsentScreen } from './consentScreen'

/**
 * The consent screen is the only text/html surface that reflects
 * attacker-controlled OAuth client metadata (client_name, logo_uri). Because
 * anonymous Dynamic Client Registration lets anyone set those fields, these
 * tests lock in that the values are HTML-escaped and can never break out of
 * their rendering context into executable markup.
 *
 * See DevCycleHQ/cli#581 and the DCR stored-XSS report.
 */

const render = (clientName: string, clientLogo = '') =>
    renderConsentScreen({
        clientName,
        clientLogo,
        requestedScopes: ['openid', 'profile'],
        transactionState: 'txn',
        consentToken: 'csrf',
    }).toString()

// Mirrors the HTML entity escaping applied by hono/html's tagged template.
const htmlEscape = (s: string) =>
    s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

// Payloads spanning the contexts common XSS-bypass lists target: raw tags,
// quote/attribute breakout, SVG, case-mangling, null bytes, unclosed tags.
const XSS_PAYLOADS: [name: string, payload: string][] = [
    ['script tag', '<script>alert(1)</script>'],
    ['quote breakout + script', '"><script>alert(1)</script>'],
    ['svg onload (slash)', '<svg/onload=alert(1)>'],
    ['svg onload (space)', '<svg onload=alert(document.domain)>'],
    ['img onerror', '<img src=x onerror=alert(document.domain)>'],
    ['case-mangled img', '<iMg SrC=x OnErRoR=alert(1)>'],
    ['quote+single breakout svg', `'"><svg onload=alert(1)>`],
    ['body onload', '<body onload=alert(1)>'],
    ['null-byte script', '<%00script>alert(1)</script>'],
    ['unclosed img onerror', '<img src=x onerror=alert(1)'],
    ['anchor javascript uri', '<a href="javascript:alert(1)">x</a>'],
]

describe('renderConsentScreen — client_name XSS escaping', () => {
    test.each(XSS_PAYLOADS)(
        'escapes %s and never emits it raw',
        (_name, payload) => {
            const html = render(payload)
            // The raw payload (with unescaped `<`/`"`) must never survive into
            // the rendered HTML, otherwise it would execute in the browser.
            expect(html).not.toContain(payload)
            // ...and the value must actually be present, in escaped form, so
            // this test fails loudly if the reflection point is ever removed.
            expect(html).toContain(htmlEscape(payload))
        },
    )

    test('reflects the reported payload as inert, escaped text', () => {
        const html = render('<img src=x onerror=alert(document.domain)>')
        expect(html).toContain(
            '&lt;img src=x onerror=alert(document.domain)&gt;',
        )
        expect(html).not.toContain(
            '<img src=x onerror=alert(document.domain)>',
        )
    })

    test('escapes the HTML metacharacters used for breakout', () => {
        const html = render(`"'<>&`)
        expect(html).toContain('&quot;')
        expect(html).toContain('&lt;')
        expect(html).toContain('&gt;')
        expect(html).toContain('&amp;')
    })
})

describe('renderConsentScreen — logo_uri handling', () => {
    test('does not produce a live <img> that breaks out of the src attribute', () => {
        const html = render('Acme', 'https://x/l.png" onerror="alert(1)')
        // The logo block is emitted as escaped text, not live markup, so no
        // executable onerror handler is ever attached to a rendered element.
        expect(html).not.toMatch(/<img[^>]*onerror=/i)
        expect(html).not.toContain('onerror="alert(1)"')
    })

    test('a javascript: logo URI never becomes a live attribute', () => {
        const html = render('Acme', 'javascript:alert(1)')
        expect(html).not.toMatch(/<img[^>]*src="javascript:/i)
    })
})

describe('renderConsentScreen — happy path', () => {
    test('renders a normal client name as visible text', () => {
        const html = render('Claude Code')
        expect(html).toContain('Claude Code')
        expect(html).toContain('Authorization Request')
    })
})
