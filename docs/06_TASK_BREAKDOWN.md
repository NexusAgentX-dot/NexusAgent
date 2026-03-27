# 06 Task Breakdown

## Operating Rule
We always decompose from system layer -> workflow -> task -> acceptance criteria.
No one should start coding from a vague feature request.

## Track A: Strategy And Product
Owner: Codex

Tasks:
1. Finalize thesis and buyer story
2. Finalize standards posture and safe wording
3. Freeze MVP boundary
4. Define judge narrative
5. Define final demo path

Done when:
- the four strategic docs are complete
- protocol claims are reviewed against official sources
- one golden demo path is frozen

## Track B: Architecture And Backend
Owner: Codex

Tasks:
1. Define workflow state machine
2. Define backend API contract for frontend
3. Define agent role interfaces
4. Define payment and settlement representation
5. Implement mock/live fallback strategy

Done when:
- backend contract is written
- every workflow step has an input and output shape
- fallback behavior exists for unstable integrations

## Track C: Frontend And UI
Owner: Claude

Tasks:
1. Design landing page
2. Design workflow dashboard
3. Design settlement proof view
4. Make the four agents visually distinct
5. Make the protocol stack legible without feeling like a whitepaper

Done when:
- the UI makes the demo understandable in under 10 seconds
- the X Layer proof is visually prominent
- no unsupported protocol claims appear in the copy

## Track D: Protocol And Integration Verification
Owner: Codex

Tasks:
1. Confirm latest official status of protocols
2. Confirm simplest official OKX onboarding path
3. Confirm safe product claims
4. Maintain a protocol truth table

Done when:
- the README and submission copy cannot be trivially fact-checked into contradictions

## Track E: Demo Operations
Owner: Codex with Claude support

Tasks:
1. Prepare demo script
2. Prepare demo state data
3. Verify happy path
4. Verify fallback path
5. Capture transaction hash and screenshots

Done when:
- demo can be recorded without improvising core logic
- every screen aligns with the same story

## Sub-AI Assignment Model
### Claude
Use for:
- UI
- visual hierarchy
- landing page polish
- dashboard interaction polish
- copy refinement once product wording is frozen

### Additional research agents
Use for:
- protocol status checks
- official integration checks
- competitive framing if needed

### Codex
Keeps ownership of:
- product truth
- architecture truth
- task decomposition
- integration truth
- final acceptance and repair loop

## Workflow For Every Implementation Task
1. Task is defined in one sentence
2. Input and expected output are written down
3. Code is produced
4. Validation is run
5. Codex reviews the result
6. Fixes are applied
7. Only after that does the task count as complete

## User Involvement Rule
The user should only need to:
- confirm the final direction
- review the integrated result
- approve major irreversible decisions if they arise

The user should not be forced to do mid-stream coordination work for us.
