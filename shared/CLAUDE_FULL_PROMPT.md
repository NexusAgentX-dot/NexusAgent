# Claude Frontend Prompt

You are helping on the frontend and UI for a hackathon project.

Work only inside:
- `/Users/kb/Desktop/X链比赛2个/frontend`

Read first:
- `/Users/kb/Desktop/X链比赛2个/docs/01_THESIS.md`
- `/Users/kb/Desktop/X链比赛2个/docs/13_HERO_USE_CASE.md`
- `/Users/kb/Desktop/X链比赛2个/docs/03_MVP_BOUNDARY.md`
- `/Users/kb/Desktop/X链比赛2个/docs/04_JUDGE_NARRATIVE.md`
- `/Users/kb/Desktop/X链比赛2个/docs/05_SYSTEM_FRAMEWORK.md`
- `/Users/kb/Desktop/X链比赛2个/docs/06_TASK_BREAKDOWN.md`
- `/Users/kb/Desktop/X链比赛2个/docs/07_VALIDATION_AND_REVIEW.md`
- `/Users/kb/Desktop/X链比赛2个/docs/08_PROTOCOL_TRUTH_TABLE.md`
- `/Users/kb/Desktop/X链比赛2个/docs/14_PAYMENT_DECISION.md`
- `/Users/kb/Desktop/X链比赛2个/docs/15_AGENT_COMMUNICATION_DECISION.md`
- `/Users/kb/Desktop/X链比赛2个/shared/CLAUDE_FRONTEND_BRIEF.md`
- `/Users/kb/Desktop/X链比赛2个/shared/WORKFLOW_STATE_MACHINE.md`
- `/Users/kb/Desktop/X链比赛2个/shared/AGENT_ROLE_SPECS.md`
- `/Users/kb/Desktop/X链比赛2个/shared/AGENT_ONBOARDING_CONTRACT.md`
- `/Users/kb/Desktop/X链比赛2个/shared/FRONTEND_BACKEND_CONTRACT.md`
- `/Users/kb/Desktop/X链比赛2个/shared/DEMO_DATA_SPEC.md`
- `/Users/kb/Desktop/X链比赛2个/shared/DEMO_REJECTED_SPEC.md`

## Project
NexusAgent is a multi-agent commerce and execution network on X Layer.

The MVP must visually prove:
- simple agent onboarding
- multi-agent coordination
- autonomous payment
- secure execution
- onchain settlement proof

## Design Goal
Build a sharp, premium, protocol-native interface that does not look like generic crypto AI SaaS.

The interface should make the following flow instantly understandable:
Onboarding -> Intent -> Signal -> Decision -> Preparation -> Payment -> Execution -> Evaluation -> Settlement

## Priority Screens
1. Landing page
2. Onboarding surface
3. Workflow dashboard
4. Settlement proof panel

## Things The UI Must Emphasize
- bring-your-agent onboarding
- four distinct agent roles:
  - Sentinel
  - Arbiter
  - Executor
  - Evaluator
- protocol stack:
  - MCP
  - A2A
  - x402
  - OKX Onchain OS
  - Agentic Wallet
  - X Layer
- real proof area:
  - transaction hash
  - payment event
  - evaluation result

## Things You Must Avoid
- generic cards everywhere
- purple-on-white default AI crypto look
- making the page read like a whitepaper
- unsupported claims
- describing ERC-8004 or ERC-8183 as finalized
- adding unverified OKX product numbers

## Copy Rules
- say `ERC-8004 draft-based identity/reputation model`
- say `ERC-8183-compatible escrow/evaluator flow`
- frame Agentic Wallet as OKX's dedicated wallet for AI agents with TEE-protected keys
- do not claim universal zero-gas behavior

## Output Expectation
Please produce:
1. the frontend structure
2. the visual direction
3. the key components
4. any new copy blocks in clearly separated files
5. a short note describing how the UI helps judges understand the project in under 60 seconds
6. how the onboarding surface and workflow surface are visually connected

## Collaboration Rule
Do not edit files outside `frontend/` unless absolutely necessary.
If you need shared copy or data contracts changed, write a note in:
- `/Users/kb/Desktop/X链比赛2个/shared`
