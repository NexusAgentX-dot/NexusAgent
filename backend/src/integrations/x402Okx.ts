/**
 * OKX x402 Facilitator Integration
 *
 * Implements the full x402 payment flow using OKX's facilitator API:
 * 1. GET  /api/v6/x402/supported  — check supported networks
 * 2. POST /api/v6/x402/verify     — verify EIP-3009 payment signature
 * 3. POST /api/v6/x402/settle     — settle payment on-chain, get txHash
 */
import { okxGet, okxPost, isOKXConfigured } from './okxOnchainOS.js'
import { Wallet, randomBytes, TypedDataEncoder } from 'ethers'

const XLAYER_CHAIN_INDEX = '196'
const USDT_XLAYER_MAINNET = '0x779ded0c9e1022225f8e0630b35a9b54be713736'

// --- Types ---

export interface X402Supported {
  x402Version: string
  scheme: string
  chainIndex: string
  chainName: string
}

export interface X402PaymentAuthorization {
  from: string
  to: string
  value: string
  validAfter: string
  validBefore: string
  nonce: string
}

export interface X402PaymentPayload {
  x402Version: string
  scheme: string
  payload: {
    signature: string
    authorization: X402PaymentAuthorization
  }
}

export interface X402PaymentRequirements {
  scheme: string
  maxAmountRequired: string
  payTo: string
  asset?: string
  resource?: string
  description?: string
}

export interface X402VerifyResult {
  isValid: boolean
  invalidReason: string
  payer: string
}

export interface X402SettleResult {
  success: boolean
  errorReason: string | null
  payer: string
  txHash: string
  chainIndex: string
  chainName: string
}

// --- API Functions ---

export async function getX402Supported(): Promise<X402Supported[]> {
  const result = await okxGet<X402Supported[]>('/api/v6/x402/supported')
  if (result.code !== '0') throw new Error(`x402 supported failed: ${result.msg}`)
  return result.data
}

export async function verifyX402Payment(
  paymentPayload: X402PaymentPayload,
  paymentRequirements: X402PaymentRequirements,
): Promise<X402VerifyResult> {
  const result = await okxPost<X402VerifyResult[]>('/api/v6/x402/verify', {
    x402Version: '1',
    chainIndex: XLAYER_CHAIN_INDEX,
    paymentPayload,
    paymentRequirements,
  })
  if (result.code !== '0') throw new Error(`x402 verify failed: ${result.msg}`)
  return result.data[0]
}

export async function settleX402Payment(
  paymentPayload: X402PaymentPayload,
  paymentRequirements: X402PaymentRequirements,
  syncSettle = true,
): Promise<X402SettleResult> {
  const result = await okxPost<X402SettleResult[]>('/api/v6/x402/settle', {
    x402Version: '1',
    chainIndex: XLAYER_CHAIN_INDEX,
    syncSettle,
    paymentPayload,
    paymentRequirements,
  })
  if (result.code !== '0') throw new Error(`x402 settle failed: ${result.msg}`)
  return result.data[0]
}

// --- EIP-3009 Signature Creation ---

/**
 * Create and sign an EIP-3009 transferWithAuthorization for x402 payment.
 * This produces the paymentPayload that the server sends to OKX facilitator.
 */
export async function createX402PaymentSignature(params: {
  payerPrivateKey: string
  payTo: string
  amount: string  // in smallest units (e.g., "10000" for 0.01 USDT with 6 decimals)
  asset?: string
}): Promise<X402PaymentPayload> {
  const wallet = new Wallet(params.payerPrivateKey)
  const now = Math.floor(Date.now() / 1000)
  const nonce = '0x' + Buffer.from(randomBytes(32)).toString('hex')

  const authorization: X402PaymentAuthorization = {
    from: wallet.address,
    to: params.payTo,
    value: params.amount,
    validAfter: '0',
    validBefore: String(now + 3600), // 1 hour validity
    nonce,
  }

  // EIP-712 typed data for EIP-3009 transferWithAuthorization
  const domain = {
    name: 'USD₮0',
    version: '1',
    chainId: 196,  // X Layer mainnet
    verifyingContract: params.asset || USDT_XLAYER_MAINNET,
  }

  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  }

  const signature = await wallet.signTypedData(domain, types, {
    from: wallet.address,
    to: params.payTo,
    value: params.amount,
    validAfter: authorization.validAfter,
    validBefore: authorization.validBefore,
    nonce,
  })

  return {
    x402Version: '1',
    scheme: 'exact',
    payload: {
      signature,
      authorization,
    },
  }
}

/**
 * Execute a full x402 payment flow:
 * 1. Sign EIP-3009 authorization
 * 2. Verify with OKX facilitator
 * 3. Settle on-chain
 * Returns the settlement txHash
 */
export async function executeX402Payment(params: {
  payerPrivateKey: string
  payTo: string
  amount: string
  asset?: string
  resource?: string
  description?: string
}): Promise<{
  verified: boolean
  settled: boolean
  txHash: string
  payer: string
  error?: string
}> {
  if (!isOKXConfigured()) {
    return { verified: false, settled: false, txHash: '', payer: '', error: 'OKX API not configured' }
  }

  try {
    // Step 1: Create signed payment
    console.log('[x402-OKX] Creating EIP-3009 payment signature...')
    const paymentPayload = await createX402PaymentSignature({
      payerPrivateKey: params.payerPrivateKey,
      payTo: params.payTo,
      amount: params.amount,
      asset: params.asset,
    })

    const paymentRequirements: X402PaymentRequirements = {
      scheme: 'exact',
      maxAmountRequired: params.amount,
      payTo: params.payTo,
      asset: params.asset || USDT_XLAYER_MAINNET,
      resource: params.resource,
      description: params.description,
    }

    // Step 2: Verify with OKX facilitator
    console.log('[x402-OKX] Verifying payment with OKX facilitator...')
    const verification = await verifyX402Payment(paymentPayload, paymentRequirements)
    console.log(`[x402-OKX] Verify result: valid=${verification.isValid} payer=${verification.payer}`)

    if (!verification.isValid) {
      return {
        verified: false,
        settled: false,
        txHash: '',
        payer: verification.payer,
        error: `Verification failed: ${verification.invalidReason}`,
      }
    }

    // Step 3: Settle on-chain via OKX facilitator
    console.log('[x402-OKX] Settling payment on-chain...')
    const settlement = await settleX402Payment(paymentPayload, paymentRequirements)
    console.log(`[x402-OKX] Settle result: success=${settlement.success} txHash=${settlement.txHash}`)

    return {
      verified: true,
      settled: settlement.success,
      txHash: settlement.txHash || '',
      payer: settlement.payer,
      error: settlement.errorReason || undefined,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.warn(`[x402-OKX] Payment flow failed: ${msg}`)
    return { verified: false, settled: false, txHash: '', payer: '', error: msg }
  }
}
