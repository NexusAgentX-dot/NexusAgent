import type {
  AlphaAgent,
  AlphaWorkflowDetail,
  AlphaWorkflowRunRecord,
  OnboardingAgent,
  OnboardingTemplate,
  UsageLedgerEntry,
  WorkflowRun,
  Workspace,
  WorkspaceAccess,
} from '../types/workflow'
import { demoApprovedRun, demoRejectedRun } from '../data/demo'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

function resolveApiBaseUrl() {
  const configured = API_BASE_URL.trim()
  if (configured === '') {
    return '/api'
  }

  if (configured.endsWith('/api')) {
    return configured
  }

  return `${configured.replace(/\/+$/, '')}/api`
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function workspaceHeaders(accessKey?: string, extraHeaders?: HeadersInit) {
  return {
    ...(extraHeaders ?? {}),
    ...(accessKey
      ? {
          Authorization: `Bearer ${accessKey}`,
          'X-NexusAgent-Workspace-Key': accessKey,
        }
      : {}),
  }
}

export interface IntegrationStatusItem {
  label: string
  detail: string
  status: string
  color: string
}

export async function getIntegrationStatus(): Promise<IntegrationStatusItem[] | null> {
  try {
    const payload = await fetchJson<{ integrations: IntegrationStatusItem[] }>('/integrations/status')
    return payload.integrations
  } catch {
    return null
  }
}

export async function getOKBSignal(): Promise<{
  provider: string; price: string; change24h: string; volume24h: string; approved: boolean
} | null> {
  try {
    const payload = await fetchJson<{ signal: { provider: string; price: string; change24h: string; volume24h: string; approved: boolean } }>('/signals/okb')
    return payload.signal
  } catch {
    return null
  }
}

export async function getDemoWorkflow(mode: 'approved' | 'rejected'): Promise<WorkflowRun> {
  try {
    const payload = await fetchJson<{ workflowRun: WorkflowRun }>(`/workflow/demo?mode=${mode}`)
    return payload.workflowRun
  } catch {
    return mode === 'approved' ? demoApprovedRun : demoRejectedRun
  }
}

export async function getOnboardingTemplate(): Promise<OnboardingTemplate | null> {
  try {
    return await fetchJson<OnboardingTemplate>('/onboarding/template')
  } catch {
    return null
  }
}

export async function getAgents(): Promise<OnboardingAgent[]> {
  try {
    const payload = await fetchJson<{ agents: OnboardingAgent[] }>('/agents')
    return payload.agents
  } catch {
    return []
  }
}

export async function createWorkspace(input: { name: string; slug: string; createdBy?: string }) {
  return fetchJson<{ workspace: Workspace; workspaceAccess: WorkspaceAccess }>('/workspaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
}

export async function getWorkspaceContext(workspaceId: string, accessKey: string) {
  return fetchJson<{ workspace: Workspace }>(`/workspaces/${workspaceId}/context`, {
    headers: workspaceHeaders(accessKey),
  })
}

export async function getWorkspaceAgents(workspaceId: string, accessKey: string): Promise<AlphaAgent[]> {
  const payload = await fetchJson<{ agents: AlphaAgent[] }>(`/workspaces/${workspaceId}/agents`, {
    headers: workspaceHeaders(accessKey),
  })
  return payload.agents
}

export async function registerWorkspaceAgent(
  workspaceId: string,
  accessKey: string,
  input: Omit<
    AlphaAgent,
    'workspaceId' | 'activationState' | 'walletVerificationState' | 'createdAt' | 'updatedAt'
  >,
) {
  return fetchJson<{ agent: AlphaAgent; registrationStatus: string }>(`/workspaces/${workspaceId}/agents`, {
    method: 'POST',
    headers: workspaceHeaders(accessKey, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(input),
  })
}

export async function verifyWorkspaceAgentWallet(workspaceId: string, accessKey: string, agentId: string) {
  return fetchJson<{
    agentId: string
    walletVerificationState: AlphaAgent['walletVerificationState']
    activationState: AlphaAgent['activationState']
  }>(`/workspaces/${workspaceId}/agents/${agentId}/verify-wallet`, {
    method: 'POST',
    headers: workspaceHeaders(accessKey, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      verificationMethod: 'frontend_demo_attestation',
      verificationPayload: {
        source: 'frontend',
      },
    }),
  })
}

export async function createAlphaWorkflowRun(
  workspaceId: string,
  accessKey: string,
  input: {
    workflowTemplateId: string
    intent: string
    requestedAgentIds?: string[]
    triggeredByMemberId: string
  },
) {
  return fetchJson<{ workflow: AlphaWorkflowDetail }>(`/workspaces/${workspaceId}/workflows`, {
    method: 'POST',
    headers: workspaceHeaders(accessKey, {
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(input),
  })
}

export async function getAlphaWorkflowRuns(workspaceId: string, accessKey: string): Promise<AlphaWorkflowRunRecord[]> {
  const payload = await fetchJson<{ workflowRuns: AlphaWorkflowRunRecord[] }>(
    `/workspaces/${workspaceId}/workflows`,
    {
      headers: workspaceHeaders(accessKey),
    },
  )
  return payload.workflowRuns
}

export async function getAlphaWorkflowDetail(workspaceId: string, accessKey: string, workflowRunId: string) {
  return fetchJson<{ workflow: AlphaWorkflowDetail }>(
    `/workspaces/${workspaceId}/workflows/${workflowRunId}`,
    {
      headers: workspaceHeaders(accessKey),
    },
  )
}

export async function getAlphaUsage(workspaceId: string, accessKey: string): Promise<UsageLedgerEntry[]> {
  const payload = await fetchJson<{ entries: UsageLedgerEntry[] }>(`/workspaces/${workspaceId}/usage`, {
    headers: workspaceHeaders(accessKey),
  })
  return payload.entries
}

export interface UsageSummary {
  totalRuns: number
  totalBillableAmount: string
  billableCurrency: string
  breakdown: Record<string, { count: number; amount: string }>
}

export async function getUsageSummary(workspaceId: string, accessKey: string): Promise<UsageSummary | null> {
  try {
    return await fetchJson<UsageSummary>(`/workspaces/${workspaceId}/usage/summary`, {
      headers: workspaceHeaders(accessKey),
    })
  } catch {
    return null
  }
}
