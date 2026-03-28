import { isOKXConfigured, okxGet } from './okxOnchainOS.js'

// X Layer chain index for DEX operations
const XLAYER_CHAIN_INDEX = '196'

// USDT on X Layer mainnet
const USDT_XLAYER = '0x779ded0c9e1022225f8e0630b35a9b54be713736'
// Native OKB on X Layer mainnet (wrapped)
const WOKB_XLAYER = '0xe538905cf8410324e03a5a23c1c177a474d59b2b'

export interface DexQuoteResult {
  available: boolean
  provider: 'okx_onchain_os_dex'
  chainIndex: string
  fromToken: string
  toToken: string
  fromAmount: string
  estimatedOutput: string
  priceImpact: string
  routerDescription: string
  estimateGasFee: string
  capturedAt: string
}

interface QuoteResponseData {
  routerResult?: {
    toTokenAmount?: string
    estimateGasFee?: string
    dexRouterList?: Array<{
      routerPercent?: string
      subRouterList?: Array<{
        dexProtocol?: Array<{ dexName?: string }>
      }>
    }>
  }
  toTokenAmount?: string
  estimateGasFee?: string
  priceImpactPercentage?: string
  [key: string]: unknown
}

export async function fetchDexQuote(opts?: {
  fromToken?: string
  toToken?: string
  amount?: string
}): Promise<DexQuoteResult> {
  if (!isOKXConfigured()) {
    return {
      available: false,
      provider: 'okx_onchain_os_dex',
      chainIndex: XLAYER_CHAIN_INDEX,
      fromToken: opts?.fromToken || USDT_XLAYER,
      toToken: opts?.toToken || WOKB_XLAYER,
      fromAmount: opts?.amount || '100000',
      estimatedOutput: '0',
      priceImpact: '0',
      routerDescription: 'OKX DEX API not configured',
      estimateGasFee: '0',
      capturedAt: new Date().toISOString(),
    }
  }

  const fromToken = opts?.fromToken || USDT_XLAYER
  const toToken = opts?.toToken || WOKB_XLAYER
  const amount = opts?.amount || '100000' // 0.1 USDT in 6 decimals

  const result = await okxGet<QuoteResponseData[]>('/api/v6/dex/aggregator/quote', {
    chainIndex: XLAYER_CHAIN_INDEX,
    fromTokenAddress: fromToken,
    toTokenAddress: toToken,
    amount,
    slippagePercent: '0.5',
  })

  if (result.code !== '0' || !result.data || result.data.length === 0) {
    return {
      available: false,
      provider: 'okx_onchain_os_dex',
      chainIndex: XLAYER_CHAIN_INDEX,
      fromToken,
      toToken,
      fromAmount: amount,
      estimatedOutput: '0',
      priceImpact: '0',
      routerDescription: `DEX quote failed: code=${result.code} msg=${result.msg}`,
      estimateGasFee: '0',
      capturedAt: new Date().toISOString(),
    }
  }

  const data = result.data[0]
  const router = data.routerResult
  const dexNames = router?.dexRouterList
    ?.flatMap((r) => r.subRouterList?.flatMap((s) => s.dexProtocol?.map((p) => p.dexName)) || [])
    .filter(Boolean)
    .join(' → ') || 'direct'

  return {
    available: true,
    provider: 'okx_onchain_os_dex',
    chainIndex: XLAYER_CHAIN_INDEX,
    fromToken,
    toToken,
    fromAmount: amount,
    estimatedOutput: router?.toTokenAmount || data.toTokenAmount || '0',
    priceImpact: data.priceImpactPercentage || '0',
    routerDescription: `Best route via ${dexNames} on X Layer`,
    estimateGasFee: router?.estimateGasFee || data.estimateGasFee || '0',
    capturedAt: new Date().toISOString(),
  }
}
