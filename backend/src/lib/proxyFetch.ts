import { ProxyAgent } from 'undici'

const PROXY_URL =
  process.env.HTTPS_PROXY?.trim() ||
  process.env.https_proxy?.trim() ||
  process.env.HTTP_PROXY?.trim() ||
  process.env.http_proxy?.trim() ||
  ''

let proxyDispatcher: ProxyAgent | undefined
if (PROXY_URL) {
  proxyDispatcher = new ProxyAgent(PROXY_URL)
}

/**
 * A fetch wrapper that respects HTTP_PROXY / HTTPS_PROXY environment variables.
 * Node.js native fetch ignores proxy env vars, so we use undici ProxyAgent.
 */
const DEFAULT_TIMEOUT_MS = 10000

export function proxyFetch(url: string | URL, init?: RequestInit): Promise<Response> {
  const signal = init?.signal || AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  const opts = { ...init, signal } as RequestInit
  if (proxyDispatcher) {
    return fetch(url, { ...opts, dispatcher: proxyDispatcher } as RequestInit)
  }
  return fetch(url, opts)
}
