import {
  alphaAgentRecordSchema,
  alphaWorkflowDetailResponseSchema,
  alphaWorkflowRunRecordSchema,
  createWorkspaceResponseSchema,
  agentsResponseSchema,
  onboardingTemplateSchema,
  proofResponseSchema,
  usageLedgerResponseSchema,
  verifyWalletResponseSchema,
  workflowResponseSchema,
  workspaceSchema,
} from './contracts.js'
import { canonicalAgents, onboardingTemplate } from './demo/onboarding.js'
import { approvedWorkflowRun, rejectedWorkflowRun } from './demo/workflowData.js'

function assertValid() {
  workflowResponseSchema.parse({ workflowRun: approvedWorkflowRun })
  workflowResponseSchema.parse({ workflowRun: rejectedWorkflowRun })
  onboardingTemplateSchema.parse(onboardingTemplate)
  agentsResponseSchema.parse({ agents: canonicalAgents })

  const approvedEvaluator = approvedWorkflowRun.agents.find((agent) => agent.name === 'Evaluator')
  if (!approvedEvaluator) {
    throw new Error('Missing Evaluator agent in approved workflow')
  }

  proofResponseSchema.parse({
    workflowId: approvedWorkflowRun.id,
    settlement: approvedWorkflowRun.settlement,
    payment: approvedWorkflowRun.payment,
    evaluation: {
      agentName: approvedEvaluator.name,
      status: approvedEvaluator.status,
      summary: approvedEvaluator.summary,
      output: approvedEvaluator.output,
    },
  })

  const sampleWorkspace = workspaceSchema.parse({
    workspaceId: 'ws_alpha_demo',
    name: 'Alpha Workspace',
    slug: 'alpha-workspace',
    status: 'active',
    createdAt: approvedWorkflowRun.createdAt,
    updatedAt: approvedWorkflowRun.updatedAt,
    createdBy: 'workspace_owner',
  })

  createWorkspaceResponseSchema.parse({
    workspace: sampleWorkspace,
    workspaceAccess: {
      authScheme: 'workspace_key',
      accessKey: 'nxa_ws_sample_key',
      keyHint: 'nxa_ws…_key',
      issuedAt: approvedWorkflowRun.createdAt,
    },
  })

  const sampleAlphaAgent = alphaAgentRecordSchema.parse({
    workspaceId: sampleWorkspace.workspaceId,
    agentId: 'sentinel_alpha_001',
    ownerMemberId: 'workspace_owner',
    name: 'Sentinel Alpha',
    description: 'Alpha-registered signal agent.',
    role: 'signal_fetcher',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'okx://agentic-wallet/sentinel-alpha',
    capabilities: ['market_context'],
    supportedActions: ['signal_check'],
    activationState: 'active',
    walletVerificationState: 'verified',
    createdAt: approvedWorkflowRun.createdAt,
    updatedAt: approvedWorkflowRun.updatedAt,
  })

  alphaAgentRecordSchema.parse(sampleAlphaAgent)

  verifyWalletResponseSchema.parse({
    agentId: sampleAlphaAgent.agentId,
    walletVerificationState: 'verified',
    activationState: 'active',
  })

  const sampleAlphaWorkflowRun = alphaWorkflowRunRecordSchema.parse({
    workflowRunId: 'wf_alpha_001',
    workspaceId: sampleWorkspace.workspaceId,
    workflowTemplateId: 'tpl_xlayer_signal_gate',
    intent: 'Run a bounded workflow if X Layer network conditions are within threshold.',
    normalizedIntent: 'run_a_bounded_workflow_if_xlayer_network_conditions_are_within_threshold',
    status: 'approved',
    triggeredByMemberId: 'workspace_owner',
    requestedAt: approvedWorkflowRun.createdAt,
    startedAt: approvedWorkflowRun.createdAt,
    completedAt: approvedWorkflowRun.updatedAt,
    failureReason: '',
    proofArtifactId: '',
    paymentEventId: 'pay_alpha_001',
    signalProvider: 'xlayer_rpc',
  })

  alphaWorkflowDetailResponseSchema.parse({
    workflow: {
      workflowRun: sampleAlphaWorkflowRun,
      workflowSteps: [
        {
          workflowRunId: sampleAlphaWorkflowRun.workflowRunId,
          stepId: 'step_signal',
          agentId: sampleAlphaAgent.agentId,
          role: 'signal_fetcher',
          status: 'completed',
          inputSummary: 'Fetch live X Layer network signal.',
          outputSummary: 'Signal succeeded.',
          startedAt: approvedWorkflowRun.createdAt,
          completedAt: approvedWorkflowRun.updatedAt,
          errorCode: '',
          errorMessage: '',
        },
      ],
      payment: approvedWorkflowRun.payment,
      settlement: approvedWorkflowRun.settlement,
      evaluation: {
        agentName: 'Evaluator',
        status: 'completed',
        summary: 'Verified the sample alpha workflow payload.',
        output: { result: 'pass' },
      },
      proofArtifact: null,
    },
  })

  usageLedgerResponseSchema.parse({
    entries: [
      {
        usageEntryId: 'usage_alpha_001',
        workspaceId: sampleWorkspace.workspaceId,
        workflowRunId: sampleAlphaWorkflowRun.workflowRunId,
        eventType: 'workflow_run_requested',
        billable: false,
        unitCount: 1,
        unitType: 'run',
        paymentEventId: 'pay_alpha_001',
        proofArtifactId: '',
        recordedAt: approvedWorkflowRun.createdAt,
      },
    ],
  })
}

assertValid()
console.log('Backend demo payloads validated successfully.')
