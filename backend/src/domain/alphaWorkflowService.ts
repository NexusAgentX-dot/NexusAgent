import {
  type AlphaAgentRecord,
  type AlphaWorkflowRunRecord,
  type AlphaWorkflowStepRecord,
  type ProofArtifact,
  type UsageLedgerEntry,
} from '../contracts.js'
import { createWorkflowRecord } from './alphaStore.js'
import { fetchXLayerSignal } from '../lib/xlayerSignal.js'
import { fetchOKBMarketSignal, type OKBMarketSignal } from '../integrations/okxMarket.js'
import { executeBoundedTestnetTransfer } from '../live/executeBoundedTestnetTransfer.js'
import { verifySettlementProof } from '../lib/verifySettlementProof.js'
import { isContractIntegrationEnabled, runEscrowJobLifecycle } from '../integrations/contracts.js'

const REQUIRED_ALPHA_ROLES = [
  'signal_fetcher',
  'decision_engine',
  'execution_engine',
  'verification_engine',
] as const
const ALPHA_EXECUTION_MODE = process.env.NEXUSAGENT_ALPHA_EXECUTION_MODE?.trim() || 'disabled'
const SIGNAL_PROVIDER = process.env.NEXUSAGENT_ALPHA_SIGNAL_PROVIDER?.trim() || 'okx_market'
const MAX_RUNS_PER_DAY = parseInt(process.env.NEXUSAGENT_MAX_RUNS_PER_DAY || '50', 10)

const RUN_PRICING = {
  signal_check: { amount: '0.01', currency: 'USDT' },
  execution_run: { amount: '0.10', currency: 'USDT' },
  escrow_lifecycle: { amount: '0.05', currency: 'USDT' },
}

function nowIso() {
  return new Date().toISOString()
}

function uniqueId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function createAlphaWorkflow(input: {
  workspaceId: string
  workflowTemplateId: string
  intent: string
  requestedAgentIds?: string[]
  triggeredByMemberId: string
  availableAgents: AlphaAgentRecord[]
  existingRunCount?: number
}) {
  // Quota check
  if (input.existingRunCount !== undefined && input.existingRunCount >= MAX_RUNS_PER_DAY) {
    throw new Error(`Workspace daily quota reached (${MAX_RUNS_PER_DAY} runs/day).`)
  }

  const requestedAgentIds = input.requestedAgentIds?.length
    ? input.requestedAgentIds
    : REQUIRED_ALPHA_ROLES.map((role) => {
        const agent = input.availableAgents.find(
          (candidate) =>
            candidate.role === role &&
            candidate.activationState === 'active' &&
            candidate.walletVerificationState === 'verified',
        )
        return agent?.agentId
      }).filter(Boolean) as string[]

  const requestedAgents = requestedAgentIds
    .map((agentId) => input.availableAgents.find((agent) => agent.agentId === agentId))
    .filter(Boolean) as AlphaAgentRecord[]

  if (requestedAgents.length !== requestedAgentIds.length) {
    throw new Error('One or more requested agents were not found in the workspace.')
  }

  if (requestedAgents.some((agent) => agent.activationState !== 'active')) {
    throw new Error('All requested agents must be active before a workflow can be created.')
  }

  if (requestedAgents.some((agent) => agent.walletVerificationState !== 'verified')) {
    throw new Error('All requested agents must have verified wallets before a workflow can be created.')
  }

  const requestedAt = nowIso()
  const workflowRunId = uniqueId('wf')
  const paymentEventId = uniqueId('pay')
  const normalizedIntent = input.intent
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  const sentinel = requestedAgents.find((agent) => agent.role === 'signal_fetcher')
  const arbiter = requestedAgents.find((agent) => agent.role === 'decision_engine')
  const executor = requestedAgents.find((agent) => agent.role === 'execution_engine')
  const evaluator = requestedAgents.find((agent) => agent.role === 'verification_engine')

  if (!sentinel || !arbiter || !executor || !evaluator) {
    throw new Error('The alpha workflow requires one active Sentinel, Arbiter, Executor, and Evaluator.')
  }

  const signalStartedAt = nowIso()

  let okbSignal: OKBMarketSignal | null = null
  let legacySignal: { provider: string; gasPriceWei: string; thresholdWei: string; approved: boolean; signalSummary: string; capturedAt: string } | null = null
  let signalProvider: string
  let signalApproved: boolean
  let signalSummary: string
  let signalCapturedAt: string
  let signalInputSummary: string
  let decisionInputSummary: string

  try {
    if (SIGNAL_PROVIDER === 'xlayer_rpc') {
      const sig = await fetchXLayerSignal()
      legacySignal = sig
      signalProvider = sig.provider
      signalApproved = sig.approved
      signalSummary = sig.signalSummary
      signalCapturedAt = sig.capturedAt
      signalInputSummary = 'Fetch live X Layer network signal.'
      decisionInputSummary = `Evaluate live gas price ${sig.gasPriceWei} against threshold ${sig.thresholdWei}.`
    } else {
      const sig = await fetchOKBMarketSignal()
      okbSignal = sig
      signalProvider = sig.provider
      signalApproved = sig.approved
      signalSummary = sig.signalSummary
      signalCapturedAt = sig.capturedAt
      signalInputSummary = 'Fetch live OKB market signal via OKX Onchain OS.'
      decisionInputSummary = `Evaluate OKB market signal: price=$${sig.price}, 24h change=${sig.change24h}%, rule="${sig.thresholdRule}".`
    }
  } catch (error) {
    const failedAt = nowIso()
    signalProvider = SIGNAL_PROVIDER === 'xlayer_rpc' ? 'xlayer_rpc' : 'okx_market'
    const workflowRun: AlphaWorkflowRunRecord = {
      workflowRunId,
      workspaceId: input.workspaceId,
      workflowTemplateId: input.workflowTemplateId,
      intent: input.intent,
      normalizedIntent,
      status: 'failed',
      triggeredByMemberId: input.triggeredByMemberId,
      requestedAt,
      startedAt: signalStartedAt,
      completedAt: failedAt,
      failureReason: error instanceof Error ? error.message : 'Signal fetch failed.',
      proofArtifactId: '',
      paymentEventId,
      signalProvider,
    }

    const workflowSteps: AlphaWorkflowStepRecord[] = [
      {
        workflowRunId,
        stepId: 'step_signal',
        agentId: sentinel.agentId,
        role: sentinel.role,
        status: 'failed',
        inputSummary: 'Fetch live OKB market signal via OKX Onchain OS.',
        outputSummary: '',
        startedAt: signalStartedAt,
        completedAt: failedAt,
        errorCode: 'SIGNAL_FETCH_FAILED',
        errorMessage: workflowRun.failureReason,
      },
      {
        workflowRunId,
        stepId: 'step_decision',
        agentId: arbiter.agentId,
        role: arbiter.role,
        status: 'skipped',
        inputSummary: '',
        outputSummary: '',
        startedAt: '',
        completedAt: '',
        errorCode: '',
        errorMessage: '',
      },
      {
        workflowRunId,
        stepId: 'step_execution',
        agentId: executor.agentId,
        role: executor.role,
        status: 'skipped',
        inputSummary: '',
        outputSummary: '',
        startedAt: '',
        completedAt: '',
        errorCode: '',
        errorMessage: '',
      },
      {
        workflowRunId,
        stepId: 'step_evaluation',
        agentId: evaluator.agentId,
        role: evaluator.role,
        status: 'skipped',
        inputSummary: '',
        outputSummary: '',
        startedAt: '',
        completedAt: '',
        errorCode: '',
        errorMessage: '',
      },
    ]

    const usageEntries: UsageLedgerEntry[] = [
      {
        usageEntryId: uniqueId('usage'),
        workspaceId: input.workspaceId,
        workflowRunId,
        eventType: 'workflow_run_requested',
        billable: false,
        unitCount: 1,
        unitType: 'run',
        paymentEventId,
        proofArtifactId: '',
        recordedAt: requestedAt,
      },
      {
        usageEntryId: uniqueId('usage'),
        workspaceId: input.workspaceId,
        workflowRunId,
        eventType: 'signal_fetch_failed',
        billable: false,
        unitCount: 1,
        unitType: 'attempt',
        paymentEventId,
        proofArtifactId: '',
        recordedAt: failedAt,
      },
    ]

    const workflow = {
      workflowRun,
      workflowSteps,
      payment: {
        mode: 'x402_compatible_demo' as const,
        status: 'failed' as const,
        amount: '0.000',
        currency: 'USDT',
        source: 'workspace_orchestrator',
        destination: 'sentinel_signal_service',
        reference: paymentEventId,
      },
      settlement: {
        chain: 'X Layer',
        status: 'failed' as const,
        txHash: '',
        explorerUrl: '',
        proofSummary: 'No settlement artifact was produced because the live signal fetch failed.',
      },
      evaluation: null,
      proofArtifact: null,
      usageEntries,
    }

    await createWorkflowRecord(workflow)
    return workflow
  }

  const signalCompletedAt = signalCapturedAt
  const decisionStartedAt = signalCompletedAt
  const decisionCompletedAt = nowIso()
  const approved = signalApproved
  const completedAt = decisionCompletedAt

  const workflowRun: AlphaWorkflowRunRecord = {
    workflowRunId,
    workspaceId: input.workspaceId,
    workflowTemplateId: input.workflowTemplateId,
    intent: input.intent,
    normalizedIntent,
    status: approved ? 'approved' : 'rejected',
    triggeredByMemberId: input.triggeredByMemberId,
    requestedAt,
    startedAt: signalStartedAt,
    completedAt,
    failureReason: '',
    proofArtifactId: '',
    paymentEventId,
    signalProvider,
  }

  const workflowSteps: AlphaWorkflowStepRecord[] = [
    {
      workflowRunId,
      stepId: 'step_signal',
      agentId: sentinel.agentId,
      role: sentinel.role,
      status: 'completed',
      inputSummary: signalInputSummary,
      outputSummary: signalSummary,
      startedAt: signalStartedAt,
      completedAt: signalCompletedAt,
      errorCode: '',
      errorMessage: '',
    },
    {
      workflowRunId,
      stepId: 'step_decision',
      agentId: arbiter.agentId,
      role: arbiter.role,
      status: 'completed',
      inputSummary: decisionInputSummary,
      outputSummary: approved
        ? 'Approved bounded execution path.'
        : 'Rejected execution path because live threshold was not met.',
      startedAt: decisionStartedAt,
      completedAt: decisionCompletedAt,
      errorCode: '',
      errorMessage: '',
    },
    {
      workflowRunId,
      stepId: 'step_execution',
      agentId: executor.agentId,
      role: executor.role,
      status: approved ? 'pending' : 'skipped',
      inputSummary: approved
        ? 'Bounded execution is permitted once an execution wallet is configured.'
        : '',
      outputSummary: approved
        ? 'Execution is awaiting configured wallet and settlement path.'
        : '',
      startedAt: '',
      completedAt: '',
      errorCode: '',
      errorMessage: '',
    },
    {
      workflowRunId,
      stepId: 'step_evaluation',
      agentId: evaluator.agentId,
      role: evaluator.role,
      status: approved ? 'pending' : 'skipped',
      inputSummary: approved ? 'Evaluation will occur after a settlement artifact exists.' : '',
      outputSummary: '',
      startedAt: '',
      completedAt: '',
      errorCode: '',
      errorMessage: '',
    },
  ]

  const usageEntries: UsageLedgerEntry[] = [
    {
      usageEntryId: uniqueId('usage'),
      workspaceId: input.workspaceId,
      workflowRunId,
      eventType: 'workflow_run_requested',
      billable: false,
      unitCount: 1,
      unitType: 'run',
      paymentEventId,
      proofArtifactId: '',
      recordedAt: requestedAt,
    },
    {
      usageEntryId: uniqueId('usage'),
      workspaceId: input.workspaceId,
      workflowRunId,
      eventType: 'signal_checked',
      billable: true,
      unitCount: 1,
      unitType: 'signal_check',
      paymentEventId,
      proofArtifactId: '',
      billableAmount: RUN_PRICING.signal_check.amount,
      billableCurrency: RUN_PRICING.signal_check.currency,
      recordedAt: signalCompletedAt,
    },
  ]

  if (approved) {
    usageEntries.push({
      usageEntryId: uniqueId('usage'),
      workspaceId: input.workspaceId,
      workflowRunId,
      eventType: 'payment_event_recorded',
      billable: true,
      unitCount: 1,
      unitType: 'payment_event',
      paymentEventId,
      proofArtifactId: '',
      recordedAt: nowIso(),
    })
  }

  let payment: {
    mode: 'x402_live' | 'x402_compatible_demo' | 'escrow_demo' | 'transfer_event'
    status: 'pending' | 'recorded' | 'completed' | 'failed'
    amount: string
    currency: string
    source: string
    destination: string
    reference: string
  } = {
    mode: 'x402_compatible_demo' as const,
    status: approved ? ('recorded' as const) : ('pending' as const),
    amount: approved ? '0.001' : '0.000',
    currency: 'USDT',
    source: 'workspace_orchestrator',
    destination: 'sentinel_signal_service',
    reference: paymentEventId,
  }

  let settlement: {
    chain: string
    status: 'pending' | 'confirmed' | 'failed'
    txHash: string
    explorerUrl: string
    proofSummary: string
  } = {
    chain: 'X Layer',
    status: approved ? ('pending' as const) : ('pending' as const),
    txHash: '',
    explorerUrl: '',
    proofSummary: approved
      ? 'Execution has been approved, but no settlement artifact exists until a configured execution wallet submits the bounded action.'
      : 'No settlement artifact exists because the live signal did not pass the execution threshold.',
  }

  let evaluation: {
    agentName: string
    status: 'idle' | 'running' | 'completed' | 'failed' | 'skipped'
    summary: string
    output: Record<string, unknown>
  } = approved
    ? {
        agentName: evaluator.name,
        status: 'skipped' as const,
        summary: 'Evaluation is pending because no settlement artifact has been captured yet.',
        output: {
          result: 'pending',
        },
      }
    : {
        agentName: evaluator.name,
        status: 'skipped' as const,
        summary: 'Evaluation was skipped because the run was rejected before execution.',
        output: {
          result: 'skipped',
        },
      }

  let proofArtifact: ProofArtifact | null = null

  if (approved && ALPHA_EXECUTION_MODE === 'testnet_transfer') {
    const executionStartedAt = nowIso()

    try {
      const artifact = await executeBoundedTestnetTransfer({
        workflowId: workflowRunId,
        heroUseCase: input.intent,
        writeArtifacts: false,
      })
      const verification = await verifySettlementProof(artifact.txHash, artifact.explorerUrl)
      const evaluationCompletedAt = verification.checkedAt
      const proofArtifactId = uniqueId('proof')

      workflowRun.status = verification.ok ? 'settled' : 'failed'
      workflowRun.completedAt = evaluationCompletedAt
      workflowRun.failureReason = verification.ok ? '' : verification.note
      workflowRun.proofArtifactId = proofArtifactId

      workflowSteps[2] = {
        workflowRunId,
        stepId: 'step_execution',
        agentId: executor.agentId,
        role: executor.role,
        status: verification.ok ? 'completed' : 'failed',
        inputSummary: 'Bounded testnet execution was enabled for the alpha workflow.',
        outputSummary: verification.ok
          ? `Submitted bounded testnet transfer ${artifact.txHash}.`
          : `Execution submitted ${artifact.txHash}, but verification failed.`,
        startedAt: executionStartedAt,
        completedAt: artifact.capturedAt,
        errorCode: verification.ok ? '' : 'EXECUTION_VERIFICATION_FAILED',
        errorMessage: verification.ok ? '' : verification.note,
      }

      workflowSteps[3] = {
        workflowRunId,
        stepId: 'step_evaluation',
        agentId: evaluator.agentId,
        role: evaluator.role,
        status: verification.ok ? 'completed' : 'failed',
        inputSummary: `Verify settlement receipt for ${artifact.txHash}.`,
        outputSummary: verification.note,
        startedAt: artifact.capturedAt,
        completedAt: evaluationCompletedAt,
        errorCode: verification.ok ? '' : 'SETTLEMENT_RECEIPT_INVALID',
        errorMessage: verification.ok ? '' : verification.note,
      }

      settlement = {
        chain: 'X Layer',
        status: verification.ok ? 'confirmed' : 'failed',
        txHash: artifact.txHash,
        explorerUrl: artifact.explorerUrl,
        proofSummary: verification.ok
          ? `Alpha workflow produced a bounded live X Layer testnet settlement artifact for ${artifact.amount} ${artifact.token.symbol}.`
          : 'Execution produced a transfer hash, but the receipt could not be verified as successful.',
      }

      evaluation = {
        agentName: evaluator.name,
        status: verification.ok ? 'completed' : 'failed',
        summary: verification.note,
        output: {
          result: verification.ok ? 'pass' : 'fail',
          receiptVerified: verification.ok,
          txHash: artifact.txHash,
          verifiedBlockNumber: verification.blockNumber,
        },
      }

      proofArtifact = {
        proofArtifactId,
        workflowRunId,
        workspaceId: input.workspaceId,
        chain: 'X Layer',
        network: 'testnet',
        txHash: artifact.txHash,
        explorerUrl: artifact.explorerUrl,
        proofSummary: settlement.proofSummary,
        capturedAt: artifact.capturedAt,
      }

      usageEntries.push({
        usageEntryId: uniqueId('usage'),
        workspaceId: input.workspaceId,
        workflowRunId,
        eventType: 'settlement_artifact_recorded',
        billable: true,
        unitCount: 1,
        unitType: 'proof_artifact',
        paymentEventId,
        proofArtifactId,
        recordedAt: evaluationCompletedAt,
        billableAmount: RUN_PRICING.execution_run.amount,
        billableCurrency: RUN_PRICING.execution_run.currency,
      })

      // ERC-8183 Escrow lifecycle (best-effort enhancement)
      if (verification.ok && isContractIntegrationEnabled()) {
        try {
          const stablecoinAddress = process.env.NEXUSAGENT_XLAYER_STABLECOIN_ADDRESS?.trim() || ''
          const escrowResult = await runEscrowJobLifecycle({
            intentHash: normalizedIntent,
            tokenAddress: stablecoinAddress,
            amount: 100000n, // 0.1 USDT in 6 decimals
          })
          if (escrowResult) {
            if (escrowResult.fundTxHash) {
              payment.mode = 'transfer_event'
              payment.status = 'completed'
              payment.amount = '0.10'
            }
            const escrowTxHashes = [
              escrowResult.createTxHash,
              escrowResult.fundTxHash,
              escrowResult.submitTxHash,
              escrowResult.completeTxHash,
            ].filter(Boolean)
            if (escrowTxHashes.length > 0) {
              evaluation.output.escrowJobId = escrowResult.jobId
              evaluation.output.escrowTxHashes = escrowTxHashes
              settlement.proofSummary += ` ERC-8183 escrow job completed with ${escrowTxHashes.length} on-chain txs.`
              usageEntries.push({
                usageEntryId: uniqueId('usage'),
                workspaceId: input.workspaceId,
                workflowRunId,
                eventType: 'escrow_lifecycle_completed',
                billable: true,
                unitCount: escrowTxHashes.length,
                unitType: 'on_chain_tx',
                paymentEventId,
                proofArtifactId,
                recordedAt: nowIso(),
                billableAmount: RUN_PRICING.escrow_lifecycle.amount,
                billableCurrency: RUN_PRICING.escrow_lifecycle.currency,
              })
            }
          }
          // Reputation feedback (best-effort)
          try {
            const { submitReputationNote } = await import('../integrations/contracts.js')
            await submitReputationNote(executor.agentId, `Completed workflow ${workflowRunId}`)
            await submitReputationNote(evaluator.agentId, `Verified workflow ${workflowRunId}`)
          } catch {}
        } catch (escrowError) {
          console.warn(`[ERC-8183] Escrow enhancement skipped: ${escrowError instanceof Error ? escrowError.message : escrowError}`)
        }
      }
    } catch (error) {
      const failedAt = nowIso()
      const message =
        error instanceof Error ? error.message : 'Bounded alpha execution failed unexpectedly.'

      workflowRun.status = 'failed'
      workflowRun.completedAt = failedAt
      workflowRun.failureReason = message

      workflowSteps[2] = {
        workflowRunId,
        stepId: 'step_execution',
        agentId: executor.agentId,
        role: executor.role,
        status: 'failed',
        inputSummary: 'Bounded testnet execution was attempted for the alpha workflow.',
        outputSummary: '',
        startedAt: executionStartedAt,
        completedAt: failedAt,
        errorCode: 'ALPHA_EXECUTION_FAILED',
        errorMessage: message,
      }

      workflowSteps[3] = {
        workflowRunId,
        stepId: 'step_evaluation',
        agentId: evaluator.agentId,
        role: evaluator.role,
        status: 'skipped',
        inputSummary: 'Evaluation did not proceed because execution failed.',
        outputSummary: '',
        startedAt: '',
        completedAt: '',
        errorCode: '',
        errorMessage: '',
      }

      settlement = {
        chain: 'X Layer',
        status: 'failed',
        txHash: '',
        explorerUrl: '',
        proofSummary: 'The alpha workflow was approved but the configured bounded execution path failed before a settlement artifact was created.',
      }

      evaluation = {
        agentName: evaluator.name,
        status: 'skipped',
        summary: 'Evaluation was skipped because bounded execution failed before a proof artifact existed.',
        output: {
          result: 'skipped',
          reason: message,
        },
      }

      usageEntries.push({
        usageEntryId: uniqueId('usage'),
        workspaceId: input.workspaceId,
        workflowRunId,
        eventType: 'execution_failed',
        billable: false,
        unitCount: 1,
        unitType: 'attempt',
        paymentEventId,
        proofArtifactId: '',
        recordedAt: failedAt,
      })
    }
  }

  const workflow = {
    workflowRun,
    workflowSteps,
    payment,
    settlement,
    evaluation,
    proofArtifact,
    usageEntries,
  }

  await createWorkflowRecord(workflow)
  return workflow
}
