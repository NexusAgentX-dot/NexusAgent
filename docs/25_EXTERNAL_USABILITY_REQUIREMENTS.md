# 25 External Usability Requirements

## Purpose
This file defines what NexusAgent must support before an external builder or operator can use it without direct human guidance from us.

## Product Standard
An external user should be able to:
1. understand what NexusAgent does
2. create or connect an agent
3. verify ownership of the agent wallet
4. run a workflow safely
5. inspect history and proof
6. understand what happened when something fails

If any of those are missing, the product is still internal-only.

## Requirement Group A: Account And Workspace Layer
### Why it matters
Commercial usage starts with ownership boundaries.

### Required
- team or workspace identity
- who owns which agents
- who can trigger workflows
- who can view proofs

### Current state
- partially implemented in backend
- workspace key model now exists for private alpha
- no full user account system yet

### Minimum acceptable implementation
- a lightweight workspace id
- agent records scoped to that workspace
- proof and workflow history scoped to that workspace
- one workspace key required for workspace-scoped API access

## Requirement Group B: Persistent Agent Registry
### Why it matters
The current agent list is canonical demo data, not a live registry.

### Required
- persistent agent registration
- unique `agentId`
- stored capabilities
- stored supported actions
- integration path status
- wallet reference

### Current state
- partially implemented
- file-backed create and list now exist
- no edit, delete, or external auth boundaries yet

### Minimum acceptable implementation
- file-backed or database-backed registry
- create, read, and list for real records
- collision checks for `agentId`

## Requirement Group C: Wallet Ownership And Activation
### Why it matters
Builder onboarding is meaningless if the agent wallet cannot be verified or safely activated.

### Required
- declared wallet type
- wallet ownership confirmation
- clear activation status
- bounded execution permissions

### Current state
- contract exists
- wallet verification and activation control now exist in backend alpha endpoints
- verification is state-based, not cryptographic yet

### Minimum acceptable implementation
- wallet verification step
- activation state: `draft`, `verified`, `active`
- execution blocked unless verified

## Requirement Group D: Live Workflow Input Path
### Why it matters
External users need to run something real, not only inspect a demo payload.

### Required
- workflow creation from user intent
- one live signal or data retrieval step
- one bounded execution policy
- one clear rejected path

### Current state
- live X Layer RPC signal path exists for the alpha workflow API
- alpha workflow creation is exposed to external builders through workspace-scoped endpoints
- the dashboard now shows readiness, history, usage, and selected run detail for the alpha path
- approved alpha runs can optionally produce a bounded live testnet settlement artifact when explicit execution env is enabled

### Minimum acceptable implementation
- live Sentinel step for one production-relevant signal
- Arbiter applies a real threshold rule
- Executor only runs when rule passes

## Requirement Group E: Workflow History And Observability
### Why it matters
No outside user will trust a system they cannot inspect after the fact.

### Required
- workflow run history
- status per run
- timestamps
- proof link
- failure reason

### Current state
- only current approved and rejected demo runs
- alpha workflow runs can now be persisted and listed per workspace
- selected alpha workflow detail can now be inspected in the product surface
- richer filters and failure analytics do not exist yet

### Minimum acceptable implementation
- persistent run records
- list runs endpoint
- individual run detail endpoint

## Requirement Group F: Failure Handling
### Why it matters
Products fail in public.
Demo systems avoid failure.

### Required
- invalid onboarding errors
- live workflow failure states
- failed payment event states
- failed execution states
- human-readable remediation hints

### Current state
- validation errors exist
- workflow failure states do not exist as first-class product behavior

### Minimum acceptable implementation
- add `failed` state paths for workflow execution
- show failure reason in UI
- keep proof and payment empty when execution does not occur

## Requirement Group G: Commercial Usage Ledger
### Why it matters
If the product is builder-facing and usage-based, we need a ledger before we need fancy pricing pages.

### Required
- what call happened
- who triggered it
- whether it was billable
- payment state
- settlement state

### Current state
- one hardcoded payment event object
- alpha usage entries now exist per workflow run
- usage is now visible in the dashboard for the selected workspace
- billable logic is still primitive

### Minimum acceptable implementation
- append-only workflow payment log
- workflow id -> payment record mapping

## Requirement Group H: Deployment And Operator Readiness
### Why it matters
External users need a stable destination, not just local scripts.

### Required
- deployed frontend
- deployed backend
- env variable contract
- startup instructions
- health endpoint

### Current state
- local-only dev stack
- hosted preview blueprint can be prepared before the first deployed alpha
- env variable contract is now explicit

### Minimum acceptable implementation
- one hosted preview or production URL
- one documented env template
- one deploy runbook

## First External-Usable Milestone
NexusAgent can be called externally usable when all of the following are true:
- persistent agent registry exists
- a workspace can own agents
- one live workflow path exists
- one bounded proof-producing action exists
- one workflow history view exists
- deployed URLs exist

## What Is Not Required For The First External Version
- open public marketplace
- advanced billing
- full reputation graph
- generalized multi-tenant RBAC
- full decentralized discovery

## Strategic Constraint
External usability should not mean maximal openness.
The first usable version should be:
- invitation-based
- tightly scoped
- workflow-limited
- risk-bounded
- explicit about what is live, what is proof-backed, and what is still compatibility-mode
