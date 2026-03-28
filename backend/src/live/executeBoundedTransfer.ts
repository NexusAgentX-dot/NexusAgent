import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from 'ethers'

const NETWORK = process.env.NEXUSAGENT_XLAYER_NETWORK?.trim() || 'testnet'
const IS_MAINNET = NETWORK === 'mainnet'

const DEFAULT_RPC_URL = IS_MAINNET ? 'https://rpc.xlayer.tech' : 'https://testrpc.xlayer.tech/terigon'
const DEFAULT_CHAIN_ID = IS_MAINNET ? 196n : 1952n
const DEFAULT_TOKEN_ADDRESS = IS_MAINNET
  ? (process.env.NEXUSAGENT_XLAYER_MAINNET_USDT?.trim() || '0x779ded0c9e1022225f8e0630b35a9b54be713736')
  : '0x9e29b3aada05bf2d2c827af80bd28dc0b9b4fb0c'
const DEFAULT_TRANSFER_AMOUNT = IS_MAINNET ? '0.01' : '0.10'
const DEFAULT_EXPLORER_BASE = IS_MAINNET
  ? 'https://www.oklink.com/xlayer/tx/'
  : 'https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/'

const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address,uint256) returns (bool)',
]

export interface BoundedTransferArtifact {
  workflowId: string
  heroUseCase: string
  chain: {
    name: string
    chainId: string
    rpcUrl: string
  }
  paymentMode: 'x402_live' | 'x402_compatible_demo'
  settlementMode: 'live_mainnet_transfer' | 'live_testnet_transfer'
  sender: string
  recipient: string
  token: {
    address: string
    symbol: string
    decimals: number
  }
  amount: string
  preTransferBalance: string
  postTransferBalance: string
  txHash: string
  explorerUrl: string
  blockNumber: number
  capturedAt: string
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function timestampSlug(isoString: string) {
  return isoString.replace(/[:.]/g, '-')
}

async function writeArtifactFiles(artifact: BoundedTransferArtifact) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const repoRoot = path.resolve(__dirname, '../../..')
  const outputDir = path.join(repoRoot, 'output', IS_MAINNET ? 'mainnet-flow' : 'testnet-flow')
  const runsDir = path.join(outputDir, 'runs')
  const latestJsonPath = path.join(outputDir, 'latest.json')
  const latestMdPath = path.join(outputDir, 'latest.md')
  const runJsonPath = path.join(runsDir, `${timestampSlug(artifact.capturedAt)}.json`)

  await mkdir(runsDir, { recursive: true })
  await writeFile(latestJsonPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
  await writeFile(runJsonPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
  await writeFile(
    latestMdPath,
    [
      `# ${IS_MAINNET ? 'Mainnet' : 'Testnet'} Flow Artifact`,
      '',
      `- capturedAt: ${artifact.capturedAt}`,
      `- workflowId: ${artifact.workflowId}`,
      `- sender: ${artifact.sender}`,
      `- recipient: ${artifact.recipient}`,
      `- token: ${artifact.token.symbol} (${artifact.token.address})`,
      `- amount: ${artifact.amount}`,
      `- txHash: ${artifact.txHash}`,
      `- explorerUrl: ${artifact.explorerUrl}`,
      `- paymentMode: ${artifact.paymentMode}`,
      `- settlementMode: ${artifact.settlementMode}`,
      '',
      '## Hero Use Case',
      '',
      artifact.heroUseCase,
      '',
    ].join('\n'),
    'utf8',
  )
}

export async function executeBoundedTransfer(input: {
  workflowId: string
  heroUseCase: string
  transferAmount?: string
  recipient?: string
  writeArtifacts?: boolean
}) {
  // Use network-appropriate key based on NEXUSAGENT_XLAYER_NETWORK (source of truth)
  const privateKey = IS_MAINNET
    ? requireEnv('NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY')
    : requireEnv('NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY')
  const rpcUrl = process.env.NEXUSAGENT_XLAYER_RPC_URL?.trim() || DEFAULT_RPC_URL
  const tokenAddress =
    process.env.NEXUSAGENT_XLAYER_STABLECOIN_ADDRESS?.trim() || DEFAULT_TOKEN_ADDRESS
  const transferAmount =
    input.transferAmount ??
    (process.env.NEXUSAGENT_XLAYER_TRANSFER_AMOUNT?.trim() || DEFAULT_TRANSFER_AMOUNT)
  const explicitRecipient = input.recipient ?? process.env.NEXUSAGENT_XLAYER_TEST_RECIPIENT?.trim()
  const recipient = explicitRecipient || Wallet.createRandom().address

  const provider = new JsonRpcProvider(rpcUrl)
  const network = await provider.getNetwork()
  if (network.chainId !== DEFAULT_CHAIN_ID) {
    throw new Error(
      `Unexpected chain id ${network.chainId.toString()}. Expected ${DEFAULT_CHAIN_ID.toString()} for X Layer ${IS_MAINNET ? 'mainnet' : 'testnet'}.`,
    )
  }

  const signer = new Wallet(privateKey, provider)
  const token = new Contract(tokenAddress, ERC20_ABI, signer)

  try {
    const [symbol, decimalsRaw, startingBalanceRaw] = await Promise.all([
      token.symbol(),
      token.decimals(),
      token.balanceOf(signer.address),
    ])
    const decimals = Number(decimalsRaw)

    const amountRaw = parseUnits(transferAmount, decimals)
    const maxBoundedAmount = parseUnits('1.00', decimals)
    if (amountRaw > maxBoundedAmount) {
      throw new Error(
        `Refusing to send ${transferAmount} ${symbol}. Test flow is bounded to 1.00 ${symbol} max.`,
      )
    }

    if (startingBalanceRaw < amountRaw) {
      throw new Error(
        `Insufficient ${symbol} balance. Needed ${formatUnits(amountRaw, decimals)}, have ${formatUnits(startingBalanceRaw, decimals)}.`,
      )
    }

    // Wallet API gas estimation (best-effort enhancement)
    let gasOverrides: { gasLimit?: bigint; gasPrice?: bigint } = {}
    try {
      const { getTransactionSignInfo } = await import('../integrations/okxWallet.js')
      const walletGas = await getTransactionSignInfo({
        fromAddr: signer.address,
        toAddr: recipient,
        txAmount: amountRaw.toString(),
        tokenAddress,
      })
      if (walletGas) {
        gasOverrides = {
          gasLimit: BigInt(walletGas.gasLimit),
          ...(walletGas.gasPrice ? { gasPrice: BigInt(walletGas.gasPrice) } : {}),
        }
        console.log(`[Executor] Gas from OKX Wallet API: limit=${walletGas.gasLimit} price=${walletGas.gasPrice}`)
      }
    } catch {
      console.log('[Executor] Wallet API gas estimation not available, using RPC defaults')
    }

    const tx = await token.transfer(recipient, amountRaw, gasOverrides)
    const receipt = await tx.wait()
    if (!receipt || receipt.status !== 1) {
      throw new Error(`Bounded ${IS_MAINNET ? 'mainnet' : 'testnet'} transfer failed or receipt was not confirmed.`)
    }

    const postTransferBalanceRaw = await token.balanceOf(signer.address, {
      blockTag: receipt.blockNumber,
    })
    const preTransferBalanceRaw =
      receipt.blockNumber > 0
        ? await token.balanceOf(signer.address, {
            blockTag: receipt.blockNumber - 1,
          })
        : startingBalanceRaw

    const artifact: BoundedTransferArtifact = {
      workflowId: input.workflowId,
      heroUseCase: input.heroUseCase,
      chain: {
        name: IS_MAINNET ? 'X Layer mainnet' : 'X Layer testnet',
        chainId: network.chainId.toString(),
        rpcUrl,
      },
      paymentMode: IS_MAINNET ? 'x402_live' : 'x402_compatible_demo',
      settlementMode: IS_MAINNET ? 'live_mainnet_transfer' : 'live_testnet_transfer',
      sender: signer.address,
      recipient,
      token: {
        address: tokenAddress,
        symbol,
        decimals,
      },
      amount: formatUnits(amountRaw, decimals),
      preTransferBalance: formatUnits(preTransferBalanceRaw, decimals),
      postTransferBalance: formatUnits(postTransferBalanceRaw, decimals),
      txHash: tx.hash,
      explorerUrl: `${DEFAULT_EXPLORER_BASE}${tx.hash}`,
      blockNumber: Number(receipt.blockNumber),
      capturedAt: new Date().toISOString(),
    }

    if (input.writeArtifacts) {
      await writeArtifactFiles(artifact)
    }

    return artifact
  } finally {
    provider.destroy?.()
  }
}

