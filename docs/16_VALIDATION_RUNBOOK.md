# 16 Validation Runbook

## Purpose
This file defines the repeatable validation chain for NexusAgent.
The goal is to reduce overnight drift and make the final product review evidence-based.

## Validation Scripts

### Backend contract and build
- `/Users/kb/Desktop/X链比赛2个/scripts/validate_backend.sh`

Checks:
- TypeScript typecheck
- schema validation
- production build

### Frontend lint and build
- `/Users/kb/Desktop/X链比赛2个/scripts/validate_frontend.sh`

Checks:
- ESLint
- production build

### API smoke test
- `/Users/kb/Desktop/X链比赛2个/scripts/smoke_api.sh`

Checks:
- backend starts
- health endpoint responds
- approved workflow endpoint responds
- rejected workflow endpoint responds
- onboarding template responds
- agent registry responds
- proof endpoint responds
- workspace-scoped alpha endpoints reject unauthenticated access

### Frontend/backend contract sync
- `/Users/kb/Desktop/X链比赛2个/scripts/check_contract_sync.sh`

Checks:
- hero use case string
- workflow event sequence
- payment mode alignment
- settlement chain alignment
- canonical agent ordering
- onboarding path ordering

### Full chain
- `/Users/kb/Desktop/X链比赛2个/scripts/validate_all.sh`

Checks:
- backend validation
- frontend validation
- frontend/backend contract sync
- API smoke test
- hosted preview blueprint check
- optional live X Layer testnet flow validation when `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY` is present

### Live testnet flow validation
- `/Users/kb/Desktop/X链比赛2个/scripts/validate_testnet_flow.sh`
- `/Users/kb/Desktop/X链比赛2个/docs/21_TESTNET_FLOW_TEST.md`

Checks:
- X Layer testnet RPC connectivity
- bounded stablecoin transfer execution
- tx hash and explorer URL artifact capture
- output artifact write to `output/testnet-flow/`

### Alpha live execution validation
- `/Users/kb/Desktop/X链比赛2个/scripts/validate_alpha_live_execution.sh`
- `/Users/kb/Desktop/X链比赛2个/docs/29_ALPHA_LIVE_EXECUTION_TEST.md`

Checks:
- workspace-scoped alpha workflow creation
- canonical agent auto-selection
- bounded live testnet settlement for approved alpha runs when enabled
- proof artifact capture to `output/alpha-live/`

## Rule
Before any “ready for review” claim:
1. backend validation must pass
2. frontend validation must pass
3. API smoke test must pass
4. browser walk-through should confirm the landing, onboarding, and workflow surfaces

## Current Known Limitation
- settlement proof is now backed by a live X Layer testnet tx hash
- the payment step remains `x402_compatible_demo`
- final review still needs to defend the distinction between live settlement proof and demo-compatible payment
