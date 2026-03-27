# Alpha API Shapes

## Purpose
This file defines the first API surface required for private builder alpha.

It does not replace the MVP demo API.
It extends the system into an externally usable shape.

## Endpoint Group A: Workspace
### Create workspace
`POST /api/workspaces`

#### Request
- `name`
- `slug`

#### Response
- `workspace`
- `workspaceAccess`

### Get workspace context
`GET /api/workspaces/:workspaceId/context`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Response
- `workspace`

## Endpoint Group B: Registered Agents
### List agents for workspace
`GET /api/workspaces/:workspaceId/agents`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Response
- `agents`

### Register agent for workspace
`POST /api/workspaces/:workspaceId/agents`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Request
- all registration fields from `AGENT_ONBOARDING_CONTRACT.md`

#### Response
- `agent`
- `registrationStatus`

### Verify wallet for agent
`POST /api/workspaces/:workspaceId/agents/:agentId/verify-wallet`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Request
- `verificationMethod`
- `verificationPayload`

#### Response
- `agentId`
- `walletVerificationState`
- `activationState`

## Endpoint Group C: Workflow Runs
### Create workflow run
`POST /api/workspaces/:workspaceId/workflows`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Request
- `workflowTemplateId`
- `intent`
- `requestedAgentIds` (optional when the server should auto-select one active verified agent per canonical role)

#### Response
- `workflowRun`

### List workflow runs
`GET /api/workspaces/:workspaceId/workflows`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Query
- `status`
- `limit`

#### Response
- `workflowRuns`

### Get workflow run
`GET /api/workspaces/:workspaceId/workflows/:workflowRunId`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Response
- `workflowRun`
- `workflowSteps`
- `payment`
- `settlement`

## Endpoint Group D: Proof
### Get proof for workflow run
`GET /api/workspaces/:workspaceId/workflows/:workflowRunId/proof`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Response
- `proofArtifact`
- `evaluation`

## Endpoint Group E: Usage
### List usage ledger entries
`GET /api/workspaces/:workspaceId/usage`

#### Auth
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

#### Query
- `workflowRunId`
- `billable`
- `limit`

#### Response
- `entries`

## External Alpha Rules
### Rule 1
All external alpha endpoints must be workspace-scoped.

### Rule 1A
All workspace-scoped external alpha endpoints must require a workspace key.

### Rule 2
Workflow execution endpoints must reject unverified or inactive agents.

### Rule 3
History endpoints must never return proof or usage from another workspace.

### Rule 4
The demo API may continue to exist during alpha, but alpha endpoints become the preferred product API.
