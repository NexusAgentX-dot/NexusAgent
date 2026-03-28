import { getX402Supported, executeX402Payment } from '../integrations/x402Okx.js'

async function main() {
  console.log('=== OKX x402 Full Payment Flow ===\n')

  console.log('Step 1: Check supported networks...')
  const supported = await getX402Supported()
  console.log(JSON.stringify(supported, null, 2))

  console.log('\nStep 2: Execute EIP-3009 signed payment via OKX facilitator...')
  const pk = process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY
  if (!pk) {
    console.error('Missing NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY')
    process.exit(1)
  }

  const result = await executeX402Payment({
    payerPrivateKey: pk,
    payTo: '0x031189016E014447C467163D4A818D847359f980',
    amount: '10000',  // 0.01 USDT (6 decimals)
    asset: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
    resource: '/api/signals/premium-okb',
    description: 'NexusAgent premium OKB signal via x402',
  })

  console.log('\n=== Result ===')
  console.log(JSON.stringify(result, null, 2))

  if (result.txHash) {
    console.log(`\nExplorer: https://www.oklink.com/xlayer/tx/${result.txHash}`)
  }
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1) })
