export type WorkflowStatus =
  | 'IntentReceived'
  | 'SignalFetched'
  | 'DecisionMade'
  | 'ActionPrepared'
  | 'PaymentTriggered'
  | 'ActionExecuted'
  | 'ResultEvaluated'
  | 'Settled'

export type AgentRole = 'signal_fetcher' | 'decision_engine' | 'execution_engine' | 'verification_engine'
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'skipped'

export interface AgentOutput {
  id: string
  name: string
  role: AgentRole
  status: AgentStatus
  summary: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  startedAt: string
  completedAt: string
}

export type EventType =
  | 'intent_received'
  | 'signal_fetched'
  | 'decision_made'
  | 'action_prepared'
  | 'payment_triggered'
  | 'action_executed'
  | 'result_evaluated'
  | 'settlement_recorded'

export type PaymentMode =
  | 'x402_live'
  | 'x402_compatible_demo'
  | 'escrow_demo'
  | 'transfer_event'

export type PaymentStatus = 'pending' | 'recorded' | 'completed' | 'failed'

export type SettlementStatus = 'pending' | 'confirmed' | 'failed'

export interface WorkflowEvent {
  id: string
  type: EventType
  title: string
  description: string
  timestamp: string
}

export interface Payment {
  mode: PaymentMode
  status: PaymentStatus
  amount: string
  currency: string
  source: string
  destination: string
  reference: string
}

export interface Settlement {
  chain: string
  status: SettlementStatus
  txHash: string
  explorerUrl: string
  proofSummary: string
}

export interface WorkflowIntent {
  raw: string
  normalized: string
}

export interface WorkflowRun {
  id: string
  intent: WorkflowIntent
  status: WorkflowStatus
  createdAt: string
  updatedAt: string
  agents: AgentOutput[]
  events: WorkflowEvent[]
  payment: Payment
  settlement: Settlement
}

export type IntegrationPath = 'skills' | 'mcp' | 'open_api'
export type WalletType = 'agentic_wallet' | 'external_wallet'

export interface OnboardingPathOption {
  id: IntegrationPath
  label: string
  badge: string
  description: string
  walletType: WalletType
}

export interface OnboardingFieldDefinition {
  field: string
  type: string
  description: string
}

export interface OnboardingAgent {
  agentId: string
  name: string
  description: string
  role: AgentRole
  integrationPath: IntegrationPath
  walletType: WalletType
  walletReference: string
  capabilities: string[]
  supportedActions: string[]
  status: 'active' | 'draft'
}

export interface OnboardingTemplate {
  supportedPaths: OnboardingPathOption[]
  requiredFields: OnboardingFieldDefinition[]
  capabilityOptions: string[]
}

export type WorkspaceStatus = 'draft' | 'active' | 'suspended'
export type ActivationState = 'draft' | 'verified' | 'active' | 'disabled'
export type WalletVerificationState = 'unverified' | 'pending' | 'verified' | 'failed'
export type AlphaWorkflowRunStatus = 'created' | 'running' | 'approved' | 'rejected' | 'settled' | 'failed'
export type AlphaWorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

export interface Workspace {
  workspaceId: string
  name: string
  slug: string
  status: WorkspaceStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface WorkspaceAccess {
  authScheme: 'workspace_key'
  accessKey: string
  keyHint: string
  issuedAt: string
}

export interface WorkspaceCredential {
  workspace: Workspace
  workspaceAccess: WorkspaceAccess
  savedAt: string
}

export interface AlphaAgent {
  workspaceId: string
  agentId: string
  ownerMemberId: string
  name: string
  description: string
  role: AgentRole
  integrationPath: IntegrationPath
  walletType: WalletType
  walletReference: string
  capabilities: string[]
  supportedActions: string[]
  activationState: ActivationState
  walletVerificationState: WalletVerificationState
  createdAt: string
  updatedAt: string
}

export interface AlphaWorkflowRunRecord {
  workflowRunId: string
  workspaceId: string
  workflowTemplateId: string
  intent: string
  normalizedIntent: string
  status: AlphaWorkflowRunStatus
  triggeredByMemberId: string
  requestedAt: string
  startedAt: string
  completedAt: string
  failureReason: string
  proofArtifactId: string
  paymentEventId: string
  signalProvider: string
}

export interface AlphaWorkflowStepRecord {
  workflowRunId: string
  stepId: string
  agentId: string
  role: AgentRole
  status: AlphaWorkflowStepStatus
  inputSummary: string
  outputSummary: string
  startedAt: string
  completedAt: string
  errorCode: string
  errorMessage: string
}

export interface ProofArtifact {
  proofArtifactId: string
  workflowRunId: string
  workspaceId: string
  chain: string
  network: string
  txHash: string
  explorerUrl: string
  proofSummary: string
  capturedAt: string
}

export interface UsageLedgerEntry {
  usageEntryId: string
  workspaceId: string
  workflowRunId: string
  eventType: string
  billable: boolean
  unitCount: number
  unitType: string
  paymentEventId: string
  proofArtifactId: string
  recordedAt: string
}

export interface AlphaEvaluation {
  agentName: string
  status: AgentStatus
  summary: string
  output: Record<string, unknown>
}

export interface AlphaWorkflowDetail {
  workflowRun: AlphaWorkflowRunRecord
  workflowSteps: AlphaWorkflowStepRecord[]
  payment: Payment
  settlement: Settlement
  evaluation: AlphaEvaluation | null
  proofArtifact: ProofArtifact | null
}
