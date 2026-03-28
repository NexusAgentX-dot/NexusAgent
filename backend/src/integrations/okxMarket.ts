import { isOKXConfigured, okxPostArray } from './okxOnchainOS.js'
import { proxyFetch } from '../lib/proxyFetch.js'

// OKB ERC-20 on Ethereum (chain index 1) — the Onchain OS Market API has rich data here
const OKB_CHAIN_INDEX = '1'
const OKB_TOKEN_ADDRESS = '0x75231f58b43240c9718dd58b4967c5114342a86c'

// Fallback: OKX public ticker API (no auth required)
const PUBLIC_TICKER_URL = 'https://www.okx.com/api/v5/market/ticker?instId=OKB-USDT'

export interface OKBMarketSignal {
  provider: 'okx_onchain_os' | 'okx_public_api'
  price: string
  change24h: string
  volume24h: string
  approved: boolean
  thresholdRule: string
  signalSummary: string
  capturedAt: string
  onchainOSMetadata?: {
    marketCap: string
    holders: string
    liquidity: string
    txs24h: string
    priceChange1h: string
    priceChange4h: string
  }
}

interface OnchainOSPriceInfo {
  price?: string
  priceChange24H?: string
  volume24H?: string
  marketCap?: string
  holders?: string
  liquidity?: string
  txs24H?: string
  [key: string]: unknown
}

interface PublicTickerData {
  last: string
  vol24h: string
  open24h: string
  [key: string]: unknown
}

function evaluateApproval(price: string, change24h: string, volume24h: string): {
  approved: boolean
  thresholdRule: string
} {
  const changeNum = parseFloat(change24h) || 0
  const volNum = parseFloat(volume24h) || 0
  const priceNum = parseFloat(price) || 0

  // Approve if OKB shows meaningful market activity:
  // - 24h price change magnitude > 1% (volatility = opportunity)
  // - OR volume > 5M USD (significant liquidity)
  // - AND price is within reasonable bounds (> $1)
  const volatilityThreshold = parseFloat(process.env.NEXUSAGENT_SIGNAL_VOLATILITY_THRESHOLD || '1')
  const hasVolatility = Math.abs(changeNum) > volatilityThreshold
  const hasVolume = volNum > 5_000_000
  const priceReasonable = priceNum > 1

  const approved = priceReasonable && (hasVolatility || hasVolume)
  const thresholdRule = '|24h_change| > 1% OR volume_24h > 5M USD; price > $1'

  return { approved, thresholdRule }
}

async function fetchViaOnchainOS(): Promise<OKBMarketSignal> {
  const result = await okxPostArray<OnchainOSPriceInfo[]>('/api/v6/dex/market/price-info', [
    {
      chainIndex: OKB_CHAIN_INDEX,
      tokenContractAddress: OKB_TOKEN_ADDRESS,
    },
  ])

  if (result.code !== '0' || !result.data || result.data.length === 0) {
    throw new Error(`Onchain OS price-info returned code=${result.code} msg=${result.msg}`)
  }

  const info = result.data[0]
  const price = parseFloat(info.price || '0').toFixed(2)
  const change24h = info.priceChange24H || '0'
  const volume24h = parseFloat(info.volume24H || '0').toFixed(0)
  const { approved, thresholdRule } = evaluateApproval(price, change24h, volume24h)

  return {
    provider: 'okx_onchain_os',
    price,
    change24h,
    volume24h,
    approved,
    thresholdRule,
    signalSummary: approved
      ? `OKB at $${price} (${change24h}% 24h, vol ${volume24h}) via Onchain OS Market API — conditions met for bounded execution.`
      : `OKB at $${price} (${change24h}% 24h, vol ${volume24h}) via Onchain OS Market API — threshold not met.`,
    capturedAt: new Date().toISOString(),
    onchainOSMetadata: {
      marketCap: info.marketCap || '0',
      holders: info.holders || '0',
      liquidity: info.liquidity || '0',
      txs24h: info.txs24H || '0',
      priceChange1h: (info as Record<string, string>).priceChange1H || '0',
      priceChange4h: (info as Record<string, string>).priceChange4H || '0',
    },
  }
}

async function fetchViaPublicAPI(): Promise<OKBMarketSignal> {
  const res = await proxyFetch(PUBLIC_TICKER_URL)
  if (!res.ok) {
    throw new Error(`OKX public ticker returned ${res.status}`)
  }

  const json = (await res.json()) as { code: string; data: PublicTickerData[] }
  if (json.code !== '0' || !json.data || json.data.length === 0) {
    throw new Error(`OKX public ticker returned code=${json.code}`)
  }

  const ticker = json.data[0]
  const price = ticker.last
  const open24h = parseFloat(ticker.open24h) || 0
  const last = parseFloat(ticker.last) || 0
  const change24h = open24h > 0 ? (((last - open24h) / open24h) * 100).toFixed(2) : '0'
  const volume24h = ticker.vol24h || '0'
  const { approved, thresholdRule } = evaluateApproval(price, change24h, volume24h)

  return {
    provider: 'okx_public_api',
    price,
    change24h,
    volume24h,
    approved,
    thresholdRule,
    signalSummary: approved
      ? `OKB at $${price} (${change24h}% 24h) via OKX Public API — conditions met for bounded execution.`
      : `OKB at $${price} (${change24h}% 24h) via OKX Public API — threshold not met.`,
    capturedAt: new Date().toISOString(),
  }
}

export async function fetchOKBMarketSignal(): Promise<OKBMarketSignal> {
  if (isOKXConfigured()) {
    try {
      return await fetchViaOnchainOS()
    } catch (error) {
      console.warn(
        `[OKB Signal] Onchain OS failed, falling back to public API: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  return fetchViaPublicAPI()
}
