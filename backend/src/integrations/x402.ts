import { fetchOKBMarketSignal, type OKBMarketSignal } from './okxMarket.js'

// X Layer USDT contract (testnet)
const USDT_XLAYER_TESTNET = '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c'
// NexusAgent treasury address (receives x402 payments)
const NEXUSAGENT_PAY_TO = process.env.NEXUSAGENT_X402_PAY_TO?.trim() || '0x031189016E014447C467163D4A818D847359f980'

export interface X402PaymentRequirement {
  scheme: 'exact'
  network: 'x-layer-testnet'
  maxAmountRequired: string
  payTo: string
  asset: string
  resource: string
  description: string
}

export interface X402PaymentHeader {
  paymentRequirements: X402PaymentRequirement[]
}

export interface X402PremiumResponse {
  signal: OKBMarketSignal
  premium: {
    detailedAnalysis: string
    riskScore: string
    recommendation: string
    onchainOSEnriched: boolean
  }
  x402: {
    status: 'paid' | 'verified'
    paymentTxHash: string | null
    settledOnChain: boolean
  }
}

/**
 * Build the PAYMENT-REQUIRED header payload per x402 spec.
 * The resource server returns this as base64 in the 402 response.
 */
export function buildPaymentRequirement(resource: string): X402PaymentHeader {
  return {
    paymentRequirements: [
      {
        scheme: 'exact',
        network: 'x-layer-testnet',
        maxAmountRequired: '100000', // 0.1 USDT (6 decimals)
        payTo: NEXUSAGENT_PAY_TO,
        asset: USDT_XLAYER_TESTNET,
        resource,
        description: 'Pay 0.10 USDT for premium OKB market signal with risk analysis',
      },
    ],
  }
}

/**
 * Validate an X-PAYMENT header.
 * In full x402: verify EIP-712 signature + EIP-3009 transferWithAuthorization.
 * For MVP: accept any well-formed JSON payment proof.
 */
export function validatePaymentHeader(
  paymentHeader: string,
): { valid: boolean; txHash: string | null; reason: string } {
  console.log(`[x402] Validating payment header (${paymentHeader.slice(0, 20)}...)`)
  try {
    const decoded = JSON.parse(
      Buffer.from(paymentHeader, 'base64').toString('utf-8'),
    )
    // Accept if it has a txHash (live settlement) or signature (EIP-712)
    if (decoded.txHash && typeof decoded.txHash === 'string') {
      return { valid: true, txHash: decoded.txHash, reason: 'Payment tx hash provided' }
    }
    if (decoded.signature && typeof decoded.signature === 'string') {
      return { valid: true, txHash: null, reason: 'EIP-712 signature accepted (pending settlement)' }
    }
    // For demo: accept any base64-encoded JSON with a "paid" flag
    if (decoded.paid === true) {
      return { valid: true, txHash: decoded.txHash || null, reason: 'Demo payment accepted' }
    }
    return { valid: false, txHash: null, reason: 'Payment header missing txHash or signature' }
  } catch {
    return { valid: false, txHash: null, reason: 'Invalid payment header encoding' }
  }
}

/**
 * Build the premium signal response (returned after payment).
 */
export async function buildPremiumSignal(paymentTxHash: string | null): Promise<X402PremiumResponse> {
  const signal = await fetchOKBMarketSignal()

  const changeNum = parseFloat(signal.change24h) || 0
  const priceNum = parseFloat(signal.price) || 0

  let riskScore: string
  let recommendation: string
  if (Math.abs(changeNum) > 5) {
    riskScore = 'HIGH'
    recommendation = 'High volatility detected. Reduce position size or wait for stabilization.'
  } else if (Math.abs(changeNum) > 2) {
    riskScore = 'MEDIUM'
    recommendation = 'Moderate movement. Bounded execution within normal risk parameters.'
  } else {
    riskScore = 'LOW'
    recommendation = 'Stable conditions. Optimal window for bounded execution.'
  }

  return {
    signal,
    premium: {
      detailedAnalysis: `OKB trading at $${signal.price} with ${signal.change24h}% 24h change. ${
        signal.onchainOSMetadata
          ? `Market cap $${parseFloat(signal.onchainOSMetadata.marketCap).toFixed(0)}, ${signal.onchainOSMetadata.holders} holders, ${signal.onchainOSMetadata.txs24h} txs/24h.`
          : 'Detailed on-chain metrics available via Onchain OS.'
      }`,
      riskScore,
      recommendation,
      onchainOSEnriched: !!signal.onchainOSMetadata,
    },
    x402: {
      status: paymentTxHash ? 'paid' : 'verified',
      paymentTxHash,
      settledOnChain: !!paymentTxHash,
    },
  }
}
