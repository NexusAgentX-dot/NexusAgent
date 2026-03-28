# 28 Environment Contract

## Purpose
This file defines the minimum environment variables required to run NexusAgent as:
- a local demo
- a live builder backend
- a live X Layer proof capture tool

## Local Demo Defaults
These can run without extra environment variables:
- frontend local dev server
- backend demo APIs
- onboarding template
- canonical approved and rejected runs

## Alpha Backend Variables
### Optional but recommended
- `PORT`
  - backend port
  - default: `8787`

- `NEXUSAGENT_ALPHA_SIGNAL_RPC_URL`
  - RPC used by the live Sentinel signal step
  - default: `https://rpc.xlayer.tech`

- `NEXUSAGENT_ALPHA_SIGNAL_CHAIN_ID`
  - chain id expected by the live Sentinel signal step
  - default: `196`

- `NEXUSAGENT_ALPHA_MAX_GAS_PRICE_WEI`
  - maximum gas price allowed for the alpha decision rule
  - default: `30000000`

- `NEXUSAGENT_XLAYER_NETWORK`
  - **source of truth for network selection** across all backend modules
  - default: `testnet`
  - supported values: `testnet`, `mainnet`
  - when `mainnet`, backend uses `NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY`; when `testnet` (or unset), uses `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY`

- `NEXUSAGENT_ALPHA_EXECUTION_MODE`
  - execution mode for approved alpha workflows
  - default: `disabled`
  - supported values: `disabled`, `testnet_transfer`, `mainnet_transfer`

- `NEXUSAGENT_ALLOWED_ORIGINS`
  - comma-separated list of browser origins allowed to call the backend in hosted preview
  - default: allow all origins in local development

- `NEXUSAGENT_ALLOW_PUBLIC_WORKSPACE_LIST`
  - allows `GET /api/workspaces` for debug
  - default: disabled

## Testnet Proof Variables
### Required for live testnet execution
- `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY`
  - wallet used for bounded testnet proof transfer

### Optional
- `NEXUSAGENT_XLAYER_RPC_URL`
  - override RPC URL (testnet or mainnet)

- `NEXUSAGENT_XLAYER_STABLECOIN_ADDRESS`
  - override stablecoin token address

- `NEXUSAGENT_XLAYER_TRANSFER_AMOUNT`
  - override bounded transfer amount

- `NEXUSAGENT_XLAYER_TEST_RECIPIENT`
  - explicit recipient for proof transfer

## Mainnet Readiness Variables
### Required for live readiness with wallet inspection
- `NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY`

### Optional
- `NEXUSAGENT_XLAYER_MAINNET_TRACKED_TOKENS`
  - format: `SYMBOL:ADDRESS,SYMBOL:ADDRESS`

## Rules
### Rule 0
Mainnet and testnet private keys are strictly separated. No cross-network fallback is permitted. When `NEXUSAGENT_XLAYER_NETWORK=mainnet`, only `NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY` is used. When `NEXUSAGENT_XLAYER_NETWORK=testnet` (or unset), only `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY` is used. A missing key for the active network must cause an explicit error, never a silent fallback to the other network's key.

### Rule 1
Do not hardcode private keys into source files.

### Rule 2
Workflow execution must remain bounded even when a live key is present.

### Rule 3
Public-facing wording must not assume a live payment or mainnet proof unless the required env-backed checks have been completed.

## Current Reality
As of now:
- alpha live signal path can run with defaults
- alpha can execute bounded live transfers on testnet or mainnet depending on `NEXUSAGENT_ALPHA_EXECUTION_MODE` and valid key presence
- mainnet settlement is code-supported; testnet settlement is validated with explorer-verifiable tx hashes
- x402 payment is fully integrated via OKX facilitator (EIP-3009 authorize → verify → settle)
- private alpha workspace-scoped APIs now expect a workspace key in `Authorization` or `X-NexusAgent-Workspace-Key`
