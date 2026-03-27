import { createHash, randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  type AlphaAgentRecord,
  type AlphaWorkflowRunRecord,
  type AlphaWorkflowStepRecord,
  type ProofArtifact,
  type UsageLedgerEntry,
  alphaAgentRecordSchema,
  alphaWorkflowDetailSchema,
  alphaWorkflowEvaluationSchema,
  paymentRecordSchema,
  settlementRecordSchema,
  usageLedgerEntrySchema,
  proofArtifactSchema,
  type Workspace,
  workspaceAccessSchema,
  workspaceSchema,
} from '../contracts.js'

type WorkspaceRecord = Workspace & {
  accessKeyHash: string
  accessKeyHint: string
}

type AlphaStoreState = {
  workspaces: WorkspaceRecord[]
  agents: AlphaAgentRecord[]
  workflows: Array<{
    workflowRun: AlphaWorkflowRunRecord
    workflowSteps: AlphaWorkflowStepRecord[]
    payment: {
      mode: 'x402_live' | 'x402_compatible_demo' | 'escrow_demo' | 'transfer_event'
      status: 'pending' | 'recorded' | 'completed' | 'failed'
      amount: string
      currency: string
      source: string
      destination: string
      reference: string
    }
    settlement: {
      chain: string
      status: 'pending' | 'confirmed' | 'failed'
      txHash: string
      explorerUrl: string
      proofSummary: string
    }
    evaluation: {
      agentName: string
      status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped'
      summary: string
      output: Record<string, unknown>
    } | null
    proofArtifact: ProofArtifact | null
    usageEntries: UsageLedgerEntry[]
  }>
}

const alphaStoredWorkflowSchema = {
  parse(
    input: unknown,
  ): AlphaStoreState['workflows'][number] {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Stored workflow payload must be an object.')
    }

    const candidate = input as {
      workflowRun?: unknown
      workflowSteps?: unknown
      payment?: unknown
      settlement?: unknown
      evaluation?: unknown
      proofArtifact?: unknown
      usageEntries?: unknown
    }

    const detail = alphaWorkflowDetailSchema.parse({
      workflowRun: candidate.workflowRun,
      workflowSteps: candidate.workflowSteps,
      payment: candidate.payment,
      settlement: candidate.settlement,
      evaluation: candidate.evaluation,
      proofArtifact: candidate.proofArtifact,
    })

    return {
      ...detail,
      usageEntries: Array.isArray(candidate.usageEntries)
        ? candidate.usageEntries.map((entry) => usageLedgerEntrySchema.parse(entry))
        : [],
    }
  },
}

const alphaStoreSchema = {
  parse(input: unknown): AlphaStoreState {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Alpha store payload must be an object.')
    }

    const candidate = input as { workspaces?: unknown; agents?: unknown; workflows?: unknown }
    return {
      workspaces: Array.isArray(candidate.workspaces)
        ? candidate.workspaces.map((workspace) => parseWorkspaceRecord(workspace))
        : [],
      agents: Array.isArray(candidate.agents)
        ? candidate.agents.map((agent) => alphaAgentRecordSchema.parse(agent))
        : [],
      workflows: Array.isArray(candidate.workflows)
        ? candidate.workflows.map((workflow) => alphaStoredWorkflowSchema.parse(workflow))
        : [],
    }
  },
}

const alphaDir = path.resolve(process.cwd(), 'data', 'alpha')
const alphaStoreFile = path.join(alphaDir, 'store.json')

function parseWorkspaceRecord(input: unknown): WorkspaceRecord {
  const workspace = workspaceSchema.parse(input)
  const candidate = input as {
    accessKeyHash?: unknown
    accessKeyHint?: unknown
  }

  return {
    ...workspace,
    accessKeyHash:
      typeof candidate.accessKeyHash === 'string' ? candidate.accessKeyHash : '',
    accessKeyHint:
      typeof candidate.accessKeyHint === 'string' && candidate.accessKeyHint.trim().length > 0
        ? candidate.accessKeyHint
        : 'legacy',
  }
}

function nowIso() {
  return new Date().toISOString()
}

function uniqueId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function createWorkspaceAccessKey() {
  return `nxa_ws_${randomBytes(18).toString('hex')}`
}

function hashWorkspaceAccessKey(accessKey: string) {
  return createHash('sha256').update(accessKey).digest('hex')
}

function keyHintFor(accessKey: string) {
  const trimmed = accessKey.trim()
  return trimmed.length <= 8 ? trimmed : `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`
}

function toPublicWorkspace(workspace: WorkspaceRecord): Workspace {
  return workspaceSchema.parse({
    workspaceId: workspace.workspaceId,
    name: workspace.name,
    slug: workspace.slug,
    status: workspace.status,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    createdBy: workspace.createdBy,
  })
}

async function ensureAlphaStoreFile() {
  await mkdir(alphaDir, { recursive: true })

  try {
    await readFile(alphaStoreFile, 'utf8')
  } catch {
    const initialState: AlphaStoreState = {
      workspaces: [],
      agents: [],
      workflows: [],
    }
    await writeFile(alphaStoreFile, JSON.stringify(initialState, null, 2))
  }
}

async function readState() {
  await ensureAlphaStoreFile()
  const raw = await readFile(alphaStoreFile, 'utf8')
  return alphaStoreSchema.parse(JSON.parse(raw))
}

async function writeState(state: AlphaStoreState) {
  await ensureAlphaStoreFile()
  await writeFile(alphaStoreFile, JSON.stringify(state, null, 2))
}

export async function listWorkspaces() {
  const state = await readState()
  return state.workspaces.map(toPublicWorkspace)
}

export async function createWorkspace(input: { name: string; slug: string; createdBy?: string }) {
  const state = await readState()

  if (state.workspaces.some((workspace) => workspace.slug === input.slug)) {
    throw new Error(`Workspace slug ${input.slug} already exists.`)
  }

  const timestamp = nowIso()
  const accessKey = createWorkspaceAccessKey()
  const workspace: WorkspaceRecord = {
    ...workspaceSchema.parse({
      workspaceId: uniqueId('ws'),
      name: input.name,
      slug: input.slug,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: input.createdBy ?? 'workspace_owner',
    }),
    accessKeyHash: hashWorkspaceAccessKey(accessKey),
    accessKeyHint: keyHintFor(accessKey),
  }

  state.workspaces.push(workspace)
  await writeState(state)
  return {
    workspace: toPublicWorkspace(workspace),
    workspaceAccess: workspaceAccessSchema.parse({
      authScheme: 'workspace_key',
      accessKey,
      keyHint: workspace.accessKeyHint,
      issuedAt: timestamp,
    }),
  }
}

export async function getWorkspaceRecord(workspaceId: string) {
  const state = await readState()
  return state.workspaces.find((workspace) => workspace.workspaceId === workspaceId) ?? null
}

export async function getWorkspace(workspaceId: string) {
  const workspace = await getWorkspaceRecord(workspaceId)
  return workspace ? toPublicWorkspace(workspace) : null
}

export async function authorizeWorkspaceAccess(workspaceId: string, accessKey: string) {
  const workspace = await getWorkspaceRecord(workspaceId)

  if (!workspace) {
    return {
      authorized: false as const,
      reason: 'workspace_not_found' as const,
      workspace: null,
    }
  }

  if (!workspace.accessKeyHash) {
    return {
      authorized: false as const,
      reason: 'workspace_access_not_bootstrapped' as const,
      workspace: toPublicWorkspace(workspace),
    }
  }

  if (!accessKey.trim()) {
    return {
      authorized: false as const,
      reason: 'missing_access_key' as const,
      workspace: toPublicWorkspace(workspace),
    }
  }

  if (hashWorkspaceAccessKey(accessKey) !== workspace.accessKeyHash) {
    return {
      authorized: false as const,
      reason: 'invalid_access_key' as const,
      workspace: toPublicWorkspace(workspace),
    }
  }

  return {
    authorized: true as const,
    reason: 'authorized' as const,
    workspace: toPublicWorkspace(workspace),
  }
}

export async function listWorkspaceAgents(workspaceId: string) {
  const state = await readState()
  return state.agents.filter((agent) => agent.workspaceId === workspaceId)
}

export async function registerAgentForWorkspace(
  workspaceId: string,
  input: Omit<
    AlphaAgentRecord,
    'workspaceId' | 'activationState' | 'walletVerificationState' | 'createdAt' | 'updatedAt'
  >,
) {
  const state = await readState()
  const workspace = state.workspaces.find((candidate) => candidate.workspaceId === workspaceId)

  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} does not exist.`)
  }

  if (state.agents.some((agent) => agent.workspaceId === workspaceId && agent.agentId === input.agentId)) {
    throw new Error(`Agent ${input.agentId} already exists in workspace ${workspaceId}.`)
  }

  const timestamp = nowIso()
  const agent = alphaAgentRecordSchema.parse({
    workspaceId,
    ...input,
    activationState: 'draft',
    walletVerificationState: 'unverified',
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  state.agents.push(agent)
  await writeState(state)

  // ERC-8004: register agent on-chain (best-effort)
  try {
    const { registerAgentOnChain } = await import('../integrations/contracts.js')
    const onChainResult = await registerAgentOnChain(agent.agentId, agent.name, agent.role, agent.description)
    if (onChainResult?.txHash) {
      console.log(`[Alpha] Agent ${agent.agentId} registered on-chain: ${onChainResult.txHash}`)
    }
  } catch (error) {
    console.warn(`[Alpha] On-chain agent registration skipped: ${error instanceof Error ? error.message : error}`)
  }

  return agent
}

export async function verifyAgentWalletForWorkspace(workspaceId: string, agentId: string) {
  const state = await readState()
  const agentIndex = state.agents.findIndex(
    (agent) => agent.workspaceId === workspaceId && agent.agentId === agentId,
  )

  if (agentIndex === -1) {
    throw new Error(`Agent ${agentId} does not exist in workspace ${workspaceId}.`)
  }

  // Wallet reachability check via Onchain OS (best-effort)
  try {
    const { checkWalletReady } = await import('../integrations/okxWallet.js')
    const walletCheck = await checkWalletReady(state.agents[agentIndex].walletReference)
    console.log(`[Alpha] Wallet check for ${agentId}: ${walletCheck.note}`)
  } catch {
    console.log(`[Alpha] Wallet check skipped for ${agentId}`)
  }

  const updatedAgent = alphaAgentRecordSchema.parse({
    ...state.agents[agentIndex],
    walletVerificationState: 'verified',
    activationState: 'active',
    updatedAt: nowIso(),
  })

  state.agents[agentIndex] = updatedAgent
  await writeState(state)
  return updatedAgent
}

export async function createWorkflowRecord(
  workflow: AlphaStoreState['workflows'][number],
) {
  const state = await readState()
  state.workflows.push(alphaStoredWorkflowSchema.parse(workflow))
  await writeState(state)
  return workflow
}

export async function listWorkflowRecords(workspaceId: string) {
  const state = await readState()
  return state.workflows
    .filter((workflow) => workflow.workflowRun.workspaceId === workspaceId)
    .map((workflow) => workflow.workflowRun)
}

export async function getWorkflowRecord(workspaceId: string, workflowRunId: string) {
  const state = await readState()
  return (
    state.workflows.find(
      (workflow) =>
        workflow.workflowRun.workspaceId === workspaceId &&
        workflow.workflowRun.workflowRunId === workflowRunId,
    ) ?? null
  )
}

export async function listUsageEntries(workspaceId: string) {
  const state = await readState()
  return state.workflows
    .filter((workflow) => workflow.workflowRun.workspaceId === workspaceId)
    .flatMap((workflow) => workflow.usageEntries)
}
