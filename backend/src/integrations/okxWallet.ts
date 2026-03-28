import { isOKXConfigured, okxPost } from './okxOnchainOS.js'

const XLAYER_CHAIN_INDEX = '196'

export interface WalletSignInfo {
  gasLimit: string
  nonce: string
  gasPrice: string
}

export async function getTransactionSignInfo(params: {
  fromAddr: string
  toAddr: string
  txAmount?: string
  chainIndex?: string
  tokenAddress?: string
}): Promise<WalletSignInfo | null> {
  if (!isOKXConfigured()) return null

  try {
    const body: Record<string, unknown> = {
      chainIndex: params.chainIndex || XLAYER_CHAIN_INDEX,
      fromAddr: params.fromAddr,
      toAddr: params.toAddr,
    }
    if (params.txAmount) body.txAmount = params.txAmount

    const extJson: Record<string, string> = {}
    if (params.tokenAddress) extJson.tokenAddress = params.tokenAddress
    if (Object.keys(extJson).length > 0) body.extJson = extJson

    const result = await okxPost<WalletSignInfo[]>(
      '/api/v5/wallet/pre-transaction/sign-info',
      body,
    )

    if (result.code === '0' && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0]
    }
    return null
  } catch (error) {
    console.warn(`[Wallet] sign-info failed: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

export async function checkWalletReady(address: string, chainIndex?: string): Promise<{
  ready: boolean
  address: string
  chainIndex: string
  note: string
}> {
  const chain = chainIndex || XLAYER_CHAIN_INDEX

  const signInfo = await getTransactionSignInfo({
    fromAddr: address,
    toAddr: address,
    chainIndex: chain,
  })

  if (signInfo) {
    return {
      ready: true,
      address,
      chainIndex: chain,
      note: `Wallet reachable via Onchain OS Wallet API. Gas price: ${typeof signInfo.gasPrice === 'string' ? signInfo.gasPrice : JSON.stringify(signInfo.gasPrice)}`,
    }
  }

  return {
    ready: false,
    address,
    chainIndex: chain,
    note: 'Wallet check via Onchain OS not available. Using direct RPC fallback.',
  }
}
