# 29 Alpha Live Execution Test

## Purpose
This file defines the repeatable validation path when a bounded live execution path is explicitly enabled.

It is the single truth document for what the alpha validation script covers and what it does not.

## What This Script Validates
- a workspace can be created through the alpha API
- the resulting workspace key gates later alpha requests
- four canonical agents can be registered and accepted
- the alpha workflow can auto-select the canonical active agents
- an approved run can execute a bounded live testnet settlement path
- the resulting proof artifact is captured and stored

## What This Script Does NOT Validate
- `mainnet_transfer` execution mode (code-supported but not exercised by this script)
- live x402 payment execution
- unrestricted external wallet execution

## Execution Modes

### `testnet_transfer` (validated by this script)
- Uses `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY`
- Connects to X Layer testnet (chain 1952)
- Produces a bounded stablecoin transfer and explorer-verifiable proof

### `mainnet_transfer` (code-supported, not validated by this script)
- Uses `NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY` (strictly separated, no fallback to test key)
- Connects to X Layer mainnet (chain 196)
- A separate mainnet validation script would require a funded mainnet wallet and is not yet implemented

This is consistent with the README statement: "mainnet supported, testnet validated."

## Required Inputs
- `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY`

## Optional Inputs
- `NEXUSAGENT_ALPHA_LIVE_PORT`
- `NEXUSAGENT_ALPHA_SIGNAL_RPC_URL`
- `NEXUSAGENT_ALPHA_SIGNAL_CHAIN_ID`
- `NEXUSAGENT_ALPHA_MAX_GAS_PRICE_WEI`
- `NEXUSAGENT_XLAYER_RPC_URL`
- `NEXUSAGENT_XLAYER_STABLECOIN_ADDRESS`
- `NEXUSAGENT_XLAYER_TRANSFER_AMOUNT`
- `NEXUSAGENT_XLAYER_TEST_RECIPIENT`

## Script Behavior
The script temporarily starts the backend with:
- `NEXUSAGENT_ALPHA_EXECUTION_MODE=testnet_transfer`

This keeps live alpha execution opt-in and bounded.

## Output Artifacts
- `output/alpha-live/latest.json`
- `output/alpha-live/latest.md`
- `output/alpha-live/runs/<timestamp>.json`

## Current Truthfulness Boundary
This test proves:
- workspace-scoped alpha workflow execution can produce a live X Layer testnet settlement artifact

This test does not prove:
- live x402 payment execution
- mainnet settlement
- unrestricted external wallet execution
