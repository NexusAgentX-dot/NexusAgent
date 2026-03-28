# Persistent Object Model

## Purpose
This file defines the minimum persistent objects required to move NexusAgent from demo mode to the live builder layer.

## Object 1: Workspace
### Purpose
Ownership boundary for agents, runs, proofs, and usage.

### Required fields
- `workspaceId`
- `name`
- `slug`
- `status`
- `createdAt`
- `updatedAt`

### Private alpha access fields
- `accessKeyHash` (backend-only)
- `accessKeyHint`

## Object 2: RegisteredAgent
### Purpose
Persistent record for an externally onboarded agent.

### Required fields
- `workspaceId`
- `agentId`
- `name`
- `description`
- `role`
- `integrationPath`
- `walletType`
- `walletReference`
- `capabilities`
- `supportedActions`
- `activationState`
- `walletVerificationState`
- `createdAt`
- `updatedAt`

## Object 3: WorkflowTemplate
### Purpose
Defines which bounded workflow families a workspace is allowed to run.

### Required fields
- `workflowTemplateId`
- `workspaceId`
- `name`
- `status`
- `allowedActions`
- `maxExecutionAmount`
- `requiredAgentRoles`

### Status values
- `draft`
- `active`
- `disabled`

## Object 4: WorkflowRunRecord
### Purpose
Persistent history entry for a workflow run.

### Required fields
- `workflowRunId`
- `workspaceId`
- `workflowTemplateId`
- `intent`
- `normalizedIntent`
- `status`
- `triggeredByMemberId`
- `requestedAt`
- `startedAt`
- `completedAt`
- `failureReason`
- `proofArtifactId`

### Status values
- `created`
- `running`
- `approved`
- `rejected`
- `settled`
- `failed`

## Object 5: WorkflowStepRecord
### Purpose
Persistent record for each agent step in a run.

### Required fields
- `workflowRunId`
- `stepId`
- `agentId`
- `role`
- `status`
- `inputSummary`
- `outputSummary`
- `startedAt`
- `completedAt`
- `errorCode`
- `errorMessage`

## Object 6: PaymentEventRecord
### Purpose
Persistent record for the payment-relevant event in a workflow.

### Required fields
- `paymentEventId`
- `workflowRunId`
- `workspaceId`
- `mode`
- `status`
- `amount`
- `currency`
- `source`
- `destination`
- `recordedAt`

## Object 7: ProofArtifact
### Purpose
Persistent record for explorer-verifiable settlement artifacts.

### Required fields
- `proofArtifactId`
- `workflowRunId`
- `workspaceId`
- `chain`
- `network`
- `txHash`
- `explorerUrl`
- `proofSummary`
- `capturedAt`

## Object 8: UsageLedgerEntry
### Purpose
Persistent commercial record for billable or non-billable usage.

### Required fields
- `usageEntryId`
- `workspaceId`
- `workflowRunId`
- `eventType`
- `billable`
- `unitCount`
- `unitType`
- `paymentEventId`
- `proofArtifactId`
- `recordedAt`

### Event type examples
- `workflow_run_requested`
- `signal_checked`
- `payment_event_recorded`
- `execution_attempted`
- `proof_captured`

## Alpha Persistence Rule
For this release, file-backed persistence is acceptable.
The persistence layer does not need database complexity yet.
It does need:
- stable IDs
- read after write behavior
- history retention
- workspace isolation
- workspace key verification for workspace-scoped reads and writes
