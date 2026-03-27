import { JsonRpcProvider } from 'ethers'

const DEFAULT_SIGNAL_RPC_URL = process.env.NEXUSAGENT_ALPHA_SIGNAL_RPC_URL?.trim() || 'https://rpc.xlayer.tech'
const DEFAULT_SIGNAL_CHAIN_ID = BigInt(process.env.NEXUSAGENT_ALPHA_SIGNAL_CHAIN_ID?.trim() || '196')
const DEFAULT_MAX_GAS_PRICE_WEI = BigInt(process.env.NEXUSAGENT_ALPHA_MAX_GAS_PRICE_WEI?.trim() || '30000000')

export interface XLayerSignal {
  provider: 'xlayer_rpc'
  rpcUrl: string
  chainId: string
  blockNumber: number
  gasPriceWei: string
  approved: boolean
  thresholdWei: string
  signalSummary: string
  capturedAt: string
}

export async function fetchXLayerSignal() {
  const provider = new JsonRpcProvider(
    DEFAULT_SIGNAL_RPC_URL,
    {
      name: 'xlayer',
      chainId: Number(DEFAULT_SIGNAL_CHAIN_ID),
    },
    { staticNetwork: true },
  )

  try {
    const [network, blockNumber, feeData] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
      provider.getFeeData(),
    ])

    const gasPrice = feeData.gasPrice
    if (network.chainId !== DEFAULT_SIGNAL_CHAIN_ID) {
      throw new Error(
        `Unexpected signal chain id ${network.chainId.toString()}. Expected ${DEFAULT_SIGNAL_CHAIN_ID.toString()}.`,
      )
    }

    if (!gasPrice) {
      throw new Error('Signal provider did not return gas price data.')
    }

    const approved = gasPrice <= DEFAULT_MAX_GAS_PRICE_WEI
    return {
      provider: 'xlayer_rpc' as const,
      rpcUrl: DEFAULT_SIGNAL_RPC_URL,
      chainId: network.chainId.toString(),
      blockNumber: Number(blockNumber),
      gasPriceWei: gasPrice.toString(),
      approved,
      thresholdWei: DEFAULT_MAX_GAS_PRICE_WEI.toString(),
      signalSummary: approved
        ? 'X Layer gas conditions are within the bounded execution threshold.'
        : 'X Layer gas conditions exceed the bounded execution threshold.',
      capturedAt: new Date().toISOString(),
    }
  } finally {
    provider.destroy?.()
  }
}
