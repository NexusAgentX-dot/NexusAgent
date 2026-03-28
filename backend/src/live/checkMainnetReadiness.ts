import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Contract, JsonRpcProvider, Wallet, formatEther, formatUnits } from 'ethers'

const MAINNET_RPC_CANDIDATES = ['https://rpc.xlayer.tech', 'https://xlayerrpc.okx.com']
const MAINNET_CHAIN_ID = 196n
const DEFAULT_TRACKED_TOKENS = [
  {
    symbol: 'USDC',
    address: '0x74b7F16337b8972027F6196A17a631aC6dE26d22',
  },
]

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

type RpcCheck =
  | {
      url: string
      ok: true
      chainId: string
      latestBlockNumber: number
    }
  | {
      url: string
      ok: false
      error: string
    }

interface TokenBalanceResult {
  symbol: string
  address: string
  balance: string
  decimals: number
}

interface MainnetReadinessArtifact {
  checkedAt: string
  requirement: 'mainnet_submission_readiness'
  rpcChecks: RpcCheck[]
  selectedRpcUrl: string | null
  mainnetReachable: boolean
  expectedChainId: string
  wallet: {
    provided: boolean
    address: string | null
    okbBalance: string | null
    trackedTokens: TokenBalanceResult[]
  }
  blockers: string[]
  nextActions: string[]
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

async function checkRpc(url: string): Promise<RpcCheck> {
  const provider = new JsonRpcProvider(
    url,
    {
      name: 'xlayer',
      chainId: Number(MAINNET_CHAIN_ID),
    },
    { staticNetwork: true },
  )

  try {
    const [network, blockNumber] = await withTimeout(
      Promise.all([provider.getNetwork(), provider.getBlockNumber()]),
      12000,
      `RPC check for ${url}`,
    )

    return {
      url,
      ok: true,
      chainId: network.chainId.toString(),
      latestBlockNumber: Number(blockNumber),
    }
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    provider.destroy?.()
  }
}

function parseTrackedTokens() {
  const raw = process.env.NEXUSAGENT_XLAYER_MAINNET_TRACKED_TOKENS?.trim()
  if (!raw) {
    return DEFAULT_TRACKED_TOKENS
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [symbol, address] = entry.split(':')
      if (!symbol || !address) {
        throw new Error(
          'NEXUSAGENT_XLAYER_MAINNET_TRACKED_TOKENS must use SYMBOL:ADDRESS comma-separated format',
        )
      }
      return { symbol, address }
    })
}

async function main() {
  const checkedAt = new Date().toISOString()
  const rpcChecks = await Promise.all(MAINNET_RPC_CANDIDATES.map((url) => checkRpc(url)))
  const workingRpc = rpcChecks.find(
    (check): check is Extract<RpcCheck, { ok: true }> =>
      check.ok && check.chainId === MAINNET_CHAIN_ID.toString(),
  )

  const walletKey = process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY?.trim() || null
  const artifact: MainnetReadinessArtifact = {
    checkedAt,
    requirement: 'mainnet_submission_readiness',
    rpcChecks,
    selectedRpcUrl: workingRpc?.url ?? null,
    mainnetReachable: Boolean(workingRpc),
    expectedChainId: MAINNET_CHAIN_ID.toString(),
    wallet: {
      provided: Boolean(walletKey),
      address: null,
      okbBalance: null,
      trackedTokens: [],
    },
    blockers: [],
    nextActions: [],
  }

  if (!workingRpc) {
    artifact.blockers.push('No official X Layer mainnet RPC endpoint responded successfully.')
    artifact.nextActions.push('Retry connectivity later or use a dedicated mainnet RPC provider from the official docs.')
  }

  if (!walletKey) {
    artifact.blockers.push('No mainnet private key provided for readiness checks.')
    artifact.nextActions.push('Set NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY to inspect live balances before attempting a mainnet proof transfer.')
  }

  if (workingRpc && walletKey) {
    const provider = new JsonRpcProvider(
      workingRpc.url,
      {
        name: 'xlayer',
        chainId: Number(MAINNET_CHAIN_ID),
      },
      { staticNetwork: true },
    )
    const wallet = new Wallet(walletKey, provider)
    artifact.wallet.address = wallet.address

    try {
      const trackedTokens = parseTrackedTokens()
      const okbBalance = await withTimeout(
        provider.getBalance(wallet.address),
        12000,
        'Mainnet OKB balance lookup',
      )
      artifact.wallet.okbBalance = formatEther(okbBalance)

      const tokenBalances = await Promise.all(
        trackedTokens.map(async (token) => {
          const contract = new Contract(token.address, ERC20_ABI, provider)
          const [decimalsRaw, symbol, balanceRaw] = await withTimeout(
            Promise.all([
              contract.decimals(),
              contract.symbol().catch(() => token.symbol),
              contract.balanceOf(wallet.address),
            ]),
            12000,
            `Token balance lookup for ${token.symbol}`,
          )

          const decimals = Number(decimalsRaw)
          return {
            symbol,
            address: token.address,
            balance: formatUnits(balanceRaw, decimals),
            decimals,
          }
        }),
      )

      artifact.wallet.trackedTokens = tokenBalances

      if (okbBalance === 0n) {
        artifact.blockers.push('Wallet has zero OKB on X Layer mainnet, so no gas is available for a mainnet proof transaction.')
      }

      if (tokenBalances.every((token) => Number(token.balance) <= 0)) {
        artifact.blockers.push('Tracked mainnet token balances are zero, so a bounded stablecoin proof transfer cannot be executed yet.')
      }
    } catch (error) {
      artifact.blockers.push(
        `Wallet readiness check failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      provider.destroy?.()
    }
  }

  if (artifact.blockers.length === 0) {
    artifact.nextActions.push('Capture one bounded X Layer mainnet proof transfer and promote public-facing wording from testnet to mainnet.')
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const repoRoot = path.resolve(__dirname, '../../..')
  const outputDir = path.join(repoRoot, 'output', 'mainnet-readiness')
  await mkdir(outputDir, { recursive: true })

  await writeFile(path.join(outputDir, 'latest.json'), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
  await writeFile(
    path.join(outputDir, 'latest.md'),
    [
      '# Mainnet Readiness Report',
      '',
      `- checkedAt: ${artifact.checkedAt}`,
      `- mainnetReachable: ${artifact.mainnetReachable}`,
      `- selectedRpcUrl: ${artifact.selectedRpcUrl ?? 'none'}`,
      `- walletProvided: ${artifact.wallet.provided}`,
      `- walletAddress: ${artifact.wallet.address ?? 'not provided'}`,
      `- okbBalance: ${artifact.wallet.okbBalance ?? 'unknown'}`,
      '',
      '## Blockers',
      '',
      ...(artifact.blockers.length > 0 ? artifact.blockers.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Next Actions',
      '',
      ...(artifact.nextActions.length > 0 ? artifact.nextActions.map((item) => `- ${item}`) : ['- none']),
      '',
      '## Tracked Tokens',
      '',
      ...(artifact.wallet.trackedTokens.length > 0
        ? artifact.wallet.trackedTokens.map(
            (token) => `- ${token.symbol}: ${token.balance} (${token.address})`,
          )
        : ['- none']),
      '',
    ].join('\n'),
    'utf8',
  )

  console.log(JSON.stringify(artifact, null, 2))
}

main().catch((error) => {
  console.error('[checkMainnetReadiness] failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
