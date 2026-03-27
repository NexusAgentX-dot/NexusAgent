# 12 Implementation Task Queue

## Purpose
This file translates the project framework into atomic implementation tasks suitable for delegation to sub-agents.

## Rule
Each task must be:
- narrow
- independently checkable
- mapped to one owner
- paired with acceptance criteria

## Phase 1: Product Contract Tasks
### Task 1.1
Define the final hero use case for the showcase workflow.

Owner:
- Codex

Acceptance:
- one sentence hero use case exists
- all demo copy can reuse it
- no ambiguity remains about what the workflow is doing

### Task 1.2
Freeze the final workflow object shape.

Owner:
- Codex

Acceptance:
- `WorkflowRun` object finalized
- frontend can render from one payload

### Task 1.3
Freeze the onboarding surface requirements.

Owner:
- Codex

Acceptance:
- onboarding UI requirements are explicit
- builder-facing value is visible in product structure

### Task 1.4
Decide the MVP payment story before implementation begins.

Owner:
- Codex

Acceptance:
- it is explicit whether the payment event is live or x402-compatible demo behavior
- UI labeling rule is frozen
- README wording can reuse the same decision

## Phase 2: Frontend Tasks
### Task 2.1
Create landing page information architecture.

Owner:
- Claude

Acceptance:
- explains product in under 10 seconds
- includes onboarding, workflow, payment, and proof

### Task 2.2
Create workflow dashboard layout.

Owner:
- Claude

Acceptance:
- all canonical states are visible or representable
- all four agents are visually distinct

### Task 2.3
Create settlement proof component.

Owner:
- Claude

Acceptance:
- tx hash area is prominent
- payment and evaluation appear alongside proof

### Task 2.4
Create onboarding surface or panel.

Owner:
- Claude

Acceptance:
- a builder can understand how an external agent enters the system
- official onboarding paths are represented safely

## Phase 3: Backend Tasks
### Task 3.1
Create demo workflow payload generator.

Owner:
- Codex

Acceptance:
- returns a valid `WorkflowRun`
- matches API contract exactly

### Task 3.2
Create agent registry payload.

Owner:
- Codex

Acceptance:
- includes four canonical agents
- includes onboarding-relevant metadata

### Task 3.3
Create proof payload.

Owner:
- Codex

Acceptance:
- settlement, payment, and evaluation data are exposed

### Task 3.4
Create fallback mode handling.

Owner:
- Codex

Acceptance:
- app remains demoable without unstable integrations

## Phase 4: Integration Tasks
### Task 4.1
Validate preferred onboarding path assumptions against live docs.

Owner:
- Codex

Acceptance:
- no UI or README contradiction with official docs

### Task 4.2
Connect one X Layer proof artifact.

Owner:
- Codex

Acceptance:
- one real tx hash is captured and displayable

### Task 4.3
Implement the previously decided payment story.

Owner:
- Codex

Acceptance:
- payment step matches the frozen MVP payment decision
- no ambiguity remains in the UI

### Task 4.4
Add a repeatable X Layer testnet flow validation path.

Owner:
- Codex

Acceptance:
- one bounded live testnet transfer can be executed from a dedicated test key
- tx hash and explorer URL are captured into a reusable artifact
- the validation chain can optionally invoke this test when the required env var is present

## Phase 5: Review Tasks
### Task 5.1
Review frontend against strategic docs.

Owner:
- Codex

Acceptance:
- no contradiction with docs 01 to 11

### Task 5.2
Review protocol claims.

Owner:
- Codex

Acceptance:
- all claims conform to truth table

### Task 5.3
Review demo narrative.

Owner:
- Codex

Acceptance:
- onboarding story and workflow story feel like one product

## Phase 6: Productization Contract Tasks
### Task 6.1
Freeze the private builder alpha scope.

Owner:
- Codex

Acceptance:
- one external-usable milestone exists
- the alpha scope is narrower than public launch
- one workflow family is chosen for alpha

### Task 6.2
Define the workspace ownership contract.

Owner:
- Codex

Acceptance:
- workspace ownership rules are explicit
- agent activation and wallet verification states are explicit
- workflow trigger permissions are explicit

### Task 6.3
Define the persistent object model.

Owner:
- Codex

Acceptance:
- workspace, agent, workflow run, proof, and usage objects exist
- alpha persistence no longer depends on demo-only payloads

### Task 6.4
Define the alpha API surface.

Owner:
- Codex

Acceptance:
- every external-usability requirement maps to one endpoint group
- workspace scoping is explicit
- history and proof surfaces are addressable by API

## Phase 7: Private Builder Alpha Build Tasks
### Task 7.1
Implement persistent workspace registry.

Owner:
- Codex

Acceptance:
- workspaces can be created and listed
- workspace ids are stable across restarts

### Task 7.2
Implement persistent agent registry.

Owner:
- Codex

Acceptance:
- agent records persist outside demo data
- `agentId` collisions are rejected
- agents are scoped to one workspace

### Task 7.3
Implement wallet verification and activation gating.

Owner:
- Codex

Acceptance:
- agents cannot execute while unverified
- activation states are enforced in workflow creation

### Task 7.4
Implement one live workflow input path.

Owner:
- Codex

Acceptance:
- Sentinel retrieves one live input
- Arbiter applies one real threshold rule
- rejected and failed paths remain visible

### Task 7.5
Implement workflow history persistence.

Owner:
- Codex

Acceptance:
- completed, rejected, and failed runs are queryable
- per-run proof links remain attached

### Task 7.6
Implement commercial usage ledger.

Owner:
- Codex

Acceptance:
- each workflow run can create usage entries
- payment-relevant and proof-producing events are recorded

### Task 7.7
Implement one deployed alpha environment.

Owner:
- Codex

Acceptance:
- frontend and backend have one hosted URL pair
- environment contract is documented

## Sub-Agent Delegation Guidance
Good sub-agent tasks are:
- bounded to one file set
- bounded to one output
- verifiable without subjective interpretation

Bad sub-agent tasks are:
- “build the product”
- “make it better”
- “fix all UX issues”
