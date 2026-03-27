import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SettlementProof from '../components/dashboard/SettlementProof'
import { AGENT_META, demoApprovedRun, demoRejectedRun, HERO_USE_CASE, PIPELINE_STEPS } from '../data/demo'
import {
  createAlphaWorkflowRun,
  getAlphaUsage,
  getAlphaWorkflowDetail,
  getAlphaWorkflowRuns,
  getDemoWorkflow,
  getUsageSummary,
  getWorkspaceAgents,
  type UsageSummary,
} from '../lib/api'
import { listWorkspaceCredentials, updateWorkspaceCredentialSnapshot } from '../lib/workspaceVault'
import type {
  AlphaAgent,
  AlphaWorkflowDetail,
  AlphaWorkflowRunRecord,
  AgentRole,
  UsageLedgerEntry,
  WorkflowEvent,
  WorkflowRun,
  WorkspaceCredential,
} from '../types/workflow'

type DemoMode = 'approved' | 'rejected'

const STATUS_TO_STEP_INDEX: Record<string, number> = {
  IntentReceived: 0,
  SignalFetched: 1,
  DecisionMade: 2,
  ActionPrepared: 3,
  PaymentTriggered: 4,
  ActionExecuted: 5,
  ResultEvaluated: 6,
  Settled: 7,
}

const ALPHA_WORKFLOW_INTENT =
  'Check the OKB market signal and, if approved, execute a bounded stablecoin proof transfer on X Layer'

const REQUIRED_ALPHA_ROLES: AgentRole[] = [
  'signal_fetcher',
  'decision_engine',
  'execution_engine',
  'verification_engine',
]

const ROLE_LABELS: Record<AgentRole, string> = {
  signal_fetcher: 'Sentinel',
  decision_engine: 'Arbiter',
  execution_engine: 'Executor',
  verification_engine: 'Evaluator',
}

export default function Dashboard() {
  const [mode, setMode] = useState<DemoMode>('approved')
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [visibleEvents, setVisibleEvents] = useState<WorkflowEvent[]>([])
  const [run, setRun] = useState<WorkflowRun | null>(null)
  const [approvedRun, setApprovedRun] = useState<WorkflowRun>(demoApprovedRun)
  const [rejectedRun, setRejectedRun] = useState<WorkflowRun>(demoRejectedRun)

  const [workspaceCredentials, setWorkspaceCredentials] = useState<WorkspaceCredential[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [workspaceAgents, setWorkspaceAgents] = useState<AlphaAgent[]>([])
  const [alphaRuns, setAlphaRuns] = useState<AlphaWorkflowRunRecord[]>([])
  const [selectedAlphaRunId, setSelectedAlphaRunId] = useState('')
  const [selectedAlphaWorkflow, setSelectedAlphaWorkflow] = useState<AlphaWorkflowDetail | null>(null)
  const [usageEntries, setUsageEntries] = useState<UsageLedgerEntry[]>([])
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null)
  const [alphaStatusMessage, setAlphaStatusMessage] = useState('')
  const [alphaError, setAlphaError] = useState('')
  const [isAlphaBusy, setIsAlphaBusy] = useState(false)
  const workspaces = workspaceCredentials.map((credential) => credential.workspace)
  const selectedWorkspaceCredential =
    workspaceCredentials.find((credential) => credential.workspace.workspaceId === selectedWorkspaceId) ?? null

  const targetRun = mode === 'approved' ? approvedRun : rejectedRun
  const selectedWorkspace = selectedWorkspaceCredential?.workspace ?? null
  const activeWorkspaceAgents = workspaceAgents.filter(
    (agent) => agent.activationState === 'active' && agent.walletVerificationState === 'verified',
  )
  const activeAgentsByRole = REQUIRED_ALPHA_ROLES.reduce<Record<AgentRole, AlphaAgent | null>>(
    (accumulator, role) => {
      accumulator[role] = activeWorkspaceAgents.find((agent) => agent.role === role) ?? null
      return accumulator
    },
    {
      signal_fetcher: null,
      decision_engine: null,
      execution_engine: null,
      verification_engine: null,
    },
  )
  const missingAlphaRoles = REQUIRED_ALPHA_ROLES.filter((role) => !activeAgentsByRole[role])
  const alphaRunReady = missingAlphaRoles.length === 0
  const alphaTriggeredByMemberId =
    activeWorkspaceAgents[0]?.ownerMemberId ?? selectedWorkspace?.createdBy ?? 'workspace_owner'

  useEffect(() => {
    let cancelled = false

    async function loadWorkflow() {
      const workflow = await getDemoWorkflow(mode)
      if (cancelled) {
        return
      }

      if (mode === 'approved') {
        setApprovedRun(workflow)
      } else {
        setRejectedRun(workflow)
      }
    }

    void loadWorkflow()

    return () => {
      cancelled = true
    }
  }, [mode])

  useEffect(() => {
    let cancelled = false

    const nextWorkspaceCredentials = listWorkspaceCredentials()
    if (!cancelled) {
      setWorkspaceCredentials(nextWorkspaceCredentials)
      if (nextWorkspaceCredentials.length > 0) {
        setSelectedWorkspaceId((current) => current || nextWorkspaceCredentials[0].workspace.workspaceId)
      }
    }

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadAlphaWorkspaceData() {
      if (!selectedWorkspaceId || !selectedWorkspaceCredential) {
        setWorkspaceAgents([])
        setAlphaRuns([])
        setSelectedAlphaRunId('')
        setSelectedAlphaWorkflow(null)
        setUsageEntries([])
        return
      }

      try {
        updateWorkspaceCredentialSnapshot(selectedWorkspaceCredential.workspace)
        const [nextAgents, nextRuns, nextUsage] = await Promise.all([
          getWorkspaceAgents(selectedWorkspaceId, selectedWorkspaceCredential.workspaceAccess.accessKey),
          getAlphaWorkflowRuns(selectedWorkspaceId, selectedWorkspaceCredential.workspaceAccess.accessKey),
          getAlphaUsage(selectedWorkspaceId, selectedWorkspaceCredential.workspaceAccess.accessKey),
        ])

        // Fetch usage summary (non-blocking)
        getUsageSummary(selectedWorkspaceId, selectedWorkspaceCredential.workspaceAccess.accessKey)
          .then((s) => { if (!cancelled && s) setUsageSummary(s) })
          .catch(() => {})

        if (cancelled) {
          return
        }

        setWorkspaceAgents(nextAgents)
        setAlphaRuns(nextRuns)
        setUsageEntries(nextUsage)

        const nextSelectedRunId =
          selectedAlphaRunId && nextRuns.some((item) => item.workflowRunId === selectedAlphaRunId)
            ? selectedAlphaRunId
            : nextRuns[0]?.workflowRunId ?? ''
        setSelectedAlphaRunId(nextSelectedRunId)

        if (nextSelectedRunId) {
          const detail = await getAlphaWorkflowDetail(
            selectedWorkspaceId,
            selectedWorkspaceCredential.workspaceAccess.accessKey,
            nextSelectedRunId,
          )
          if (!cancelled) {
            setSelectedAlphaWorkflow(detail.workflow)
          }
        } else {
          setSelectedAlphaWorkflow(null)
        }
      } catch (error) {
        if (!cancelled) {
          setWorkspaceAgents([])
          setAlphaRuns([])
          setSelectedAlphaWorkflow(null)
          setUsageEntries([])
          setAlphaError(error instanceof Error ? error.message : 'Failed to load alpha workflow data.')
        }
      }
    }

    void loadAlphaWorkspaceData()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspaceId])

  const startWorkflow = useCallback(() => {
    setIsRunning(true)
    setCurrentStep(-1)
    setVisibleEvents([])
    setRun(null)

    const events = targetRun.events
    const totalSteps = events.length

    events.forEach((evt, index) => {
      setTimeout(() => {
        setCurrentStep(index)
        setVisibleEvents((prev) => [...prev, evt])

        if (index === totalSteps - 1) {
          setTimeout(() => {
            setRun(targetRun)
            setIsRunning(false)
          }, 600)
        }
      }, (index + 1) * 800)
    })
  }, [targetRun])

  const switchMode = (nextMode: DemoMode) => {
    if (isRunning || mode === nextMode) {
      return
    }

    setMode(nextMode)
    setCurrentStep(-1)
    setVisibleEvents([])
    setRun(null)
  }

  const completedStepIndex = run
    ? STATUS_TO_STEP_INDEX[run.status] ?? -1
    : currentStep >= 0
      ? currentStep
      : -1

  async function refreshAlphaWorkspace(workspaceId: string, preferredRunId?: string) {
    const credential =
      workspaceCredentials.find((item) => item.workspace.workspaceId === workspaceId) ?? null

    if (!credential) {
      setAlphaError('This workspace is not connected in the local browser vault.')
      return
    }

    const [nextAgents, nextRuns, nextUsage] = await Promise.all([
      getWorkspaceAgents(workspaceId, credential.workspaceAccess.accessKey),
      getAlphaWorkflowRuns(workspaceId, credential.workspaceAccess.accessKey),
      getAlphaUsage(workspaceId, credential.workspaceAccess.accessKey),
    ])

    setWorkspaceAgents(nextAgents)
    setAlphaRuns(nextRuns)
    setUsageEntries(nextUsage)

    const nextRunId = preferredRunId ?? nextRuns[0]?.workflowRunId ?? ''
    setSelectedAlphaRunId(nextRunId)

    if (nextRunId) {
      const detail = await getAlphaWorkflowDetail(
        workspaceId,
        credential.workspaceAccess.accessKey,
        nextRunId,
      )
      setSelectedAlphaWorkflow(detail.workflow)
    } else {
      setSelectedAlphaWorkflow(null)
    }
  }

  async function handleCreateAlphaRun() {
    if (!selectedWorkspaceId || !selectedWorkspaceCredential) {
      setAlphaError('Create and select a workspace on the onboarding page before starting an alpha workflow.')
      return
    }

    if (!alphaRunReady) {
      setAlphaError(
        `This workspace still needs active verified agents for: ${missingAlphaRoles
          .map((role) => ROLE_LABELS[role])
          .join(', ')}.`,
      )
      return
    }

    setAlphaError('')
    setAlphaStatusMessage('')
    setIsAlphaBusy(true)

    try {
      const payload = await createAlphaWorkflowRun(
        selectedWorkspaceId,
        selectedWorkspaceCredential.workspaceAccess.accessKey,
        {
        workflowTemplateId: 'tpl_xlayer_signal_gate',
        intent: ALPHA_WORKFLOW_INTENT,
        triggeredByMemberId: alphaTriggeredByMemberId,
      },
      )

      await refreshAlphaWorkspace(selectedWorkspaceId, payload.workflow.workflowRun.workflowRunId)
      setAlphaStatusMessage(
        `Alpha workflow ${payload.workflow.workflowRun.status} for workspace ${selectedWorkspaceId}.`,
      )
    } catch (error) {
      setAlphaError(
        error instanceof Error
          ? error.message
          : 'Alpha workflow could not be created. Verify the workspace has active agents first.',
      )
    } finally {
      setIsAlphaBusy(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-cyan animate-pulse-glow' : run ? 'bg-emerald' : 'bg-text-muted'
              }`}
            />
            <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">
              {isRunning ? 'Running' : run ? (run.status === 'Settled' ? 'Settled' : 'Completed') : 'Ready'}
            </span>
          </div>
          <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => switchMode('approved')}
              className={`px-4 py-2 text-xs font-mono transition-colors cursor-pointer ${
                mode === 'approved'
                  ? 'bg-cyan/10 text-cyan'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Approved Path
            </button>
            <button
              onClick={() => switchMode('rejected')}
              className={`px-4 py-2 text-xs font-mono border-l border-border transition-colors cursor-pointer ${
                mode === 'rejected' ? 'bg-red/10 text-red' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Rejected Path
            </button>
          </div>

          <button
            onClick={startWorkflow}
            disabled={isRunning}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              isRunning
                ? 'bg-surface-light text-text-muted cursor-not-allowed'
                : 'bg-cyan text-void hover:bg-cyan-dim'
            }`}
          >
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5 mb-4">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Workflow Intent</span>
        <p className="font-mono text-sm text-text-secondary mt-2 leading-relaxed">{HERO_USE_CASE}</p>
      </div>

      {run && run.status === 'Settled' && run.settlement.txHash && (
        <div className="rounded-xl border border-amber/25 bg-amber/[0.04] p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber" />
            <span className="text-sm font-semibold text-text-primary">Settlement Confirmed</span>
            <span className="text-xs font-mono text-text-muted">{run.settlement.txHash.slice(0, 14)}...</span>
          </div>
          <a
            href={run.settlement.explorerUrl || `https://www.oklink.com/xlayer/tx/${run.settlement.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-amber hover:text-amber/80 no-underline"
          >
            View on Explorer &rarr;
          </a>
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center gap-1">
          {PIPELINE_STEPS.map((step, index) => {
            const isComplete = index <= completedStepIndex
            const isCurrent = index === completedStepIndex && isRunning
            const isRejected = mode === 'rejected' && run && index > completedStepIndex

            let bgColor = 'bg-surface-light'
            let textColor = 'text-text-muted'
            let borderColor = 'border-border'

            if (isComplete) {
              bgColor = mode === 'rejected' && step.key === 'decision_made' ? 'bg-red/10' : 'bg-cyan/10'
              textColor = mode === 'rejected' && step.key === 'decision_made' ? 'text-red' : 'text-cyan'
              borderColor = mode === 'rejected' && step.key === 'decision_made' ? 'border-red/30' : 'border-cyan/30'
            }

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`w-full h-10 rounded-lg border flex items-center justify-center ${bgColor} ${borderColor} transition-all ${
                    isCurrent ? 'animate-pulse-glow' : ''
                  } ${isRejected ? 'opacity-30' : ''}`}
                  animate={isComplete ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <span className={`text-[10px] font-mono font-semibold ${textColor}`}>{step.short}</span>
                </motion.div>
                <span
                  className={`text-[9px] mt-1 ${isComplete ? textColor : 'text-text-muted'} ${
                    isRejected ? 'opacity-30' : ''
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-mono text-text-tertiary uppercase tracking-wider mb-3">
            Agent Activity
          </h2>
          {targetRun.agents.map((agent) => {
            const meta = AGENT_META[agent.name]
            const isVisible =
              visibleEvents.some(
                (event) =>
                  (agent.name === 'Sentinel' && event.type === 'signal_fetched') ||
                  (agent.name === 'Arbiter' && event.type === 'decision_made') ||
                  (agent.name === 'Executor' && event.type === 'action_executed') ||
                  (agent.name === 'Evaluator' && event.type === 'result_evaluated'),
              ) || run !== null

            const showAgent = isVisible || (!isRunning && !run)

            return (
              <AnimatePresence key={agent.id}>
                {showAgent && (
                  <motion.div
                    initial={isRunning || run ? { opacity: 0, x: -20 } : { opacity: 1 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`rounded-xl border p-5 transition-all ${
                      agent.status === 'skipped' && run ? 'opacity-40' : ''
                    }`}
                    style={{
                      borderColor: run || isRunning ? `${meta.color}25` : `${meta.color}15`,
                      background: run || isRunning ? `${meta.color}06` : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm"
                          style={{
                            background: `${meta.color}15`,
                            color: meta.color,
                            border: `1px solid ${meta.color}30`,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-text-primary">{agent.name}</span>
                          <span className="text-xs text-text-muted ml-2 font-mono">{agent.role}</span>
                        </div>
                      </div>

                      {(run || isRunning) && (
                        <span className={`status-${agent.status} px-2.5 py-1 rounded-full text-[10px] font-mono`}>
                          {agent.status}
                        </span>
                      )}
                    </div>

                    {(run || isVisible) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <p className="text-sm text-text-secondary mb-3">{agent.summary}</p>

                        {(() => {
                          if (agent.name !== 'Sentinel') return null
                          const out = agent.output as Record<string, unknown>
                          if (!out?.price) return null
                          const summary = String(out.signalSummary || '')
                          const match = summary.match(/-?\d+\.?\d*%/)
                          const changeText = match ? match[0] : ''
                          const isNeg = changeText.startsWith('-')
                          return (
                            <div className="flex items-center gap-4 mb-3 p-3 rounded-lg bg-surface-light/50 border border-border/30">
                              <span className="text-2xl font-bold text-text-primary">
                                ${String(out.price)}
                              </span>
                              {changeText && (
                                <span className={`text-sm font-mono ${isNeg ? 'text-red' : 'text-emerald'}`}>
                                  {changeText} 24h
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-text-muted ml-auto">OKB/USDT</span>
                            </div>
                          )
                        })()}

                        {agent.status !== 'skipped' &&
                          agent.status !== 'idle' &&
                          Object.keys(agent.output).length > 0 && (
                            <div className="rounded-lg bg-abyss/60 border border-border/50 p-3">
                              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                                Output
                              </span>
                              <pre className="text-xs font-mono text-text-tertiary mt-1 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(agent.output, null, 2)}
                              </pre>
                            </div>
                          )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })}
        </div>

        <div>
          <h2 className="text-sm font-mono text-text-tertiary uppercase tracking-wider mb-3">
            Event Timeline
          </h2>
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            {visibleEvents.length === 0 && !run ? (
              <p className="text-xs text-text-muted text-center py-8">Run the workflow to see events</p>
            ) : (
              <div className="space-y-0">
                {(run ? targetRun.events : visibleEvents).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative pl-6 pb-4 last:pb-0"
                  >
                    {index < (run ? targetRun.events : visibleEvents).length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                    )}

                    <div
                      className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2"
                      style={{
                        borderColor:
                          event.type === 'settlement_recorded'
                            ? '#f0b232'
                            : event.type === 'payment_triggered'
                              ? '#a78bfa'
                              : event.type === 'action_executed'
                                ? '#3b82f6'
                                : '#00e5cc',
                        background: `${
                          event.type === 'settlement_recorded'
                            ? '#f0b232'
                            : event.type === 'payment_triggered'
                              ? '#a78bfa'
                              : event.type === 'action_executed'
                                ? '#3b82f6'
                                : '#00e5cc'
                        }20`,
                      }}
                    />

                    <span className="text-xs font-semibold text-text-primary">{event.title}</span>
                    <p className="text-[11px] text-text-secondary mt-0.5">{event.description}</p>
                    <span className="text-[9px] font-mono text-text-muted mt-1 block">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {run && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-purple/20 bg-purple/[0.04] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple" />
                <span className="text-xs font-mono text-purple uppercase tracking-wider">Payment Event</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Mode</span>
                  <span className="font-mono text-text-secondary">{run.payment.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Amount</span>
                  <span className="font-mono text-text-secondary">
                    {run.payment.amount} {run.payment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className="font-mono text-text-secondary">{run.payment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Reference</span>
                  <span className="font-mono text-text-tertiary text-[10px]">{run.payment.reference}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {run && run.status === 'Settled' && <SettlementProof run={run} />}

      {run && run.status === 'DecisionMade' && mode === 'rejected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red/20 bg-red/[0.04] p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red" />
            <span className="text-xs font-mono text-red uppercase tracking-wider">Workflow Rejected</span>
          </div>
          <p className="text-sm text-text-secondary">{run.settlement.proofSummary}</p>
          <p className="text-xs text-text-muted mt-2">
            This demonstrates the Arbiter&apos;s conditional judgment. Execution is not automatic, and the workflow
            only proceeds when the configured threshold criteria are met.
          </p>
        </motion.div>
      )}

      <section className="mt-10 mb-10">
        <h2 className="text-sm font-mono text-text-tertiary uppercase tracking-wider mb-4">Protocol Integration</h2>
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { label: 'OKX Onchain OS', detail: 'Market API + DEX', status: 'live', color: 'cyan' },
            { label: 'x402 Payment', detail: 'HTTP 402 → Pay → 200', status: 'live', color: 'purple' },
            { label: 'ERC-8004', detail: 'Agent Identity Registry', status: 'ready', color: 'amber' },
            { label: 'ERC-8183', detail: 'Agentic Commerce Escrow', status: 'ready', color: 'amber' },
          ].map((proto) => (
            <div
              key={proto.label}
              className={`rounded-xl border p-4 ${
                proto.status === 'live'
                  ? `border-${proto.color}/25 bg-${proto.color}/[0.04]`
                  : 'border-border bg-surface/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-primary">{proto.label}</span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    proto.status === 'live' ? `text-${proto.color}` : 'text-amber'
                  }`}
                >
                  {proto.status}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{proto.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <span className="text-xs font-mono text-amber uppercase tracking-wider">Private Builder Alpha</span>
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="rounded-xl border border-border bg-surface/40 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Live Alpha Workflow</h2>
                <p className="text-sm text-text-secondary mt-1">
                  This surface uses the workspace-scoped API. It creates a live-signal-backed workflow record,
                  persists history, and records usage even when settlement is still pending.
                </p>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">workspace scoped</div>
            </div>

            <div className="rounded-lg border border-border bg-abyss/50 p-4 mb-4">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Run readiness</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    The alpha path only runs when one active, wallet-verified agent exists for each canonical role.
                  </div>
                </div>
                <div
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    alphaRunReady ? 'text-emerald' : 'text-amber'
                  }`}
                >
                  {alphaRunReady ? 'ready' : 'incomplete'}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {REQUIRED_ALPHA_ROLES.map((role) => {
                  const agent = activeAgentsByRole[role]
                  return (
                    <div
                      key={role}
                      className={`rounded-lg border p-3 ${
                        agent ? 'border-emerald/25 bg-emerald/[0.06]' : 'border-border bg-surface/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-text-primary">{ROLE_LABELS[role]}</div>
                          <div className="text-[10px] font-mono text-text-muted mt-1">{role}</div>
                        </div>
                        <div
                          className={`text-[10px] font-mono uppercase tracking-wider ${
                            agent ? 'text-emerald' : 'text-amber'
                          }`}
                        >
                          {agent ? 'ready' : 'missing'}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-text-secondary">
                        {agent
                          ? `${agent.name} · ${agent.agentId}`
                          : 'Register and verify this role on the onboarding page.'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Workspace</span>
                <select
                  value={selectedWorkspaceId}
                  onChange={(event) => setSelectedWorkspaceId(event.target.value)}
                  className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                >
                  <option value="">No workspace selected</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.workspaceId} value={workspace.workspaceId}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={handleCreateAlphaRun}
                disabled={isAlphaBusy || !selectedWorkspaceId || !alphaRunReady}
                className="px-4 py-2 rounded-lg bg-amber text-void text-sm font-semibold disabled:opacity-50"
              >
                {isAlphaBusy ? 'Running...' : 'Run alpha workflow'}
              </button>
            </div>

            {(alphaStatusMessage || alphaError) && (
              <div
                className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                  alphaError
                    ? 'border-red/25 bg-red/[0.06] text-red'
                    : 'border-emerald/25 bg-emerald/[0.06] text-emerald'
                }`}
              >
                {alphaError || alphaStatusMessage}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-text-tertiary">Run history</h3>
              {alphaRuns.length === 0 ? (
                <div className="rounded-lg border border-border bg-abyss/50 p-4 text-sm text-text-secondary">
                  No alpha runs yet. Create one from a workspace with verified agents.
                </div>
              ) : (
                alphaRuns.map((alphaRun) => (
                  <button
                    key={alphaRun.workflowRunId}
                    type="button"
                    onClick={() => setSelectedAlphaRunId(alphaRun.workflowRunId)}
                    className={`w-full text-left rounded-lg border p-4 transition-all ${
                      selectedAlphaRunId === alphaRun.workflowRunId
                        ? 'border-amber/30 bg-amber/[0.08]'
                        : 'border-border bg-abyss/50 hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">{alphaRun.workflowTemplateId}</div>
                        <div className="text-[11px] font-mono text-text-muted mt-1">{alphaRun.workflowRunId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">{alphaRun.status}</div>
                        <div className="text-[10px] text-text-muted mt-1">
                          {new Date(alphaRun.requestedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-3 line-clamp-2">{alphaRun.intent}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <h2 className="text-xl font-semibold mb-2">Selected Alpha Run</h2>
              <p className="text-sm text-text-secondary mb-4">
                This is the product-facing evolution of the demo workflow: live input, persistent history, and
                explicit usage records.
              </p>

              {!selectedAlphaWorkflow ? (
                <div className="rounded-lg border border-border bg-abyss/50 p-4 text-sm text-text-secondary">
                  Select or create an alpha workflow to inspect live run details.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-abyss/50 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Run status</div>
                      <div className="mt-2 text-lg font-semibold text-text-primary">
                        {selectedAlphaWorkflow.workflowRun.status}
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {selectedAlphaWorkflow.workflowRun.signalProvider} · triggered by{' '}
                        <span className="font-mono">{selectedAlphaWorkflow.workflowRun.triggeredByMemberId}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-abyss/50 p-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Payment event</div>
                      <div className="mt-2 text-sm font-mono text-text-primary">
                        {selectedAlphaWorkflow.payment.mode} · {selectedAlphaWorkflow.payment.status}
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {selectedAlphaWorkflow.payment.amount} {selectedAlphaWorkflow.payment.currency}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-abyss/50 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Workflow steps</div>
                    <div className="mt-3 space-y-3">
                      {selectedAlphaWorkflow.workflowSteps.map((step) => (
                        <div
                          key={step.stepId}
                          className="flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <div className="font-semibold text-sm text-text-primary">{step.role}</div>
                            <div className="text-xs text-text-secondary mt-1">
                              {step.outputSummary || step.inputSummary || 'No detail recorded.'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">{step.status}</div>
                            <div className="text-[10px] text-text-muted mt-1">
                              {step.completedAt ? new Date(step.completedAt).toLocaleTimeString() : 'pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-abyss/50 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Evaluation</div>
                    <div className="mt-2 text-sm text-text-secondary">
                      {selectedAlphaWorkflow.evaluation?.summary ?? 'No evaluation recorded yet.'}
                    </div>
                    {(() => {
                      const evalOutput = selectedAlphaWorkflow.evaluation?.output as Record<string, unknown> | undefined
                      const hashes = evalOutput?.escrowTxHashes as string[] | undefined
                      if (!hashes || hashes.length === 0) return null
                      return (
                        <div className="mt-3 space-y-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-amber">ERC-8183 Escrow Transactions</div>
                          {(['Create', 'Fund', 'Submit', 'Complete'] as const).map((label, idx) => {
                            const hash = hashes[idx]
                            if (!hash) return null
                            return (
                              <a
                                key={label}
                                href={`https://www.oklink.com/xlayer/tx/${hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-xs font-mono text-text-tertiary hover:text-amber no-underline"
                              >
                                <span className="text-text-muted">{label}</span>
                                <span>{hash.slice(0, 14)}...{hash.slice(-6)}</span>
                              </a>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="rounded-lg border border-border bg-abyss/50 p-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Settlement</div>
                    <div className="mt-2 text-sm text-text-secondary">
                      {selectedAlphaWorkflow.settlement.proofSummary}
                    </div>
                    <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-text-muted">Status</div>
                        <div className="mt-1 font-mono text-text-primary">
                          {selectedAlphaWorkflow.settlement.status}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-muted">Proof artifact</div>
                        <div className="mt-1 font-mono text-text-primary">
                          {selectedAlphaWorkflow.proofArtifact?.proofArtifactId ?? 'pending'}
                        </div>
                      </div>
                    </div>
                    {selectedAlphaWorkflow.proofArtifact?.explorerUrl ? (
                      <a
                        href={selectedAlphaWorkflow.proofArtifact.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex rounded-lg border border-amber/25 bg-amber/[0.06] px-3 py-2 text-[11px] font-mono text-amber no-underline hover:bg-amber/10 transition-colors"
                      >
                        View proof artifact
                      </a>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {usageSummary && parseFloat(usageSummary.totalBillableAmount) > 0 && (
              <div className="rounded-xl border border-cyan/20 bg-cyan/[0.04] p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-mono text-cyan uppercase tracking-wider">Usage Summary</h3>
                  <span className="text-lg font-bold text-text-primary">${usageSummary.totalBillableAmount} {usageSummary.billableCurrency}</span>
                </div>
                <div className="text-xs text-text-muted mb-2">{usageSummary.totalRuns} total runs</div>
                <div className="space-y-1">
                  {Object.entries(usageSummary.breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{key.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-text-tertiary">{val.count}x = ${val.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-surface/40 p-6">
              <h2 className="text-xl font-semibold mb-2">Usage Ledger</h2>
              <p className="text-sm text-text-secondary mb-4">
                Commercial readiness starts with knowing what happened, whether it was billable, and which run
                produced it.
              </p>

              <div className="space-y-3">
                {usageEntries.length === 0 ? (
                  <div className="rounded-lg border border-border bg-abyss/50 p-4 text-sm text-text-secondary">
                    No usage entries recorded yet for this workspace.
                  </div>
                ) : (
                  usageEntries
                    .slice()
                    .reverse()
                    .slice(0, 6)
                    .map((entry) => (
                      <div key={entry.usageEntryId} className="rounded-lg border border-border bg-abyss/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-sm text-text-primary">{entry.eventType}</div>
                            <div className="text-[11px] font-mono text-text-muted mt-1">{entry.workflowRunId}</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-[10px] font-mono uppercase tracking-wider ${
                                entry.billable ? 'text-amber' : 'text-text-muted'
                              }`}
                            >
                              {entry.billable ? 'billable' : 'non-billable'}
                            </div>
                            <div className="text-[10px] text-text-muted mt-1">
                              {new Date(entry.recordedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-text-secondary">
                          {entry.unitCount} {entry.unitType}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
