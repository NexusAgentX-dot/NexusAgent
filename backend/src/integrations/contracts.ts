import { Contract, JsonRpcProvider, Wallet, id as keccak256Id, keccak256, toUtf8Bytes } from 'ethers'
import { proxyFetch } from '../lib/proxyFetch.js'

const REGISTRY_ADDRESS = process.env.NEXUSAGENT_AGENT_REGISTRY_ADDRESS?.trim() || ''
const ESCROW_ADDRESS = process.env.NEXUSAGENT_AGENT_ESCROW_ADDRESS?.trim() || ''
// NEXUSAGENT_XLAYER_NETWORK is the source of truth for network selection
const NETWORK = process.env.NEXUSAGENT_XLAYER_NETWORK?.trim() || 'testnet'
const IS_MAINNET = NETWORK === 'mainnet'
const PRIVATE_KEY = IS_MAINNET
  ? (process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY?.trim() || '')
  : (process.env.NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY?.trim() || '')
const RPC_URL = process.env.NEXUSAGENT_XLAYER_RPC_URL?.trim()
  || (IS_MAINNET ? 'https://rpc.xlayer.tech' : 'https://testrpc.xlayer.tech/terigon')

// Minimal ABIs — only the functions we call
const REGISTRY_ABI = [
  'function registerAgent(bytes32 agentId, address wallet, string role, string agentURI) external',
  'function getAgent(bytes32 agentId) external view returns (tuple(address wallet, string agentURI, string role, bool active, uint256 registeredAt))',
  'function isActiveAgent(bytes32 agentId) external view returns (bool)',
  'function totalAgents() external view returns (uint256)',
  'event AgentRegistered(bytes32 indexed agentId, address wallet, string role, string agentURI)',
]

const ESCROW_ABI = [
  'function createJob(bytes32 jobId, address agent, address token, uint256 amount, string intentHash) external',
  'function fundJob(bytes32 jobId) external',
  'function submitJob(bytes32 jobId) external',
  'function completeJob(bytes32 jobId) external',
  'function getJob(bytes32 jobId) external view returns (tuple(bytes32 jobId, address client, address agent, address token, uint256 amount, uint8 status, string intentHash, uint256 createdAt, uint256 completedAt))',
  'function totalJobs() external view returns (uint256)',
  'event JobCreated(bytes32 indexed jobId, address client, address agent, address token, uint256 amount)',
  'event JobCompleted(bytes32 indexed jobId, uint256 paidAmount)',
]

export function isContractIntegrationEnabled(): boolean {
  return !!(REGISTRY_ADDRESS && ESCROW_ADDRESS && PRIVATE_KEY)
}

function getSigner() {
  const provider = new JsonRpcProvider(RPC_URL, undefined, { staticNetwork: true })
  return new Wallet(PRIVATE_KEY, provider)
}

function getRegistry(signer: Wallet) {
  return new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer)
}

function getEscrow(signer: Wallet) {
  return new Contract(ESCROW_ADDRESS, ESCROW_ABI, signer)
}

// --- ERC-8004 Agent Registry ---

export async function registerAgentOnChain(
  agentId: string,
  name: string,
  role: string,
  description: string,
): Promise<{ txHash: string; agentIdHash: string } | null> {
  if (!isContractIntegrationEnabled()) return null

  try {
    const signer = getSigner()
    const registry = getRegistry(signer)
    const agentIdHash = keccak256Id(agentId)

    // Check if already registered
    try {
      const existing = await registry.getAgent(agentIdHash)
      if (existing.registeredAt > 0n) {
        console.log(`[ERC-8004] Agent ${agentId} already registered on-chain`)
        return { txHash: '', agentIdHash }
      }
    } catch {
      // Not found — proceed with registration
    }

    const metadata = {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name,
      description,
      services: [{ type: 'a2a', endpoint: '/.well-known/agent.json' }],
    }
    const agentURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`

    const tx = await registry.registerAgent(agentIdHash, signer.address, role, agentURI)
    const receipt = await tx.wait()
    const txHash = receipt?.hash || tx.hash
    console.log(`[ERC-8004] Registered ${name} (${role}): ${txHash}`)
    return { txHash, agentIdHash }
  } catch (error) {
    console.warn(`[ERC-8004] registerAgent failed: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

// --- ERC-8183 Agent Escrow ---

export interface EscrowJobResult {
  jobId: string
  createTxHash: string
  fundTxHash: string
  submitTxHash: string
  completeTxHash: string
}

export async function runEscrowJobLifecycle(params: {
  intentHash: string
  tokenAddress: string
  amount: bigint
}): Promise<EscrowJobResult | null> {
  if (!isContractIntegrationEnabled()) return null

  try {
    const signer = getSigner()
    const escrow = getEscrow(signer)
    const jobId = keccak256(toUtf8Bytes(`job_${Date.now()}_${Math.random().toString(36).slice(2)}`))

    // createJob — single-signer demo ownership mode: client and agent are both deployer
    console.log(`[ERC-8183] Creating escrow job...`)
    const createTx = await escrow.createJob(
      jobId,
      signer.address,  // agent = deployer in single-signer demo ownership mode
      params.tokenAddress,
      params.amount,
      params.intentHash,
    )
    const createReceipt = await createTx.wait()

    // fundJob — requires ERC-20 approval first
    // In single-signer demo ownership mode, we skip funding if token balance is insufficient
    // The contract will revert on fundJob if no approval exists
    let fundTxHash = ''
    try {
      // Approve escrow to spend tokens
      const tokenContract = new Contract(
        params.tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer,
      )
      const approveTx = await tokenContract.approve(ESCROW_ADDRESS, params.amount)
      await approveTx.wait()

      const fundTx = await escrow.fundJob(jobId)
      const fundReceipt = await fundTx.wait()
      fundTxHash = fundReceipt?.hash || fundTx.hash
      console.log(`[ERC-8183] Job funded: ${fundTxHash}`)
    } catch (error) {
      console.warn(`[ERC-8183] fundJob skipped (likely insufficient balance): ${error instanceof Error ? error.message : error}`)
    }

    // submitJob — agent submits deliverable
    let submitTxHash = ''
    try {
      const submitTx = await escrow.submitJob(jobId)
      const submitReceipt = await submitTx.wait()
      submitTxHash = submitReceipt?.hash || submitTx.hash
      console.log(`[ERC-8183] Job submitted: ${submitTxHash}`)
    } catch (error) {
      console.warn(`[ERC-8183] submitJob skipped: ${error instanceof Error ? error.message : error}`)
    }

    // completeJob — owner completes
    let completeTxHash = ''
    try {
      const completeTx = await escrow.completeJob(jobId)
      const completeReceipt = await completeTx.wait()
      completeTxHash = completeReceipt?.hash || completeTx.hash
      console.log(`[ERC-8183] Job completed: ${completeTxHash}`)
    } catch (error) {
      console.warn(`[ERC-8183] completeJob skipped: ${error instanceof Error ? error.message : error}`)
    }

    return {
      jobId,
      createTxHash: createReceipt?.hash || createTx.hash,
      fundTxHash,
      submitTxHash,
      completeTxHash,
    }
  } catch (error) {
    console.warn(`[ERC-8183] Escrow lifecycle failed: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

export async function submitReputationNote(agentId: string, note: string): Promise<void> {
  if (!isContractIntegrationEnabled()) return
  console.log(`[ERC-8004] Reputation note for ${agentId}: ${note}`)
}
