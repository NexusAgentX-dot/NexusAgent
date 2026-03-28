import cors from 'cors'
import express from 'express'
import type { Request, Response } from 'express'
import {
  alphaAgentRegistrationRequestSchema,
  alphaAgentRegistrationResponseSchema,
  alphaProofResponseSchema,
  alphaAgentsResponseSchema,
  alphaWorkflowDetailResponseSchema,
  agentsResponseSchema,
  createWorkspaceRequestSchema,
  createWorkspaceResponseSchema,
  createAlphaWorkflowRequestSchema,
  createIntentRequestSchema,
  healthResponseSchema,
  listWorkspacesResponseSchema,
  listAlphaWorkflowRunsResponseSchema,
  onboardingTemplateSchema,
  proofResponseSchema,
  registerAgentRequestSchema,
  registerAgentResponseSchema,
  usageLedgerResponseSchema,
  verifyWalletRequestSchema,
  verifyWalletResponseSchema,
  workflowResponseSchema,
  workspaceContextResponseSchema,
} from './contracts.js'
import { canonicalAgents, onboardingTemplate } from './demo/onboarding.js'
import { approvedWorkflowRun, buildWorkflowRun, rejectedWorkflowRun } from './demo/workflowData.js'
import {
  createWorkspace,
  authorizeWorkspaceAccess,
  getWorkspace,
  listWorkspaceAgents,
  listUsageEntries,
  listWorkflowRecords,
  listWorkspaces,
  registerAgentForWorkspace,
  verifyAgentWalletForWorkspace,
  getWorkflowRecord,
} from './domain/alphaStore.js'
import { createAlphaWorkflow } from './domain/alphaWorkflowService.js'
import { verifySettlementProof } from './lib/verifySettlementProof.js'

const app = express()

// Simple in-memory rate limiter
const rateBuckets = new Map<string, { count: number; resetAt: number }>()
function isRateLimited(key: string, maxPerMinute: number): boolean {
  const now = Date.now()
  const entry = rateBuckets.get(key)
  if (!entry || entry.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60000 })
    return false
  }
  entry.count++
  return entry.count > maxPerMinute
}

const allowedOrigins = process.env.NEXUSAGENT_ALLOWED_ORIGINS
  ? process.env.NEXUSAGENT_ALLOWED_ORIGINS.split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : null

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-NexusAgent-Workspace-Key', 'X-PAYMENT'],
    exposedHeaders: ['PAYMENT-REQUIRED'],
  }),
)
app.use(express.json())

function getWorkspaceAccessKey(req: Request) {
  const explicitHeader = req.header('X-NexusAgent-Workspace-Key')?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  const authorization = req.header('Authorization')?.trim()
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }

  return ''
}

async function requireWorkspaceAccess(req: Request, res: Response, workspaceId: string) {
  const authorization = await authorizeWorkspaceAccess(workspaceId, getWorkspaceAccessKey(req))
  if (authorization.authorized) {
    return authorization.workspace
  }

  const hints: Record<string, string> = {
    workspace_not_found: 'Create or connect a workspace before using workspace-scoped endpoints.',
    workspace_access_not_bootstrapped:
      'This workspace was created before access keys were introduced. Create a new workspace for private alpha access.',
    missing_access_key:
      'Provide X-NexusAgent-Workspace-Key or Authorization: Bearer <workspace key>.',
    invalid_access_key: 'Use the workspace key that was issued when the workspace was created or connected.',
  }

  res.status(authorization.reason === 'workspace_not_found' ? 404 : 401).json({
    error: {
      code:
        authorization.reason === 'workspace_not_found'
          ? 'WORKSPACE_NOT_FOUND'
          : 'WORKSPACE_ACCESS_DENIED',
      message:
        authorization.reason === 'workspace_not_found'
          ? `No workspace found for id ${workspaceId}`
          : `Workspace access was rejected for id ${workspaceId}`,
      hint: hints[authorization.reason],
    },
  })

  return null
}

app.get('/api/health', (_req, res) => {
  const registryAddr = process.env.NEXUSAGENT_AGENT_REGISTRY_ADDRESS || ''
  const escrowAddr = process.env.NEXUSAGENT_AGENT_ESCROW_ADDRESS || ''
  res.json({
    status: 'ok',
    service: 'nexusagent-backend',
    version: '0.1.0',
    integrations: {
      okxOnchainOS: isOKXConfigured(),
      x402: true,
      erc8004: registryAddr || null,
      erc8183: escrowAddr || null,
      xlayer: !!(process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY || process.env.NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY),
      mcpServer: true,
    },
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/workflow/demo', (req, res) => {
  const mode = req.query.mode === 'rejected' ? 'rejected' : 'approved'
  const payload = workflowResponseSchema.parse({
    workflowRun: buildWorkflowRun(mode),
  })
  res.json(payload)
})

app.get('/api/workflow/:id', (req, res) => {
  const { id } = req.params
  const workflowRun =
    id === approvedWorkflowRun.id
      ? approvedWorkflowRun
      : id === rejectedWorkflowRun.id
        ? rejectedWorkflowRun
        : null

  if (!workflowRun) {
    res.status(404).json({
      error: {
        code: 'WORKFLOW_NOT_FOUND',
        message: `No workflow found for id ${id}`,
        hint: 'Use run_demo_001 or run_demo_rejected_001 in demo mode.',
      },
    })
    return
  }

  res.json(workflowResponseSchema.parse({ workflowRun }))
})

app.post('/api/intent', (req, res) => {
  const parsed = createIntentRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_INTENT_REQUEST',
        message: 'Intent payload did not match the expected shape.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  const mode = parsed.data.mode ?? 'approved'
  const payload = workflowResponseSchema.parse({
    workflowRun: buildWorkflowRun(mode, parsed.data.intent),
  })
  res.json(payload)
})

app.get('/api/agents', (_req, res) => {
  res.json(
    agentsResponseSchema.parse({
      agents: canonicalAgents,
    }),
  )
})

app.get('/api/onboarding/template', (_req, res) => {
  res.json(onboardingTemplateSchema.parse(onboardingTemplate))
})

app.post('/api/onboarding/register', (req, res) => {
  const parsed = registerAgentRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_AGENT_REGISTRATION',
        message: 'Registration payload did not match the onboarding contract.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  const payload = registerAgentResponseSchema.parse({
    agent: {
      ...parsed.data,
      status: 'active',
    },
    registrationStatus: 'registered_demo',
  })

  res.status(201).json(payload)
})

app.get('/api/workspaces', async (_req, res) => {
  if (!process.env.NEXUSAGENT_ALLOW_PUBLIC_WORKSPACE_LIST) {
    res.status(403).json({
      error: {
        code: 'WORKSPACE_LIST_DISABLED',
        message: 'Workspace listing is disabled in this release.',
        hint: 'Create a workspace or reconnect one with its workspace key.',
      },
    })
    return
  }

  const workspaces = await listWorkspaces()
  res.json(listWorkspacesResponseSchema.parse({ workspaces }))
})

app.post('/api/workspaces', async (req, res) => {
  const parsed = createWorkspaceRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_WORKSPACE_REQUEST',
        message: 'Workspace payload did not match the expected shape.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  try {
    const payload = await createWorkspace(parsed.data)
    res.status(201).json(createWorkspaceResponseSchema.parse(payload))
  } catch (error) {
    res.status(409).json({
      error: {
        code: 'WORKSPACE_CONFLICT',
        message: error instanceof Error ? error.message : 'Workspace could not be created.',
        hint: 'Use a unique workspace slug.',
      },
    })
  }
})

app.get('/api/workspaces/:workspaceId/context', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  res.json(workspaceContextResponseSchema.parse({ workspace }))
})

app.get('/api/workspaces/:workspaceId/agents', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const agents = await listWorkspaceAgents(workspaceId)
  res.json(alphaAgentsResponseSchema.parse({ agents }))
})

app.post('/api/workspaces/:workspaceId/agents', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const parsed = alphaAgentRegistrationRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_ALPHA_AGENT_REGISTRATION',
        message: 'Alpha agent registration payload did not match the expected shape.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  try {
    const agent = await registerAgentForWorkspace(workspaceId, parsed.data)
    res.status(201).json(
      alphaAgentRegistrationResponseSchema.parse({
        agent,
        registrationStatus: 'registered_live',
      }),
    )
  } catch (error) {
    res.status(409).json({
      error: {
        code: 'AGENT_REGISTRATION_CONFLICT',
        message: error instanceof Error ? error.message : 'Agent could not be registered.',
        hint: 'Use a unique agentId within the workspace.',
      },
    })
  }
})

app.post('/api/workspaces/:workspaceId/agents/:agentId/verify-wallet', async (req, res) => {
  const { workspaceId, agentId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const parsed = verifyWalletRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_VERIFY_WALLET_REQUEST',
        message: 'Wallet verification payload did not match the expected shape.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  try {
    const agent = await verifyAgentWalletForWorkspace(workspaceId, agentId)
    res.json(
      verifyWalletResponseSchema.parse({
        agentId: agent.agentId,
        walletVerificationState: agent.walletVerificationState,
        activationState: agent.activationState,
      }),
    )
  } catch (error) {
    res.status(404).json({
      error: {
        code: 'AGENT_NOT_FOUND',
        message: error instanceof Error ? error.message : 'Agent could not be verified.',
        hint: 'Register the agent before verifying its wallet.',
      },
    })
  }
})

app.post('/api/workspaces/:workspaceId/workflows', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const parsed = createAlphaWorkflowRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: 'INVALID_ALPHA_WORKFLOW_REQUEST',
        message: 'Workflow payload did not match the expected alpha workflow shape.',
        hint: parsed.error.issues.map((issue) => issue.message).join('; '),
      },
    })
    return
  }

  try {
    const agents = await listWorkspaceAgents(workspaceId)
    const existingRuns = await listWorkflowRecords(workspaceId)
    const todayCutoff = new Date(Date.now() - 86400000).toISOString()
    const todayRunCount = existingRuns.filter((r) => r.requestedAt > todayCutoff).length

    const workflow = await createAlphaWorkflow({
      workspaceId,
      workflowTemplateId: parsed.data.workflowTemplateId,
      intent: parsed.data.intent,
      requestedAgentIds: parsed.data.requestedAgentIds,
      triggeredByMemberId: parsed.data.triggeredByMemberId,
      availableAgents: agents,
      existingRunCount: todayRunCount,
    })

    res.status(201).json(alphaWorkflowDetailResponseSchema.parse({ workflow }))
  } catch (error) {
    const statusCode = error instanceof Error && error.message.includes('quota') ? 429 : 409
    res.status(statusCode).json({
      error: {
        code: 'WORKFLOW_CREATE_REJECTED',
        message: error instanceof Error ? error.message : 'Workflow could not be created.',
        hint: 'Verify the workspace, requested agents, and wallet activation state.',
      },
    })
  }
})

app.get('/api/workspaces/:workspaceId/workflows', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const workflowRuns = await listWorkflowRecords(workspaceId)
  res.json(listAlphaWorkflowRunsResponseSchema.parse({ workflowRuns }))
})

app.get('/api/workspaces/:workspaceId/workflows/:workflowRunId', async (req, res) => {
  const { workspaceId, workflowRunId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const workflow = await getWorkflowRecord(workspaceId, workflowRunId)
  if (!workflow) {
    res.status(404).json({
      error: {
        code: 'ALPHA_WORKFLOW_NOT_FOUND',
        message: `No alpha workflow found for id ${workflowRunId}`,
        hint: 'List workflow runs for the workspace before requesting a specific record.',
      },
    })
    return
  }

  res.json(alphaWorkflowDetailResponseSchema.parse({ workflow }))
})

app.get('/api/workspaces/:workspaceId/workflows/:workflowRunId/proof', async (req, res) => {
  const { workspaceId, workflowRunId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const workflow = await getWorkflowRecord(workspaceId, workflowRunId)

  if (!workflow) {
    res.status(404).json({
      error: {
        code: 'ALPHA_PROOF_NOT_FOUND',
        message: `No proof payload found for alpha workflow id ${workflowRunId}`,
        hint: 'Create or inspect a workflow run before requesting proof.',
      },
    })
    return
  }

  res.json(
    alphaProofResponseSchema.parse({
      proofArtifact: workflow.proofArtifact,
      evaluation: workflow.evaluation,
    }),
  )
})

app.get('/api/workspaces/:workspaceId/usage', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)

  if (!workspace) {
    return
  }

  const entries = await listUsageEntries(workspaceId)
  res.json(usageLedgerResponseSchema.parse({ entries }))
})

app.get('/api/workspaces/:workspaceId/usage/summary', async (req, res) => {
  const { workspaceId } = req.params
  const workspace = await requireWorkspaceAccess(req, res, workspaceId)
  if (!workspace) return

  const entries = await listUsageEntries(workspaceId)
  const billable = entries.filter((e) => e.billable)

  const breakdown: Record<string, { count: number; amount: number }> = {}
  let totalAmount = 0
  for (const entry of billable) {
    const amt = parseFloat(entry.billableAmount || '0')
    totalAmount += amt
    const key = entry.unitType
    if (!breakdown[key]) breakdown[key] = { count: 0, amount: 0 }
    breakdown[key].count += entry.unitCount
    breakdown[key].amount += amt
  }

  res.json({
    totalRuns: entries.filter((e) => e.eventType === 'workflow_run_requested').length,
    totalBillableAmount: totalAmount.toFixed(2),
    billableCurrency: 'USDT',
    breakdown: Object.fromEntries(
      Object.entries(breakdown).map(([k, v]) => [k, { count: v.count, amount: v.amount.toFixed(2) }]),
    ),
  })
})

app.get('/api/proof/:id', async (req, res) => {
  const { id } = req.params

  // Support lookup by workflow ID or by tx hash
  let workflowRun =
    id === approvedWorkflowRun.id
      ? approvedWorkflowRun
      : id === rejectedWorkflowRun.id
        ? rejectedWorkflowRun
        : null

  // If not found by workflow ID, try matching by settlement txHash
  if (!workflowRun) {
    const demoRuns = [approvedWorkflowRun, rejectedWorkflowRun]
    workflowRun = demoRuns.find((r) => r.settlement.txHash === id) ?? null
  }

  // Also try direct txHash verification on X Layer (for SDK callers passing a txHash)
  if (!workflowRun && /^0x[0-9a-fA-F]{64}$/.test(id)) {
    try {
      const explorerUrl = `https://www.oklink.com/xlayer/tx/${id}`
      const verification = await verifySettlementProof(id, explorerUrl)
      if (verification.ok) {
        // Return shape matching SDK SettlementProof interface
        res.json({
          ok: verification.ok,
          network: verification.network,
          txHash: id,
          blockNumber: verification.blockNumber,
          receiptStatus: verification.receiptStatus,
          checkedAt: verification.checkedAt,
          note: verification.note,
        })
        return
      }
    } catch {
      // TX not found on-chain, continue to 404
    }
  }

  if (!workflowRun) {
    res.status(404).json({
      error: {
        code: 'PROOF_NOT_FOUND',
        message: `No proof found for id or txHash: ${id}`,
        hint: 'Pass a workflow ID or settlement txHash.',
      },
    })
    return
  }

  const evaluator = workflowRun.agents.find((agent) => agent.name === 'Evaluator')
  let evaluation = {
    agentName: evaluator?.name ?? 'Evaluator',
    status: evaluator?.status ?? 'skipped',
    summary: evaluator?.summary ?? 'No evaluation was performed.',
    output: evaluator?.output ?? {},
  }

  if (workflowRun.settlement.txHash && workflowRun.settlement.explorerUrl) {
    try {
      const verification = await verifySettlementProof(
        workflowRun.settlement.txHash,
        workflowRun.settlement.explorerUrl,
      )

      evaluation = {
        agentName: evaluator?.name ?? 'Evaluator',
        status: verification.ok ? 'completed' : 'failed',
        summary: verification.note,
        output: {
          ...(evaluator?.output ?? {}),
          receiptVerified: verification.ok,
          receiptStatus: verification.receiptStatus,
          verifiedBlockNumber: verification.blockNumber,
          verifiedAt: verification.checkedAt,
          verifiedNetwork: verification.network,
        },
      }
    } catch (error) {
      evaluation = {
        agentName: evaluator?.name ?? 'Evaluator',
        status: evaluator?.status ?? 'completed',
        summary:
          error instanceof Error
            ? `Live receipt verification failed, so cached evaluation was kept: ${error.message}`
            : 'Live receipt verification failed, so cached evaluation was kept.',
        output: {
          ...(evaluator?.output ?? {}),
          receiptVerified: false,
          verificationFallback: true,
        },
      }
    }
  }

  const payload = proofResponseSchema.parse({
    workflowId: workflowRun.id,
    settlement: workflowRun.settlement,
    payment: workflowRun.payment,
    evaluation,
  })

  res.json(payload)
})

// ---------------------------------------------------------------------------
// Onchain OS Integration Endpoints
// ---------------------------------------------------------------------------
import { fetchOKBMarketSignal } from './integrations/okxMarket.js'
import { fetchDexQuote } from './integrations/okxDex.js'
import { isOKXConfigured } from './integrations/okxOnchainOS.js'
import { buildPaymentRequirement, validateAndSettlePayment, buildPremiumSignal } from './integrations/x402.js'
import { checkWalletReady } from './integrations/okxWallet.js'
import { isContractIntegrationEnabled } from './integrations/contracts.js'

app.get('/api/signals/okb', async (_req, res) => {
  try {
    const signal = await fetchOKBMarketSignal()
    res.json({ signal })
  } catch (error) {
    res.status(502).json({
      error: {
        code: 'SIGNAL_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'OKB signal fetch failed.',
      },
    })
  }
})

app.get('/api/integrations/dex-quote', async (req, res) => {
  try {
    const quote = await fetchDexQuote({
      fromToken: (req.query.fromToken as string) || undefined,
      toToken: (req.query.toToken as string) || undefined,
      amount: (req.query.amount as string) || undefined,
    })
    res.json({ quote })
  } catch (error) {
    res.status(502).json({
      error: {
        code: 'DEX_QUOTE_FAILED',
        message: error instanceof Error ? error.message : 'DEX quote failed.',
      },
    })
  }
})

app.get('/api/integrations/status', (_req, res) => {
  res.json({
    onchainOS: {
      configured: isOKXConfigured(),
      services: ['market', 'dex', 'wallet'],
    },
    x402: {
      configured: true,
      premiumEndpoint: '/api/signals/premium-okb',
      paymentFlow: 'EIP-3009 → OKX facilitator verify → settle',
    },
    agenticWallet: {
      signInfoAvailable: isOKXConfigured(),
      teeProtected: true,
      supportedChains: ['196'],
    },
    erc8004: {
      address: process.env.NEXUSAGENT_AGENT_REGISTRY_ADDRESS || null,
      deployed: !!process.env.NEXUSAGENT_AGENT_REGISTRY_ADDRESS,
      integrated: true,
    },
    erc8183: {
      address: process.env.NEXUSAGENT_AGENT_ESCROW_ADDRESS || null,
      deployed: !!process.env.NEXUSAGENT_AGENT_ESCROW_ADDRESS,
      integrated: true,
      escrowLifecycleActive: true,
    },
    mcp: {
      available: true,
      tools: ['get_okb_signal', 'get_dex_quote', 'check_settlement_proof', 'check_wallet_status', 'get_integration_status'],
    },
    a2a: {
      agentCard: '/.well-known/agent.json',
    },
    contractIntegration: isContractIntegrationEnabled(),
    signalProvider: process.env.NEXUSAGENT_ALPHA_SIGNAL_PROVIDER || 'okx_market',
    executionMode: process.env.NEXUSAGENT_ALPHA_EXECUTION_MODE || 'disabled',
  })
})

app.get('/api/integrations/wallet-status', async (req, res) => {
  const address = req.query.address as string
  if (!address) {
    res.status(400).json({ error: { code: 'MISSING_ADDRESS', message: 'Provide ?address=0x...' } })
    return
  }
  try {
    const status = await checkWalletReady(address)
    res.json(status)
  } catch (error) {
    res.status(502).json({ error: { code: 'WALLET_CHECK_FAILED', message: error instanceof Error ? error.message : 'Failed' } })
  }
})

// ---------------------------------------------------------------------------
// x402 Premium Signal Endpoint
// ---------------------------------------------------------------------------

app.get('/api/signals/premium-okb', async (req, res) => {
  const clientIp = req.ip || 'unknown'
  if (isRateLimited(`x402:${clientIp}`, 10)) {
    res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10/min.' } })
    return
  }
  const paymentHeader = req.header('X-PAYMENT')?.trim()

  // No payment header → return HTTP 402 with payment requirements
  if (!paymentHeader) {
    const requirement = buildPaymentRequirement('/api/signals/premium-okb')
    const encoded = Buffer.from(JSON.stringify(requirement)).toString('base64')
    res.status(402).set('PAYMENT-REQUIRED', encoded).json({
      error: {
        code: 'PAYMENT_REQUIRED',
        message: 'This premium endpoint requires x402 payment.',
        paymentRequirements: requirement.paymentRequirements,
        hint: 'Include X-PAYMENT header with base64-encoded payment proof to access premium data.',
      },
    })
    return
  }

  // Validate + settle payment via OKX facilitator
  const validation = await validateAndSettlePayment(paymentHeader, '/api/signals/premium-okb')
  if (!validation.valid) {
    res.status(402).json({
      error: {
        code: 'PAYMENT_INVALID',
        message: validation.reason,
        hint: 'Base64-encode a JSON with EIP-3009 signature. Use createX402PaymentSignature() from @nexusagent/skills or x402Okx.ts.',
      },
    })
    return
  }

  // Payment verified (and possibly settled on-chain) → return premium signal
  try {
    const premium = await buildPremiumSignal(validation.txHash, validation.reason)
    res.json(premium)
  } catch (error) {
    res.status(502).json({
      error: {
        code: 'PREMIUM_SIGNAL_FAILED',
        message: error instanceof Error ? error.message : 'Premium signal generation failed.',
      },
    })
  }
})

// ---------------------------------------------------------------------------
// A2A Agent Card (/.well-known/agent.json)
// ---------------------------------------------------------------------------
app.get('/.well-known/agent.json', (req, res) => {
  res.json({
    name: 'NexusAgent',
    version: '0.1.0',
    description:
      'Multi-agent commerce framework on X Layer. Fetches OKB market signals via OKX Onchain OS, makes autonomous execution decisions, and settles bounded stablecoin transfers on-chain.',
    url: `${req.protocol}://${req.get('host') || 'localhost:8787'}`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['application/json'],
    protocolVersion: '0.3',
    skills: [
      {
        id: 'run_workflow',
        name: 'Run Workflow',
        description:
          'Execute a multi-agent commerce workflow with OKB signal, decision, execution, and settlement on X Layer.',
        tags: ['workflow', 'x-layer', 'stablecoin', 'onchain-os'],
      },
      {
        id: 'get_market_signal',
        name: 'OKB Market Signal',
        description: 'Get live OKB market signal from OKX Onchain OS Market API.',
        tags: ['market-signal', 'okb', 'onchain-os'],
      },
      {
        id: 'check_proof',
        name: 'Verify Settlement',
        description: 'Verify a settlement proof transaction on X Layer via RPC receipt.',
        tags: ['settlement', 'verification', 'x-layer'],
      },
    ],
    provider: {
      organization: 'NexusAgent',
      url: 'https://github.com/NexusAgentX-dot/NexusAgent',
    },
    protocols: ['A2A/0.3', 'x402', 'ERC-8004', 'ERC-8183'],
    integrations: {
      okxOnchainOS: {
        market: '/api/signals/okb',
        dex: '/api/integrations/dex-quote',
        status: '/api/integrations/status',
      },
    },
  })
})

const port = Number(process.env.PORT ?? 8787)

app.listen(port, () => {
  console.log(`NexusAgent backend listening on http://localhost:${port}`)
})
