# 09 Execution Board

## Objective
Turn the project from strategic definition into a controlled execution sequence with clear owners, dependencies, and validation gates.

## Phase 0: Strategy Freeze
Status: complete
Owner: Codex

Tasks:
- finalize thesis
- finalize buyer story
- finalize MVP boundary
- finalize judge narrative
- finalize protocol truth table

Exit criteria:
- docs 01 to 08 complete
- no unresolved contradiction in core positioning

## Phase 1: Product Contract Freeze
Status: complete
Owner: Codex

Tasks:
- finalize shared workflow state machine
- finalize frontend/backend contract
- finalize demo happy path
- finalize fallback mode rules
- validate and freeze the payment story before downstream implementation

Dependencies:
- Phase 0 complete

Validation:
- every screen and API response can be mapped to one workflow step
- the payment step is no longer ambiguous

## Phase 2: Frontend Design
Status: in progress
Owner: Claude

Tasks:
- design landing page
- design workflow dashboard
- design settlement proof panel
- align UI copy with truth table

Dependencies:
- Phase 1 complete
- Claude prompt delivered

Validation:
- Codex review against docs 03, 04, 07, 08
- no overclaims in UI text
- frontend reads backend-compatible data with local fallback
- frontend copy is frozen pending morning review

## Phase 3: Backend Skeleton
Status: complete
Owner: Codex

Tasks:
- define workflow handlers
- define agent role outputs
- define deterministic demo data
- wire one chain-proof path

Dependencies:
- Phase 1 complete

Validation:
- one complete `WorkflowRun` object can render the app
- workflow state transitions match the agreed contract
- backend typecheck, validate, and build pass
- API smoke test passes

## Phase 4: Integration Layer
Status: in progress
Owner: Codex

Tasks:
- connect selected OKX integration path
- connect agent wallet path
- connect one payment-relevant event
- connect one X Layer proof artifact

Dependencies:
- Phase 3 complete

Validation:
- one live or credibly proxied path succeeds
- one real X Layer tx hash is captured

Current note:
- frontend now consumes backend-compatible API shapes
- payment remains `x402-compatible` by decision
- a live X Layer testnet tx hash has been captured and wired into the demo proof surface
- a repeatable X Layer testnet flow validation script now exists and writes artifacts to `output/testnet-flow/`
- the remaining truthfulness guard is to keep payment labeled as demo-compatible

## Phase 5: Final Review And Repair
Status: in progress
Owner: Codex

Tasks:
- review frontend against strategy
- review backend against workflow contract
- repair narrative or behavior mismatches
- prepare demo script and README skeleton

Dependencies:
- Phases 2 to 4 complete

Validation:
- happy path demo works
- fallback path works
- final copy is safe
- validation scripts pass from the repo root
- browser walkthrough passes on landing, onboarding, and dashboard
- overnight guard artifacts exist under `output/validation/latest`

## Phase 6: External Usability And Productization
Status: complete
Owner: Codex

Tasks:
- freeze the private builder alpha scope
- define workspace ownership model
- define persistent object model
- define alpha API surface
- map commercial readiness gaps into implementation-ready tasks

Dependencies:
- Phases 3 to 5 stable
- docs 24 to 26 complete

Validation:
- private builder alpha is described as a product milestone, not just a roadmap idea
- every external-usability requirement maps to an object or endpoint
- no future implementation task requires redefining ownership boundaries mid-build

## Phase 7: Private Builder Alpha Build
Status: in progress
Owner: Codex

Tasks:
- add persistent workspace and agent registry
- add wallet verification and activation gating
- add one live workflow input path
- add workflow history and usage ledger
- deploy one stable preview environment

Dependencies:
- Phase 6 complete
- mainnet proof strategy decided

Validation:
- an external builder can create a workspace, register an agent, and inspect a run without manual code edits by us
- one workflow family is repeatable beyond the demo payload
- product surfaces remain truth-safe while moving from demo to alpha

Current note:
- file-backed workspace creation now exists
- persistent per-workspace agent registration now exists
- wallet verification and activation gating now exist
- one live workflow input path now exists through the X Layer RPC-backed Sentinel step
- workflow history and usage ledger endpoints now exist
- dashboard now consumes workspace-scoped history, selected run detail, and usage data
- the alpha workflow API can now auto-select one active verified agent per canonical role
- approved alpha runs can optionally execute a bounded live testnet settlement path when explicitly configured
- the optional live alpha execution path has been validated with a real X Layer testnet artifact under `output/alpha-live/`
- workspace-scoped private alpha access now requires a workspace key
- a hosted preview blueprint now exists in `render.yaml`
- the remaining alpha blockers are stronger identity, deployed hosted operations, and a more valuable repeat-use workflow

## Claude Deliverables
Expected files:
- frontend implementation
- frontend notes describing visual logic
- any copy additions clearly separated

Review gate:
- Codex must review before user sees final integrated result

## User Touchpoints
The user should only be asked for:
- final direction confirmation if strategy changes materially
- final integrated review before submission

The user should not be used for routine synchronization between AI workers.
