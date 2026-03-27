import { createHmac } from 'node:crypto'
import { proxyFetch } from '../lib/proxyFetch.js'

const OKX_API_KEY = process.env.OKX_API_KEY?.trim() || ''
const OKX_SECRET_KEY = process.env.OKX_SECRET_KEY?.trim() || ''
const OKX_PASSPHRASE = process.env.OKX_PASSPHRASE?.trim() || ''
const OKX_PROJECT_ID = process.env.OKX_PROJECT_ID?.trim() || ''

const BASE_URL = 'https://web3.okx.com'

export function isOKXConfigured(): boolean {
  return !!(OKX_API_KEY && OKX_SECRET_KEY && OKX_PASSPHRASE && OKX_PROJECT_ID)
}

function sign(timestamp: string, method: string, requestPath: string, body: string): string {
  const stringToSign = timestamp + method + requestPath + body
  const hmac = createHmac('sha256', OKX_SECRET_KEY)
  hmac.update(stringToSign)
  return hmac.digest('base64')
}

function getAuthHeaders(method: string, requestPath: string, body: string) {
  const timestamp = new Date().toISOString()
  return {
    'OK-ACCESS-KEY': OKX_API_KEY,
    'OK-ACCESS-SIGN': sign(timestamp, method, requestPath, body),
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': OKX_PASSPHRASE,
    'OK-ACCESS-PROJECT': OKX_PROJECT_ID,
    'Content-Type': 'application/json',
  }
}

export interface OKXAPIResponse<T = unknown> {
  code: string
  msg: string
  data: T
}

export async function okxPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<OKXAPIResponse<T>> {
  const bodyStr = JSON.stringify(body)
  const headers = getAuthHeaders('POST', path, bodyStr)
  const res = await proxyFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: bodyStr,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OKX API POST ${path} returned ${res.status}: ${text}`)
  }
  return res.json() as Promise<OKXAPIResponse<T>>
}

export async function okxPostArray<T = unknown>(path: string, body: Record<string, unknown>[]): Promise<OKXAPIResponse<T>> {
  const bodyStr = JSON.stringify(body)
  const headers = getAuthHeaders('POST', path, bodyStr)
  const res = await proxyFetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: bodyStr,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OKX API POST ${path} returned ${res.status}: ${text}`)
  }
  return res.json() as Promise<OKXAPIResponse<T>>
}

export async function okxGet<T = unknown>(path: string, params?: Record<string, string>): Promise<OKXAPIResponse<T>> {
  let requestPath = path
  if (params) {
    const qs = new URLSearchParams(params).toString()
    if (qs) requestPath = `${path}?${qs}`
  }
  const headers = getAuthHeaders('GET', requestPath, '')
  const res = await proxyFetch(`${BASE_URL}${requestPath}`, {
    method: 'GET',
    headers,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OKX API GET ${requestPath} returned ${res.status}: ${text}`)
  }
  return res.json() as Promise<OKXAPIResponse<T>>
}
