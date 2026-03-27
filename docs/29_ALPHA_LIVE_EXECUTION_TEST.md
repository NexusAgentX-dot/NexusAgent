# 29 Alpha Live Execution Test

## Purpose
This file defines the repeatable validation path for the private builder alpha when a bounded live execution path is explicitly enabled.

## What It Validates
- a workspace can be created through the alpha API
- the resulting workspace key gates later alpha requests
- four canonical agents can be registered and verified
- the alpha workflow can auto-select the canonical active agents
- an approved run can execute a bounded live testnet settlement path
- the resulting proof artifact is captured and stored

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

## Execution Mode
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
