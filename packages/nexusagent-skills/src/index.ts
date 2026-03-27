/**
 * @nexusagent/skills — AI agent skills for NexusAgent
 *
 * Install: npx @nexusagent/skills init
 *
 * This package provides typed clients for connecting any AI agent
 * to the NexusAgent multi-agent commerce framework on X Layer.
 *
 * Skills:
 *   - nexusagent-signal:  Fetch live OKB market signal via OKX Onchain OS
 *   - nexusagent-workflow: Run a multi-agent workflow (signal → decision → execution → settlement)
 *   - nexusagent-proof:   Verify on-chain settlement proofs
 *   - nexusagent-wallet:  Check wallet status via Agentic Wallet API
 */

export interface NexusAgentConfig {
  /** NexusAgent backend URL (default: http://localhost:8787) */
  baseUrl?: string
  /** Workspace access key for authenticated endpoints */
  workspaceKey?: string
}

export interface OKBSignal {
  provider: 'okx_onchain_os' | 'okx_public_api'
  price: string
  change24h: string
  volume24h: string
  approved: boolean
  thresholdRule: string
  signalSummary: string
  capturedAt: string
}

export interface WorkflowResult {
  workflowRunId: string
  status: string
  signalProvider: string
  steps: Array<{ role: string; status: string; outputSummary: string }>
  settlement: { status: string; txHash: string; explorerUrl: string }
  payment: { mode: string; status: string; amount: string }
}

export interface SettlementProof {
  ok: boolean
  network: string
  txHash: string
  blockNumber: number | null
  receiptStatus: number | null
  checkedAt: string
  note: string
}

export class NexusAgentClient {
  private baseUrl: string
  private workspaceKey: string

  constructor(config: NexusAgentConfig = {}) {
    this.baseUrl = (config.baseUrl || 'http://localhost:8787').replace(/\/+$/, '')
    this.workspaceKey = config.workspaceKey || ''
  }

  private async fetch<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.workspaceKey ? { Authorization: `Bearer ${this.workspaceKey}` } : {}),
      ...((init?.headers as Record<string, string>) || {}),
    }
    const res = await globalThis.fetch(`${this.baseUrl}${path}`, { ...init, headers })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`NexusAgent API error ${res.status}: ${text}`)
    }
    return res.json() as Promise<T>
  }

  // ─── Skill: nexusagent-signal ───

  /** Fetch live OKB market signal from OKX Onchain OS Market API */
  async getOKBSignal(): Promise<OKBSignal> {
    const { signal } = await this.fetch<{ signal: OKBSignal }>('/api/signals/okb')
    return signal
  }

  /** Fetch premium OKB signal (requires x402 payment) */
  async getPremiumSignal(paymentProof?: string): Promise<unknown> {
    if (!paymentProof) {
      // Returns 402 with payment requirements
      const res = await globalThis.fetch(`${this.baseUrl}/api/signals/premium-okb`)
      if (res.status === 402) {
        return { status: 402, ...(await res.json() as object) }
      }
    }
    return this.fetch('/api/signals/premium-okb', {
      headers: { 'X-PAYMENT': paymentProof || '' },
    })
  }

  // ─── Skill: nexusagent-workflow ───

  /** Create a workspace for agent operations */
  async createWorkspace(name: string, slug: string): Promise<{ workspaceId: string; accessKey: string }> {
    const res = await this.fetch<{
      workspace: { workspaceId: string }
      workspaceAccess: { accessKey: string }
    }>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, slug, createdBy: 'nexusagent-skills' }),
    })
    this.workspaceKey = res.workspaceAccess.accessKey
    return { workspaceId: res.workspace.workspaceId, accessKey: res.workspaceAccess.accessKey }
  }

  /** Register and verify a canonical agent set (Sentinel, Arbiter, Executor, Evaluator) */
  async registerCanonicalAgents(workspaceId: string): Promise<string[]> {
    const agents = [
      { agentId: 'sentinel', name: 'Sentinel', role: 'signal_fetcher', capabilities: ['market_context'], supportedActions: ['fetch_market_context'] },
      { agentId: 'arbiter', name: 'Arbiter', role: 'decision_engine', capabilities: ['decisioning'], supportedActions: ['approve_or_reject_run'] },
      { agentId: 'executor', name: 'Executor', role: 'execution_engine', capabilities: ['execution'], supportedActions: ['bounded_stablecoin_transfer'] },
      { agentId: 'evaluator', name: 'Evaluator', role: 'verification_engine', capabilities: ['evaluation'], supportedActions: ['verify_outcome'] },
    ]
    const ids: string[] = []
    for (const a of agents) {
      await this.fetch(`/api/workspaces/${workspaceId}/agents`, {
        method: 'POST',
        body: JSON.stringify({
          ...a,
          ownerMemberId: 'skills-client',
          description: `NexusAgent ${a.name}`,
          integrationPath: 'skills',
          walletType: 'agentic_wallet',
          walletReference: `okx://wallet/${a.agentId}`,
        }),
      })
      await this.fetch(`/api/workspaces/${workspaceId}/agents/${a.agentId}/verify-wallet`, {
        method: 'POST',
        body: JSON.stringify({ verificationMethod: 'skills_attestation' }),
      })
      ids.push(a.agentId)
    }
    return ids
  }

  /** Run a workflow: signal → decision → execution → settlement */
  async runWorkflow(workspaceId: string, intent: string): Promise<WorkflowResult> {
    const res = await this.fetch<{
      workflow: {
        workflowRun: { workflowRunId: string; status: string; signalProvider: string }
        workflowSteps: Array<{ role: string; status: string; outputSummary: string }>
        settlement: { status: string; txHash: string; explorerUrl: string }
        payment: { mode: string; status: string; amount: string }
      }
    }>(`/api/workspaces/${workspaceId}/workflows`, {
      method: 'POST',
      body: JSON.stringify({
        workflowTemplateId: 'tpl_skills',
        intent,
        triggeredByMemberId: 'skills-client',
      }),
    })
    const w = res.workflow
    return {
      workflowRunId: w.workflowRun.workflowRunId,
      status: w.workflowRun.status,
      signalProvider: w.workflowRun.signalProvider,
      steps: w.workflowSteps.map((s) => ({ role: s.role, status: s.status, outputSummary: s.outputSummary })),
      settlement: w.settlement,
      payment: w.payment,
    }
  }

  // ─── Skill: nexusagent-proof ───

  /** Verify a settlement proof on X Layer */
  async verifyProof(txHash: string): Promise<SettlementProof> {
    return this.fetch<SettlementProof>(`/api/proof/${txHash}`)
  }

  // ─── Skill: nexusagent-wallet ───

  /** Check wallet reachability via OKX Onchain OS Wallet API */
  async checkWallet(address: string): Promise<{ ready: boolean; note: string }> {
    return this.fetch(`/api/integrations/wallet-status?address=${address}`)
  }

  // ─── Discovery ───

  /** Get NexusAgent A2A Agent Card */
  async discover(): Promise<unknown> {
    return this.fetch('/.well-known/agent.json')
  }

  /** Get integration status */
  async status(): Promise<unknown> {
    return this.fetch('/api/integrations/status')
  }
}

export default NexusAgentClient
