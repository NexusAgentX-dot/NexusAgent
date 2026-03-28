import { z } from 'zod'

export const workflowStatusValues = [
  'IntentReceived',
  'SignalFetched',
  'DecisionMade',
  'ActionPrepared',
  'PaymentTriggered',
  'ActionExecuted',
  'ResultEvaluated',
  'Settled',
] as const

export const agentRoleValues = [
  'signal_fetcher',
  'decision_engine',
  'execution_engine',
  'verification_engine',
] as const

export const agentStatusValues = ['idle', 'running', 'completed', 'failed', 'skipped'] as const

export const workflowEventTypeValues = [
  'intent_received',
  'signal_fetched',
  'decision_made',
  'action_prepared',
  'payment_triggered',
  'action_executed',
  'result_evaluated',
  'settlement_recorded',
] as const

export const paymentModeValues = [
  'x402_live',
  'transfer_event',
  'x402_compatible_demo', // legacy: kept for backward compat with stored alpha data
] as const

export const paymentStatusValues = ['pending', 'recorded', 'completed', 'failed'] as const

export const settlementStatusValues = ['pending', 'confirmed', 'failed'] as const

export const integrationPathValues = ['skills', 'mcp', 'open_api'] as const
export const walletTypeValues = ['agentic_wallet', 'external_wallet'] as const
export const agentRegistrationStatusValues = ['active', 'draft'] as const
export const workspaceStatusValues = ['draft', 'active', 'suspended'] as const
export const workspaceMemberRoleValues = ['owner', 'operator', 'viewer'] as const
export const activationStateValues = ['draft', 'active', 'disabled'] as const
// Zod parsing accepts legacy 'verified' and normalizes it at the store read boundary.
export const walletVerificationStateValues = ['pending', 'accepted', 'failed'] as const
// Broader sets accepted during parsing to handle legacy stored data:
const activationStateParseValues = ['draft', 'verified', 'active', 'disabled'] as const
const walletVerificationStateParseValues = ['unverified', 'pending', 'accepted', 'verified', 'failed'] as const
export const alphaWorkflowRunStatusValues = [
  'created',
  'running',
  'approved',
  'rejected',
  'settled',
  'failed',
] as const
export const alphaWorkflowStepStatusValues = ['pending', 'running', 'completed', 'failed', 'skipped'] as const

export const workflowIntentSchema = z.object({
  raw: z.string().min(1),
  normalized: z.string().min(1),
})

export const agentRunSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(agentRoleValues),
  status: z.enum(agentStatusValues),
  summary: z.string(),
  input: z.record(z.string(), z.unknown()),
  output: z.record(z.string(), z.unknown()),
  startedAt: z.string(),
  completedAt: z.string(),
})

export const workflowEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum(workflowEventTypeValues),
  title: z.string().min(1),
  description: z.string().min(1),
  timestamp: z.string().min(1),
})

export const paymentRecordSchema = z.object({
  mode: z.enum(paymentModeValues),
  status: z.enum(paymentStatusValues),
  amount: z.string().min(1),
  currency: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  reference: z.string().min(1),
})

export const settlementRecordSchema = z.object({
  chain: z.string().min(1),
  status: z.enum(settlementStatusValues),
  txHash: z.string(),
  explorerUrl: z.string(),
  proofSummary: z.string().min(1),
})

export const workflowRunSchema = z.object({
  id: z.string().min(1),
  intent: workflowIntentSchema,
  status: z.enum(workflowStatusValues),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  agents: z.array(agentRunSchema),
  events: z.array(workflowEventSchema),
  payment: paymentRecordSchema,
  settlement: settlementRecordSchema,
})

export const agentMessageEnvelopeSchema = z.object({
  messageId: z.string().min(1),
  workflowId: z.string().min(1),
  fromAgent: z.string().min(1),
  toAgent: z.string().min(1),
  state: z.enum(workflowStatusValues),
  payloadType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1),
})

export const onboardingPathSchema = z.object({
  id: z.enum(integrationPathValues),
  label: z.string().min(1),
  badge: z.string().min(1),
  description: z.string().min(1),
  walletType: z.enum(walletTypeValues),
})

export const onboardingFieldSchema = z.object({
  field: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
})

export const onboardingTemplateSchema = z.object({
  supportedPaths: z.array(onboardingPathSchema),
  requiredFields: z.array(onboardingFieldSchema),
  capabilityOptions: z.array(z.string().min(1)),
})

export const registeredAgentSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.enum(agentRoleValues),
  integrationPath: z.enum(integrationPathValues),
  walletType: z.enum(walletTypeValues),
  walletReference: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  supportedActions: z.array(z.string().min(1)).min(1),
  status: z.enum(agentRegistrationStatusValues),
})

export const registerAgentRequestSchema = registeredAgentSchema.omit({ status: true })

export const workspaceSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(workspaceStatusValues),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  createdBy: z.string().min(1),
})

export const workspaceAccessSchema = z.object({
  authScheme: z.literal('workspace_key'),
  accessKey: z.string().min(1),
  keyHint: z.string().min(1),
  issuedAt: z.string().min(1),
})

export const createWorkspaceRequestSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens.'),
  createdBy: z.string().min(1).optional(),
})

export const createWorkspaceResponseSchema = z.object({
  workspace: workspaceSchema,
  workspaceAccess: workspaceAccessSchema,
})

export const listWorkspacesResponseSchema = z.object({
  workspaces: z.array(workspaceSchema),
})

export const workspaceContextResponseSchema = z.object({
  workspace: workspaceSchema,
})

export const alphaAgentRecordSchema = z.object({
  workspaceId: z.string().min(1),
  agentId: z.string().min(1),
  ownerMemberId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.enum(agentRoleValues),
  integrationPath: z.enum(integrationPathValues),
  walletType: z.enum(walletTypeValues),
  walletReference: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  supportedActions: z.array(z.string().min(1)).min(1),
  activationState: z.enum(activationStateParseValues),
  walletVerificationState: z.enum(walletVerificationStateParseValues),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const alphaAgentRegistrationRequestSchema = z.object({
  agentId: z.string().min(1),
  ownerMemberId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  role: z.enum(agentRoleValues),
  integrationPath: z.enum(integrationPathValues),
  walletType: z.enum(walletTypeValues),
  walletReference: z.string().min(1),
  capabilities: z.array(z.string().min(1)).min(1),
  supportedActions: z.array(z.string().min(1)).min(1),
})

export const alphaAgentRegistrationResponseSchema = z.object({
  agent: alphaAgentRecordSchema,
  registrationStatus: z.enum(['registered_demo', 'registered_live']),
})

export const alphaAgentsResponseSchema = z.object({
  agents: z.array(alphaAgentRecordSchema),
})

export const verifyWalletRequestSchema = z.object({
  verificationMethod: z.string().min(1),
  verificationPayload: z.record(z.string(), z.unknown()).optional(),
})

export const verifyWalletResponseSchema = z.object({
  agentId: z.string().min(1),
  walletVerificationState: z.enum(walletVerificationStateValues),
  activationState: z.enum(activationStateValues),
})

export const alphaWorkflowRunRecordSchema = z.object({
  workflowRunId: z.string().min(1),
  workspaceId: z.string().min(1),
  workflowTemplateId: z.string().min(1),
  intent: z.string().min(1),
  normalizedIntent: z.string().min(1),
  status: z.enum(alphaWorkflowRunStatusValues),
  triggeredByMemberId: z.string().min(1),
  requestedAt: z.string().min(1),
  startedAt: z.string(),
  completedAt: z.string(),
  failureReason: z.string(),
  proofArtifactId: z.string(),
  paymentEventId: z.string(),
  signalProvider: z.string().min(1),
})

export const alphaWorkflowStepRecordSchema = z.object({
  workflowRunId: z.string().min(1),
  stepId: z.string().min(1),
  agentId: z.string().min(1),
  role: z.enum(agentRoleValues),
  status: z.enum(alphaWorkflowStepStatusValues),
  inputSummary: z.string(),
  outputSummary: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  errorCode: z.string(),
  errorMessage: z.string(),
})

export const proofArtifactSchema = z.object({
  proofArtifactId: z.string().min(1),
  workflowRunId: z.string().min(1),
  workspaceId: z.string().min(1),
  chain: z.string().min(1),
  network: z.string().min(1),
  txHash: z.string(),
  explorerUrl: z.string(),
  proofSummary: z.string().min(1),
  capturedAt: z.string().min(1),
})

export const usageLedgerEntrySchema = z.object({
  usageEntryId: z.string().min(1),
  workspaceId: z.string().min(1),
  workflowRunId: z.string().min(1),
  eventType: z.string().min(1),
  billable: z.boolean(),
  unitCount: z.number().nonnegative(),
  unitType: z.string().min(1),
  paymentEventId: z.string(),
  proofArtifactId: z.string(),
  recordedAt: z.string().min(1),
  billableAmount: z.string().optional(),
  billableCurrency: z.string().optional(),
})

export const alphaWorkflowEvaluationSchema = z.object({
  agentName: z.string().min(1),
  status: z.enum(agentStatusValues),
  summary: z.string().min(1),
  output: z.record(z.string(), z.unknown()),
})

export const alphaWorkflowDetailSchema = z.object({
  workflowRun: alphaWorkflowRunRecordSchema,
  workflowSteps: z.array(alphaWorkflowStepRecordSchema),
  payment: paymentRecordSchema,
  settlement: settlementRecordSchema,
  evaluation: alphaWorkflowEvaluationSchema.nullable(),
  proofArtifact: proofArtifactSchema.nullable(),
})

export const createAlphaWorkflowRequestSchema = z.object({
  workflowTemplateId: z.string().min(1),
  intent: z.string().min(1),
  requestedAgentIds: z.array(z.string().min(1)).min(1).optional(),
  triggeredByMemberId: z.string().min(1),
})

export const listAlphaWorkflowRunsResponseSchema = z.object({
  workflowRuns: z.array(alphaWorkflowRunRecordSchema),
})

export const alphaWorkflowDetailResponseSchema = z.object({
  workflow: alphaWorkflowDetailSchema,
})

export const alphaProofResponseSchema = z.object({
  proofArtifact: proofArtifactSchema.nullable(),
  evaluation: alphaWorkflowEvaluationSchema.nullable(),
})

export const usageLedgerResponseSchema = z.object({
  entries: z.array(usageLedgerEntrySchema),
})

export const registerAgentResponseSchema = z.object({
  agent: registeredAgentSchema,
  registrationStatus: z.enum(['registered_demo', 'registered_live']),
})

export const agentsResponseSchema = z.object({
  agents: z.array(registeredAgentSchema),
})

export const workflowResponseSchema = z.object({
  workflowRun: workflowRunSchema,
})

export const createIntentRequestSchema = z.object({
  intent: z.string().min(1),
  mode: z.enum(['approved', 'rejected']).optional(),
})

export const proofResponseSchema = z.object({
  workflowId: z.string().min(1),
  settlement: settlementRecordSchema,
  payment: paymentRecordSchema,
  evaluation: z.object({
    agentName: z.string().min(1),
    status: z.enum(agentStatusValues),
    summary: z.string().min(1),
    output: z.record(z.string(), z.unknown()),
  }),
})

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('nexusagent-backend'),
  timestamp: z.string().min(1),
})

export type WorkflowRun = z.infer<typeof workflowRunSchema>
export type RegisteredAgent = z.infer<typeof registeredAgentSchema>
export type OnboardingTemplate = z.infer<typeof onboardingTemplateSchema>
export type AgentMessageEnvelope = z.infer<typeof agentMessageEnvelopeSchema>
export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceAccess = z.infer<typeof workspaceAccessSchema>
export type AlphaAgentRecord = z.infer<typeof alphaAgentRecordSchema>
export type AlphaWorkflowRunRecord = z.infer<typeof alphaWorkflowRunRecordSchema>
export type AlphaWorkflowStepRecord = z.infer<typeof alphaWorkflowStepRecordSchema>
export type ProofArtifact = z.infer<typeof proofArtifactSchema>
export type UsageLedgerEntry = z.infer<typeof usageLedgerEntrySchema>
