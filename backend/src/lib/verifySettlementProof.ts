import { JsonRpcProvider } from 'ethers'

const X_LAYER_TESTNET_RPC_URL = 'https://testrpc.xlayer.tech/terigon'
const X_LAYER_MAINNET_RPC_URL = 'https://rpc.xlayer.tech'

export interface SettlementVerificationResult {
  ok: boolean
  network: 'testnet' | 'mainnet'
  txHash: string
  blockNumber: number | null
  receiptStatus: number | null
  checkedAt: string
  note: string
}

function inferNetwork(explorerUrl: string) {
  return explorerUrl.includes('x-layer-testnet') ? 'testnet' : 'mainnet'
}

function rpcUrlFor(network: 'testnet' | 'mainnet') {
  return network === 'testnet' ? X_LAYER_TESTNET_RPC_URL : X_LAYER_MAINNET_RPC_URL
}

export async function verifySettlementProof(txHash: string, explorerUrl: string): Promise<SettlementVerificationResult> {
  const network = inferNetwork(explorerUrl)
  const provider = new JsonRpcProvider(rpcUrlFor(network))

  try {
    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt) {
      return {
        ok: false,
        network,
        txHash,
        blockNumber: null,
        receiptStatus: null,
        checkedAt: new Date().toISOString(),
        note: 'No X Layer receipt was found for the supplied settlement hash.',
      }
    }

    return {
      ok: receipt.status === 1,
      network,
      txHash,
      blockNumber: Number(receipt.blockNumber),
      receiptStatus: receipt.status,
      checkedAt: new Date().toISOString(),
      note:
        receipt.status === 1
          ? 'Settlement receipt was confirmed through X Layer RPC.'
          : 'Settlement receipt exists, but the status is not successful.',
    }
  } finally {
    provider.destroy?.()
  }
}
