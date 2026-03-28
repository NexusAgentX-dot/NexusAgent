/**
 * Test the full x402 premium signal flow through the server endpoint:
 * 1. Request → 402
 * 2. Sign EIP-3009 payment
 * 3. Send X-PAYMENT header → OKX verify → settle → 200 + premium signal + txHash
 */
import { createX402PaymentSignature } from '../integrations/x402Okx.js'

async function main() {
  const pk = process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY
  if (!pk) { console.error('Missing NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY'); process.exit(1) }

  const BASE = 'http://localhost:8787'

  // Step 1: Request without payment
  console.log('=== Step 1: Request premium signal (no payment) ===')
  const res1 = await fetch(`${BASE}/api/signals/premium-okb`)
  console.log(`HTTP ${res1.status}`)

  // Step 2: Create EIP-3009 signed payment
  console.log('\n=== Step 2: Create EIP-3009 signed payment ===')
  const payload = await createX402PaymentSignature({
    payerPrivateKey: pk,
    payTo: '0x031189016E014447C467163D4A818D847359f980',
    amount: '10000',
    asset: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
  })
  console.log('Signature created:', payload.payload.signature.slice(0, 20) + '...')

  // Step 3: Send payment via X-PAYMENT header
  console.log('\n=== Step 3: Send payment → verify → settle → premium signal ===')
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
  const res2 = await fetch(`${BASE}/api/signals/premium-okb`, {
    headers: { 'X-PAYMENT': encoded },
  })
  console.log(`HTTP ${res2.status}`)

  const data = await res2.json() as Record<string, unknown>
  const x402 = data.x402 as Record<string, unknown>
  const signal = data.signal as Record<string, unknown>

  console.log('\n=== Result ===')
  console.log(`x402 status: ${x402?.status}`)
  console.log(`txHash: ${x402?.paymentTxHash}`)
  console.log(`settled: ${x402?.settledOnChain}`)
  console.log(`facilitator: ${x402?.facilitator}`)
  console.log(`OKB price: $${signal?.price}`)

  if (x402?.paymentTxHash) {
    console.log(`\nExplorer: https://www.oklink.com/xlayer/tx/${x402.paymentTxHash}`)
  }
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1) })
