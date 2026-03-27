# Backend Implementation Plan

## Goal
Build the minimum backend needed to support:
- one onboarding-facing product surface
- one deterministic workflow demo
- one proof-facing settlement surface

## Implementation Philosophy
Do not build a platform.
Build a credible demo architecture that can later grow into a platform.

## Current Backend Decision
The backend should start as a single service with explicit modules.
This is the fastest path to:
- truthfulness
- determinism
- debuggability
- easier final review

## Required Backend Modules
### 1. Demo data module
Purpose:
- serve deterministic demo and rejected-path payloads

Inputs:
- none or simple mode flags

Outputs:
- `WorkflowRun`
- agent registry payload
- proof payload

### 2. Workflow module
Purpose:
- manage the canonical workflow state machine
- construct agent handoffs

Inputs:
- user intent
- workflow mode

Outputs:
- workflow state transitions
- message envelopes

### 3. Onboarding module
Purpose:
- expose the onboarding contract to the frontend

Inputs:
- supported onboarding paths
- required agent registration fields

Outputs:
- onboarding template
- agent registration response

### 4. Proof module
Purpose:
- expose settlement and proof artifacts

Inputs:
- workflow id

Outputs:
- settlement object
- proof metadata

### 5. Integration adapter module
Purpose:
- isolate external integrations so the app remains demoable even if a live dependency fails

Current responsibilities:
- X Layer proof capture path
- optional OKX-related data path
- optional payment path

## Recommended Initial File Structure
- `backend/src/api`
- `backend/src/domain`
- `backend/src/demo`
- `backend/src/integrations`
- `backend/src/lib`

## Phase 1 Build Order
1. implement demo payload endpoints
2. implement onboarding template endpoint
3. implement rejected-path endpoint
4. wire proof artifact register into backend config
5. add one live proof path when available

## Validation Rules
Every backend milestone must be validated against:
- `shared/FRONTEND_BACKEND_CONTRACT.md`
- `shared/WORKFLOW_STATE_MACHINE.md`
- `shared/AGENT_MESSAGE_ENVELOPE.md`
- `shared/DEMO_DATA_SPEC.md`
- `shared/DEMO_REJECTED_SPEC.md`

## Non-Goals
- production auth
- multi-tenant builder dashboard
- generalized remote agent execution framework
- full protocol implementation

## Final Rule
The backend exists to make the product story true.
If a backend feature does not help prove onboarding, workflow, payment, or proof, cut it.
