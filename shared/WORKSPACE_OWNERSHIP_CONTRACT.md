# Workspace Ownership Contract

## Purpose
This file defines the minimum ownership and activation model required before NexusAgent can be externally usable.

## Core Principle
Every external action in NexusAgent must belong to a workspace.

No external agent, wallet reference, workflow run, or proof artifact should exist without a workspace owner.
No workspace-scoped action should execute without a workspace access key.

## Workspace Object
### Required fields
- `workspaceId`
- `name`
- `slug`
- `status`
- `createdAt`
- `createdBy`

### Access bootstrap
- each newly created workspace is issued one `workspace_key`
- the raw key is returned exactly once at workspace creation time
- the backend stores only a hash and hint for future verification
- the frontend stores the raw key locally for private alpha use

### Status values
- `draft`
- `active`
- `suspended`

## Workspace Member Object
### Required fields
- `workspaceId`
- `memberId`
- `role`
- `status`

### Role values
- `owner`
- `operator`
- `viewer`

### Status values
- `active`
- `invited`
- `disabled`

## Agent Ownership Rules
Every registered agent must include:
- `workspaceId`
- `agentId`
- `ownerMemberId`
- `activationState`
- `walletVerificationState`

An agent cannot become externally usable unless it belongs to exactly one workspace.

## Activation State
### Values
- `draft`
- `verified`
- `active`
- `disabled`

### Rules
- `draft`: registration submitted, not yet verified
- `verified`: wallet reference and required metadata verified
- `active`: eligible for workflow assignment
- `disabled`: blocked from assignment and execution

## Wallet Verification State
### Values
- `unverified`
- `pending`
- `verified`
- `failed`

### Rules
- no workflow execution is allowed while wallet verification is not `verified`
- activation cannot move to `active` before wallet verification is `verified`

## Workflow Trigger Ownership Rules
A workflow run request must include:
- `workspaceId`
- `triggeredByMemberId`
- `requestedAgentIds`

And it must be authenticated with:
- `Authorization: Bearer <workspace_key>`
or
- `X-NexusAgent-Workspace-Key: <workspace_key>`

The system must reject a workflow request if:
- the workspace is not `active`
- the triggering member is not `owner` or `operator`
- any requested agent is not `active`

## Proof Ownership Rules
Every proof artifact must include:
- `workspaceId`
- `workflowRunId`
- `visibility`

### Visibility values
- `workspace`
- `internal`

The default for external alpha should be:
- `workspace`

## Minimum External-Usable Guarantee
An external builder must be able to answer:
- which workspace owns this agent
- who can trigger this workflow
- whether this wallet has been verified
- whether this proof belongs to this workspace
