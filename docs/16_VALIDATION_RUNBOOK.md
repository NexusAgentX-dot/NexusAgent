# 16 Validation Runbook

## Purpose
This file defines the repeatable validation chain for NexusAgent.
The goal is to reduce drift and make product review evidence-based.

## Validation Scripts

### Backend contract and build
- `scripts/validate_backend.sh`

Checks:
- TypeScript typecheck
- schema validation
- production build

### Frontend lint and build
- `scripts/validate_frontend.sh`

Checks:
- ESLint
- production build

### API smoke test
- `scripts/smoke_api.sh`

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
- `scripts/check_contract_sync.sh`

Checks:
- hero use case string
- workflow event sequence
- payment mode alignment
- settlement chain alignment
- canonical agent ordering
- onboarding path ordering

### Full chain
- `scripts/validate_all.sh`

Checks:
- backend validation
- frontend validation
- frontend/backend contract sync
- API smoke test
- hosted preview blueprint check
- optional live X Layer flow validation when private key is present (mainnet supported, testnet validated)

### Live testnet flow validation
- `scripts/validate_testnet_flow.sh`
- `docs/21_TESTNET_FLOW_TEST.md`

Checks:
- X Layer testnet RPC connectivity
- bounded stablecoin transfer execution on testnet
- tx hash and explorer URL artifact capture
- output artifact write to `output/testnet-flow/`

Note: mainnet settlement is code-supported (via `NEXUSAGENT_XLAYER_NETWORK=mainnet`) but this script only validates the testnet path.

### Alpha live execution validation
- `scripts/validate_alpha_live_execution.sh`
- `docs/29_ALPHA_LIVE_EXECUTION_TEST.md`

Checks:
- workspace-scoped alpha workflow creation
- canonical agent auto-selection
- bounded live settlement for approved alpha runs (mainnet code path supported; validation script currently proves testnet path)
- proof artifact capture to `output/alpha-live/`

## Rule
Before any “ready for review” claim:
1. backend validation must pass
2. frontend validation must pass
3. API smoke test must pass
4. browser walk-through should confirm the landing, onboarding, and workflow surfaces

## Current Status
- settlement proof is backed by a live X Layer testnet tx hash (mainnet code path supported, testnet validated)
- the payment step uses live x402 via OKX facilitator (EIP-3009 authorize → verify → settle)
- x402 is fully integrated with the premium endpoint
