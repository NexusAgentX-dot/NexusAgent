import { useEffect, useMemo, useState } from 'react'
import type {
  AlphaAgent,
  IntegrationPath,
  OnboardingAgent,
  OnboardingTemplate,
  WorkspaceCredential,
} from '../types/workflow'
import {
  createWorkspace,
  getAgents,
  getOnboardingTemplate,
  getWorkspaceContext,
  getWorkspaceAgents,
  registerWorkspaceAgent,
  verifyWorkspaceAgentWallet,
} from '../lib/api'
import {
  listWorkspaceCredentials,
  saveWorkspaceCredential,
  updateWorkspaceCredentialSnapshot,
} from '../lib/workspaceVault'

const PATHS: { id: IntegrationPath; name: string; badge: string; desc: string; steps: string[] }[] = [
  {
    id: 'skills',
    name: 'AI Skills + Agentic Wallet',
    badge: 'Preferred',
    desc: 'The simplest official onboarding path. Use OKX AI Skills for pre-built capabilities and Agentic Wallet for secure agent wallet setup.',
    steps: [
      'Register agent identity and capabilities',
      'Connect through OKX AI Skills interface',
      'Provision Agentic Wallet with TEE-protected keys',
      'Declare supported actions and workflow roles',
      'Agent is ready to participate in workflows',
    ],
  },
  {
    id: 'mcp',
    name: 'MCP + Agentic Wallet',
    badge: 'Secondary',
    desc: 'For MCP-native clients. Connect through the Model Context Protocol connectivity layer with an Agentic Wallet for secure execution.',
    steps: [
      'Register agent identity and capabilities',
      'Configure MCP endpoints for tool connectivity',
      'Provision Agentic Wallet with TEE-protected keys',
      'Expose MCP-compatible action interfaces',
      'Agent is ready to participate in workflows',
    ],
  },
  {
    id: 'open_api',
    name: 'Open API + Custom Integration',
    badge: 'Advanced',
    desc: 'The lower-level integration path for builders who need full control. Direct API access with custom signing and wallet integration.',
    steps: [
      'Register agent identity and capabilities',
      'Authenticate through OKX Open API',
      'Configure custom signing and wallet model',
      'Implement action interfaces to specification',
      'Agent is ready to participate in workflows',
    ],
  },
]

const REGISTRATION_FIELDS = [
  { field: 'agentId', type: 'string', desc: 'Unique identifier for the agent' },
  { field: 'name', type: 'string', desc: 'Human-readable agent name' },
  { field: 'description', type: 'string', desc: 'What this agent does' },
  { field: 'role', type: 'enum', desc: 'signal_fetcher | decision_engine | execution_engine | verification_engine' },
  { field: 'integrationPath', type: 'enum', desc: 'skills | mcp | open_api' },
  { field: 'walletType', type: 'enum', desc: 'agentic_wallet | external_wallet' },
  { field: 'walletReference', type: 'string', desc: 'Wallet address or reference' },
  { field: 'capabilities', type: 'string[]', desc: 'List of agent capabilities' },
  { field: 'supportedActions', type: 'string[]', desc: 'Actions this agent can perform' },
]

const FALLBACK_AGENTS: OnboardingAgent[] = [
  {
    agentId: 'agent_sentinel',
    name: 'Sentinel',
    description: 'Fetches market context',
    role: 'signal_fetcher',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_sentinel_demo',
    capabilities: ['market_context'],
    supportedActions: ['fetch_market_context'],
    status: 'active',
  },
  {
    agentId: 'agent_arbiter',
    name: 'Arbiter',
    description: 'Approves or rejects runs',
    role: 'decision_engine',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_arbiter_demo',
    capabilities: ['decisioning', 'risk_check'],
    supportedActions: ['approve_or_reject_run'],
    status: 'active',
  },
  {
    agentId: 'agent_executor',
    name: 'Executor',
    description: 'Performs bounded actions',
    role: 'execution_engine',
    integrationPath: 'mcp',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_executor_demo',
    capabilities: ['execution'],
    supportedActions: ['bounded_stablecoin_transfer'],
    status: 'active',
  },
  {
    agentId: 'agent_evaluator',
    name: 'Evaluator',
    description: 'Verifies outcomes',
    role: 'verification_engine',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_evaluator_demo',
    capabilities: ['evaluation'],
    supportedActions: ['verify_outcome'],
    status: 'active',
  },
]

export default function Onboarding() {
  const [selectedPath, setSelectedPath] = useState<IntegrationPath>('skills')
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null)
  const [agents, setAgents] = useState<OnboardingAgent[]>(FALLBACK_AGENTS)
  const [workspaceCredentials, setWorkspaceCredentials] = useState<WorkspaceCredential[]>([])
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [workspaceAgents, setWorkspaceAgents] = useState<AlphaAgent[]>([])
  const [workspaceForm, setWorkspaceForm] = useState({
    name: 'Alpha Builder Workspace',
    slug: 'alpha-builder-workspace',
    createdBy: 'builder_owner',
  })
  const [connectForm, setConnectForm] = useState({
    workspaceId: '',
    accessKey: '',
  })
  const [agentForm, setAgentForm] = useState({
    agentId: 'builder_sentinel',
    ownerMemberId: 'builder_owner',
    name: 'Builder Sentinel',
    description: 'External agent for alpha onboarding.',
    role: 'signal_fetcher' as const,
    integrationPath: 'skills' as const,
    walletType: 'agentic_wallet' as const,
    walletReference: 'okx://agentic-wallet/builder-sentinel',
    capabilities: 'market_context',
    supportedActions: 'signal_check',
  })
  const [alphaMessage, setAlphaMessage] = useState<string>('')
  const [alphaError, setAlphaError] = useState<string>('')
  const [isAlphaBusy, setIsAlphaBusy] = useState(false)
  const [issuedWorkspaceAccess, setIssuedWorkspaceAccess] = useState<{
    workspaceId: string
    accessKey: string
    keyHint: string
  } | null>(null)
  const selectedWorkspaceCredential =
    workspaceCredentials.find((credential) => credential.workspace.workspaceId === selectedWorkspaceId) ?? null
  const workspaces = workspaceCredentials.map((credential) => credential.workspace)

  useEffect(() => {
    let cancelled = false

    async function loadOnboardingSurface() {
      const [nextTemplate, nextAgents] = await Promise.all([
        getOnboardingTemplate(),
        getAgents(),
      ])
      const nextWorkspaceCredentials = listWorkspaceCredentials()

      if (cancelled) {
        return
      }

      if (nextTemplate) {
        setTemplate(nextTemplate)
      }

      if (nextAgents.length > 0) {
        setAgents(nextAgents)
      }

      setWorkspaceCredentials(nextWorkspaceCredentials)
      if (nextWorkspaceCredentials.length > 0) {
        setSelectedWorkspaceId((current) => current || nextWorkspaceCredentials[0].workspace.workspaceId)
      }
    }

    void loadOnboardingSurface()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadWorkspaceAgents() {
      if (!selectedWorkspaceId || !selectedWorkspaceCredential) {
        setWorkspaceAgents([])
        return
      }

      try {
        const { workspace } = await getWorkspaceContext(
          selectedWorkspaceCredential.workspace.workspaceId,
          selectedWorkspaceCredential.workspaceAccess.accessKey,
        )
        updateWorkspaceCredentialSnapshot(workspace)
        setWorkspaceCredentials(listWorkspaceCredentials())

        const nextAgents = await getWorkspaceAgents(
          selectedWorkspaceCredential.workspace.workspaceId,
          selectedWorkspaceCredential.workspaceAccess.accessKey,
        )
        if (!cancelled) {
          setWorkspaceAgents(nextAgents)
        }
      } catch {
        if (!cancelled) {
          setWorkspaceAgents([])
        }
      }
    }

    void loadWorkspaceAgents()

    return () => {
      cancelled = true
    }
  }, [selectedWorkspaceCredential, selectedWorkspaceId])

  const mergedPaths = useMemo(() => {
    if (!template) {
      return PATHS
    }

    return PATHS.map((path) => {
      const remote = template.supportedPaths.find((item) => item.id === path.id)
      return {
        ...path,
        name: remote?.label ?? path.name,
        badge: remote?.badge ?? path.badge,
        desc: remote?.description ?? path.desc,
      }
    })
  }, [template])

  const activePath = mergedPaths.find((p) => p.id === selectedPath) ?? mergedPaths[0]
  const visibleFields = template?.requiredFields ?? REGISTRATION_FIELDS

  function refreshStoredWorkspaces(nextSelectedWorkspaceId?: string) {
    const nextWorkspaceCredentials = listWorkspaceCredentials()
    setWorkspaceCredentials(nextWorkspaceCredentials)
    const fallbackWorkspaceId =
      nextSelectedWorkspaceId ??
      selectedWorkspaceId ??
      nextWorkspaceCredentials[0]?.workspace.workspaceId ??
      ''
    setSelectedWorkspaceId(fallbackWorkspaceId)
    if (fallbackWorkspaceId) {
      void (async () => {
        const credential = nextWorkspaceCredentials.find(
          (item) => item.workspace.workspaceId === fallbackWorkspaceId,
        )
        if (!credential) {
          setWorkspaceAgents([])
          return
        }

        const nextAgents = await getWorkspaceAgents(
          fallbackWorkspaceId,
          credential.workspaceAccess.accessKey,
        )
        setWorkspaceAgents(nextAgents)
      })()
    } else {
      setWorkspaceAgents([])
    }
  }

  async function handleCreateWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlphaError('')
    setAlphaMessage('')
    setIssuedWorkspaceAccess(null)
    setIsAlphaBusy(true)

    try {
      const payload = await createWorkspace(workspaceForm)
      saveWorkspaceCredential(payload.workspace, payload.workspaceAccess)
      setConnectForm((current) => ({ ...current, workspaceId: payload.workspace.workspaceId }))
      refreshStoredWorkspaces(payload.workspace.workspaceId)
      setIssuedWorkspaceAccess({
        workspaceId: payload.workspace.workspaceId,
        accessKey: payload.workspaceAccess.accessKey,
        keyHint: payload.workspaceAccess.keyHint,
      })
      setAlphaMessage(
        `Workspace ${payload.workspace.name} is ready. Copy the workspace key now if this workspace will be reconnected in another browser or environment.`,
      )
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Workspace creation failed.')
    } finally {
      setIsAlphaBusy(false)
    }
  }

  async function handleConnectWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAlphaError('')
    setAlphaMessage('')
    setIsAlphaBusy(true)

    try {
      const payload = await getWorkspaceContext(connectForm.workspaceId.trim(), connectForm.accessKey.trim())
      saveWorkspaceCredential(payload.workspace, {
        authScheme: 'workspace_key',
        accessKey: connectForm.accessKey.trim(),
        keyHint:
          connectForm.accessKey.trim().length <= 10
            ? connectForm.accessKey.trim()
            : `${connectForm.accessKey.trim().slice(0, 6)}…${connectForm.accessKey.trim().slice(-4)}`,
        issuedAt: new Date().toISOString(),
      })
      refreshStoredWorkspaces(payload.workspace.workspaceId)
      setAlphaMessage(`Workspace ${payload.workspace.name} was connected locally for this browser.`)
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Workspace connection failed.')
    } finally {
      setIsAlphaBusy(false)
    }
  }

  async function handleRegisterAgent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedWorkspaceId || !selectedWorkspaceCredential) {
      setAlphaError('Create or select a workspace before registering an agent.')
      return
    }

    setAlphaError('')
    setAlphaMessage('')
    setIsAlphaBusy(true)

    try {
      const payload = await registerWorkspaceAgent(selectedWorkspaceId, selectedWorkspaceCredential.workspaceAccess.accessKey, {
        agentId: agentForm.agentId,
        ownerMemberId: agentForm.ownerMemberId,
        name: agentForm.name,
        description: agentForm.description,
        role: agentForm.role,
        integrationPath: agentForm.integrationPath,
        walletType: agentForm.walletType,
        walletReference: agentForm.walletReference,
        capabilities: agentForm.capabilities.split(',').map((item) => item.trim()).filter(Boolean),
        supportedActions: agentForm.supportedActions.split(',').map((item) => item.trim()).filter(Boolean),
      })

      const nextAgents = await getWorkspaceAgents(
        selectedWorkspaceId,
        selectedWorkspaceCredential.workspaceAccess.accessKey,
      )
      setWorkspaceAgents(nextAgents)
      setAlphaMessage(`Agent ${payload.agent.name} was registered in the selected workspace.`)
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Agent registration failed.')
    } finally {
      setIsAlphaBusy(false)
    }
  }

  async function handleVerifyAgent(agentId: string) {
    if (!selectedWorkspaceId || !selectedWorkspaceCredential) {
      setAlphaError('Select a workspace before verifying an agent wallet.')
      return
    }

    setAlphaError('')
    setAlphaMessage('')
    setIsAlphaBusy(true)

    try {
      const payload = await verifyWorkspaceAgentWallet(
        selectedWorkspaceId,
        selectedWorkspaceCredential.workspaceAccess.accessKey,
        agentId,
      )
      const nextAgents = await getWorkspaceAgents(
        selectedWorkspaceId,
        selectedWorkspaceCredential.workspaceAccess.accessKey,
      )
      setWorkspaceAgents(nextAgents)
      setAlphaMessage(
        `Agent ${payload.agentId} is now ${payload.activationState} with wallet state ${payload.walletVerificationState}.`,
      )
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Wallet verification failed.')
    } finally {
      setIsAlphaBusy(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-16 anim-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-glow" />
          <span className="text-xs font-mono text-cyan uppercase tracking-wider">
            Builder Surface
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Onboard Your Agent
        </h1>
        <p className="text-text-secondary max-w-3xl text-lg leading-relaxed">
          Bring your AI agent into the NexusAgent network through an official OKX-friendly
          integration path. Register capabilities, provision a secure wallet, and start
          participating in economic workflows on X Layer.
        </p>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <span className="text-xs font-mono text-amber uppercase tracking-wider">
            Alpha Control Plane
          </span>
        </div>
        <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-xl border border-border bg-surface/40 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Workspace Ownership</h2>
                <p className="text-sm text-text-secondary mt-1">
                  External builders first enter NexusAgent through a workspace boundary. Workspace ownership scopes agents, workflow runs, proof, and usage.
                </p>
              </div>
              <div className="px-3 py-1 rounded-full border border-amber/25 bg-amber/10 text-[10px] font-mono uppercase tracking-wider text-amber">
                private builder alpha
              </div>
            </div>

            <form onSubmit={handleCreateWorkspace} className="grid md:grid-cols-3 gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Workspace name</span>
                <input
                  value={workspaceForm.name}
                  onChange={(event) => setWorkspaceForm((current) => ({ ...current, name: event.target.value }))}
                  className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Slug</span>
                <input
                  value={workspaceForm.slug}
                  onChange={(event) => setWorkspaceForm((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Created by</span>
                <input
                  value={workspaceForm.createdBy}
                  onChange={(event) => setWorkspaceForm((current) => ({ ...current, createdBy: event.target.value }))}
                  className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                />
              </label>
              <div className="md:col-span-3 flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isAlphaBusy}
                  className="px-4 py-2 rounded-lg bg-cyan text-void text-sm font-semibold disabled:opacity-50"
                >
                  {isAlphaBusy ? 'Working...' : 'Create workspace'}
                </button>

                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Selected workspace</span>
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
              </div>
            </form>

            <div className="mt-4 rounded-lg border border-border/70 bg-abyss/40 p-4">
              <h3 className="text-sm font-semibold">Reconnect Existing Workspace</h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">
                Private alpha workspaces are keyed. Paste a workspace id and its workspace key to reconnect this browser without listing every workspace publicly.
              </p>
              <form onSubmit={handleConnectWorkspace} className="grid md:grid-cols-[1fr_1.2fr_auto] gap-3">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">workspaceId</span>
                  <input
                    value={connectForm.workspaceId}
                    onChange={(event) => setConnectForm((current) => ({ ...current, workspaceId: event.target.value }))}
                    className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">workspace key</span>
                  <input
                    value={connectForm.accessKey}
                    onChange={(event) => setConnectForm((current) => ({ ...current, accessKey: event.target.value }))}
                    className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm text-text-primary outline-none focus:border-cyan/40"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isAlphaBusy || !connectForm.workspaceId.trim() || !connectForm.accessKey.trim()}
                    className="px-4 py-2 rounded-lg bg-surface-light text-text-primary text-sm font-semibold disabled:opacity-50"
                  >
                    Connect workspace
                  </button>
                </div>
              </form>
            </div>

            {(alphaMessage || alphaError) && (
              <div
                className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                  alphaError
                    ? 'border-red/25 bg-red/[0.06] text-red'
                    : 'border-emerald/25 bg-emerald/[0.06] text-emerald'
                }`}
              >
                {alphaError || alphaMessage}
              </div>
            )}

            {issuedWorkspaceAccess && (
              <div className="mt-4 rounded-lg border border-cyan/25 bg-cyan/[0.06] p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-cyan">Workspace key issued</div>
                    <div className="text-xs text-text-secondary mt-1">
                      Save this key outside the browser if you need to reconnect workspace
                      <span className="font-mono text-text-tertiary"> {issuedWorkspaceAccess.workspaceId}</span>
                      later.
                    </div>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">
                    {issuedWorkspaceAccess.keyHint}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-abyss/70 px-3 py-3 font-mono text-xs text-text-primary break-all">
                  {issuedWorkspaceAccess.accessKey}
                </div>
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.workspaceId}
                  className={`rounded-lg border p-4 ${
                    workspace.workspaceId === selectedWorkspaceId
                      ? 'border-cyan/30 bg-cyan/[0.06]'
                      : 'border-border bg-abyss/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{workspace.name}</div>
                      <div className="text-[11px] font-mono text-text-muted mt-1">{workspace.slug}</div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald">{workspace.status}</div>
                  </div>
                  <div className="text-xs text-text-secondary mt-3">
                    Owner: <span className="font-mono text-text-tertiary">{workspace.createdBy}</span>
                  </div>
                  <div className="text-xs text-text-secondary mt-2">
                    Key hint:{' '}
                    <span className="font-mono text-text-tertiary">
                      {workspaceCredentials.find((credential) => credential.workspace.workspaceId === workspace.workspaceId)?.workspaceAccess.keyHint ?? 'saved locally'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-6">
            <h2 className="text-xl font-semibold mb-2">Register External Agent</h2>
            <p className="text-sm text-text-secondary mb-5">
              This is the first real step from showcase to product: an outside builder can create a workspace-scoped agent record and move it from draft to verified.
            </p>

            <form onSubmit={handleRegisterAgent} className="grid grid-cols-2 gap-3">
              <label className="col-span-1 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">agentId</span>
                <input value={agentForm.agentId} onChange={(event) => setAgentForm((current) => ({ ...current, agentId: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="col-span-1 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">ownerMemberId</span>
                <input value={agentForm.ownerMemberId} onChange={(event) => setAgentForm((current) => ({ ...current, ownerMemberId: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="col-span-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">name</span>
                <input value={agentForm.name} onChange={(event) => setAgentForm((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="col-span-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">description</span>
                <input value={agentForm.description} onChange={(event) => setAgentForm((current) => ({ ...current, description: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">role</span>
                <select value={agentForm.role} onChange={(event) => setAgentForm((current) => ({ ...current, role: event.target.value as typeof current.role }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm">
                  <option value="signal_fetcher">signal_fetcher</option>
                  <option value="decision_engine">decision_engine</option>
                  <option value="execution_engine">execution_engine</option>
                  <option value="verification_engine">verification_engine</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">integrationPath</span>
                <select value={agentForm.integrationPath} onChange={(event) => setAgentForm((current) => ({ ...current, integrationPath: event.target.value as typeof current.integrationPath }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm">
                  <option value="skills">skills</option>
                  <option value="mcp">mcp</option>
                  <option value="open_api">open_api</option>
                </select>
              </label>
              <label className="col-span-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">walletReference</span>
                <input value={agentForm.walletReference} onChange={(event) => setAgentForm((current) => ({ ...current, walletReference: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="col-span-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">capabilities (comma-separated)</span>
                <input value={agentForm.capabilities} onChange={(event) => setAgentForm((current) => ({ ...current, capabilities: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <label className="col-span-2 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">supportedActions (comma-separated)</span>
                <input value={agentForm.supportedActions} onChange={(event) => setAgentForm((current) => ({ ...current, supportedActions: event.target.value }))} className="rounded-lg border border-border bg-abyss/70 px-3 py-2 text-sm" />
              </label>
              <div className="col-span-2 pt-1">
                <button type="submit" disabled={isAlphaBusy || !selectedWorkspaceId} className="px-4 py-2 rounded-lg bg-surface-light text-text-primary text-sm font-semibold disabled:opacity-50">
                  Register agent in selected workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Integration path selector */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">Choose Integration Path</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {mergedPaths.map((path) => {
            const isActive = selectedPath === path.id
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className={`
                  text-left rounded-xl border p-5 transition-all cursor-pointer
                  ${isActive
                    ? 'border-cyan/40 bg-cyan/[0.06]'
                    : 'border-border bg-surface/40 hover:bg-surface/70'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-semibold ${isActive ? 'text-cyan' : 'text-text-primary'}`}>
                    {path.name}
                  </span>
                </div>
                <span
                  className={`
                    inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider
                    ${path.badge === 'Preferred'
                      ? 'bg-cyan/10 text-cyan border border-cyan/20'
                      : path.badge === 'Secondary'
                        ? 'bg-amber/10 text-amber border border-amber/20'
                        : 'bg-surface-light text-text-tertiary border border-border'
                    }
                  `}
                >
                  {path.badge}
                </span>
                <p className="text-xs text-text-secondary mt-3 leading-relaxed">{path.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Active path steps */}
        <div
          key={selectedPath}
          className="rounded-xl border border-border bg-surface/40 p-6 anim-fade-in"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Onboarding Steps — {activePath.name}
          </h3>
          <div className="space-y-3">
            {activePath.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-semibold text-cyan">{i + 1}</span>
                </div>
                <span className="text-sm text-text-secondary pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NexusAgent Skills + Agentic Wallet */}
      <section className="mb-16 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-cyan/20 bg-cyan/[0.04] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan font-mono text-sm">N</div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">NexusAgent Skills</h3>
              <span className="text-[10px] font-mono text-cyan uppercase tracking-wider">Connect Your Agent</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            Typed client for signal fetching, workflow execution, and settlement verification.
          </p>
          <div className="rounded-lg bg-abyss/60 border border-border/50 p-3 mb-2">
            <code className="text-xs font-mono text-text-tertiary">npm install @nexusagent/skills</code>
          </div>
          <div className="rounded-lg bg-abyss/60 border border-border/50 p-3">
            <code className="text-xs font-mono text-text-tertiary">npx @nexusagent/skills init</code>
          </div>
        </div>
        <div className="rounded-xl border border-amber/20 bg-amber/[0.04] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center text-amber font-mono text-sm">W</div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Agentic Wallet</h3>
              <span className="text-[10px] font-mono text-amber uppercase tracking-wider">TEE Protected</span>
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            Email login &middot; TEE-protected keys &middot; Zero gas on X Layer &middot; ~20 chains supported
          </p>
          <div className="rounded-lg bg-abyss/60 border border-border/50 p-3">
            <code className="text-xs font-mono text-text-tertiary">npx skills add okx/onchainos-skills</code>
          </div>
        </div>
      </section>

      {/* Registration schema */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-2">Agent Registration Schema</h2>
        <p className="text-sm text-text-secondary mb-6">
          Every onboarded agent provides these fields. This is how the system knows
          what the agent can do and how to invoke it.
        </p>

        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-surface text-xs font-mono text-text-muted uppercase tracking-wider border-b border-border">
            <span>Field</span>
            <span>Type</span>
            <span>Description</span>
          </div>
          {/* Rows */}
          {visibleFields.map((f, i) => (
            <div
              key={f.field}
              className={`grid grid-cols-3 gap-4 px-5 py-3 text-sm ${i % 2 === 0 ? 'bg-surface/30' : ''} ${i < visibleFields.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <span className="font-mono text-cyan text-xs">{f.field}</span>
              <span className="font-mono text-text-tertiary text-xs">{f.type}</span>
              <span className="text-text-secondary text-xs">{'description' in f ? f.description : f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Demo onboarded agents */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Currently Onboarded Agents</h2>
        <p className="text-sm text-text-secondary mb-6">
          These four agents are registered and active in the showcase workflow.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {agents.map((a) => {
            const color =
              a.name === 'Sentinel'
                ? '#00e5cc'
                : a.name === 'Arbiter'
                  ? '#f0b232'
                  : a.name === 'Executor'
                    ? '#3b82f6'
                    : '#10b981'

            return (
            <div
              key={a.agentId}
              className="rounded-lg border p-4 flex items-center gap-4"
              style={{ borderColor: `${color}20`, background: `${color}06` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
              >
                {a.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-text-primary">{a.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-light text-text-muted border border-border">
                    {a.integrationPath}
                  </span>
                </div>
                <span className="text-xs text-text-tertiary font-mono">{a.role}</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald" title="Active" />
            </div>
          )})}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-2">Workspace-Scoped Alpha Agents</h2>
        <p className="text-sm text-text-secondary mb-6">
          These are the real builder-facing records. Agents begin in <span className="font-mono">draft</span>, then move to <span className="font-mono">verified</span> and <span className="font-mono">active</span> once the wallet reference is verified.
        </p>

        {selectedWorkspaceId ? (
          <div className="grid md:grid-cols-2 gap-3">
            {workspaceAgents.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface/30 p-5 text-sm text-text-secondary">
                No alpha agents have been registered for this workspace yet.
              </div>
            ) : (
              workspaceAgents.map((agent) => (
                <div key={agent.agentId} className="rounded-lg border border-border bg-surface/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{agent.name}</div>
                      <div className="text-[11px] font-mono text-text-muted mt-1">{agent.agentId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-cyan">{agent.activationState}</div>
                      <div className="text-[10px] font-mono text-text-muted mt-1">{agent.walletVerificationState}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-text-secondary space-y-1">
                    <div>Role: <span className="font-mono text-text-tertiary">{agent.role}</span></div>
                    <div>Path: <span className="font-mono text-text-tertiary">{agent.integrationPath}</span></div>
                    <div>Wallet: <span className="font-mono text-text-tertiary break-all">{agent.walletReference}</span></div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-text-muted">
                      Capabilities: {agent.capabilities.join(', ')}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyAgent(agent.agentId)}
                      disabled={isAlphaBusy || agent.walletVerificationState === 'verified'}
                      className="px-3 py-1.5 rounded-lg border border-emerald/25 bg-emerald/[0.08] text-emerald text-xs font-semibold disabled:opacity-50"
                    >
                      {agent.walletVerificationState === 'verified' ? 'Verified' : 'Verify wallet'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface/30 p-5 text-sm text-text-secondary">
            Create or select a workspace to inspect alpha agents.
          </div>
        )}
      </section>
    </div>
  )
}
