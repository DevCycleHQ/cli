import { JavascriptEngine } from './javascript'

export const ENGINES: Record<string, (typeof JavascriptEngine)[]> = {
    js: [JavascriptEngine],
    jsx: [JavascriptEngine],
    ts: [JavascriptEngine],
    tsx: [JavascriptEngine],
}
