/**
 * x402 Payment Module — uses OKX Onchain OS Facilitator
 *
 * Flow:
 * 1. Client requests premium resource → Server returns HTTP 402 + PAYMENT-REQUIRED
 * 2. Client signs EIP-3009 transferWithAuthorization (EIP-712)
 * 3. Client sends X-PAYMENT header with signed payload
 * 4. Server calls OKX /api/v6/x402/verify → validates signature
 * 5. Server calls OKX /api/v6/x402/settle → on-chain settlement, returns txHash
 * 6. Server returns premium resource
 */
import { fetchOKBMarketSignal, type OKBMarketSignal } from './okxMarket.js'
import { verifyX402Payment, settleX402Payment, type X402PaymentPayload, type X402PaymentRequirements as OkxPaymentReqs } from './x402Okx.js'
import { isOKXConfigured } from './okxOnchainOS.js'

const USDT_XLAYER = '0x779ded0c9e1022225f8e0630b35a9b54be713736'
const NEXUSAGENT_PAY_TO = process.env.NEXUSAGENT_X402_PAY_TO?.trim() || '0x031189016E014447C467163D4A818D847359f980'

export interface X402PaymentRequirement {
  scheme: 'exact'
  network: 'x-layer'
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
    status: 'settled' | 'verified' | 'failed'
    paymentTxHash: string | null
    settledOnChain: boolean
    facilitator: string
  }
}

/**
 * Build the PAYMENT-REQUIRED header payload per x402 spec.
 */
export function buildPaymentRequirement(resource: string): X402PaymentHeader {
  return {
    paymentRequirements: [
      {
        scheme: 'exact',
        network: 'x-layer',
        maxAmountRequired: '10000', // 0.01 USDT (6 decimals)
        payTo: NEXUSAGENT_PAY_TO,
        asset: USDT_XLAYER,
        resource,
        description: 'Pay 0.01 USDT via x402 for premium OKB market signal with risk analysis',
      },
    ],
  }
}

/**
 * Validate and settle an X-PAYMENT header via OKX facilitator.
 *
 * The header should be base64-encoded JSON containing:
 * - x402Version, scheme, payload.signature, payload.authorization
 * (This is what createX402PaymentSignature in x402Okx.ts produces)
 */
export async function validateAndSettlePayment(
  paymentHeader: string,
  resource: string,
): Promise<{ valid: boolean; txHash: string | null; reason: string }> {
  console.log(`[x402] Processing payment header (${paymentHeader.slice(0, 20)}...)`)

  let decoded: X402PaymentPayload
  try {
    decoded = JSON.parse(Buffer.from(paymentHeader, 'base64').toString('utf-8'))
  } catch {
    return { valid: false, txHash: null, reason: 'Invalid payment header encoding' }
  }

  // Check if this is a proper x402 payload with EIP-3009 signature
  if (decoded.payload?.signature && decoded.payload?.authorization) {
    if (!isOKXConfigured()) {
      return { valid: false, txHash: null, reason: 'OKX API not configured for x402 verification' }
    }

    // Server enforces its own declared price — never trust client payload amount
    const SERVER_PRICE = '10000' // 0.01 USDT (6 decimals) — must match buildPaymentRequirement
    const paymentReqs: OkxPaymentReqs = {
      scheme: 'exact',
      maxAmountRequired: SERVER_PRICE,
      payTo: NEXUSAGENT_PAY_TO,
      asset: USDT_XLAYER,
      resource,
      description: 'Premium OKB signal',
    }

    try {
      // Step 1: Verify with OKX facilitator
      console.log('[x402] Verifying with OKX facilitator...')
      const verification = await verifyX402Payment(decoded, paymentReqs)

      if (!verification.isValid) {
        return { valid: false, txHash: null, reason: `OKX verify failed: ${verification.invalidReason}` }
      }

      // Step 2: Settle on-chain via OKX facilitator
      console.log('[x402] Settling on-chain via OKX facilitator...')
      const settlement = await settleX402Payment(decoded, paymentReqs)

      if (settlement.success && settlement.txHash) {
        console.log(`[x402] Settled on-chain: ${settlement.txHash}`)
        return { valid: true, txHash: settlement.txHash, reason: 'OKX facilitator: verified + settled on-chain' }
      }

      return { valid: true, txHash: null, reason: `OKX verify passed but settle failed: ${settlement.errorReason}` }
    } catch (error) {
      console.warn(`[x402] OKX facilitator error: ${error instanceof Error ? error.message : error}`)
      return { valid: false, txHash: null, reason: `OKX facilitator error: ${error instanceof Error ? error.message : error}` }
    }
  }

  return { valid: false, txHash: null, reason: 'Payment header must contain EIP-3009 signature (payload.signature + payload.authorization). Use createX402PaymentSignature() from x402Okx.ts.' }
}

/**
 * Build the premium signal response (returned after payment).
 */
export async function buildPremiumSignal(paymentTxHash: string | null, facilitator: string): Promise<X402PremiumResponse> {
  const signal = await fetchOKBMarketSignal()
  const changeNum = parseFloat(signal.change24h) || 0

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
      status: paymentTxHash ? 'settled' : 'verified',
      paymentTxHash,
      settledOnChain: !!paymentTxHash,
      facilitator,
    },
  }
}
