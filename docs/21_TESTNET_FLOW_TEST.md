# 21 Testnet Flow Test

## Purpose
Define the reproducible live test that exercises the onchain portion of the NexusAgent workflow on X Layer testnet.

## Why This Exists
The demo already has a live settlement proof artifact.
This test turns that one-off capture into a repeatable validation path.

## Inputs
- `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY`
  - required
  - dedicated testnet-only private key
- `NEXUSAGENT_XLAYER_TEST_RECIPIENT`
  - optional
  - if omitted, the script generates a fresh recipient wallet address
- `NEXUSAGENT_XLAYER_RPC_URL`
  - optional
  - defaults to X Layer testnet RPC
- `NEXUSAGENT_XLAYER_STABLECOIN_ADDRESS`
  - optional
  - defaults to the current testnet `USD₮0` token contract used by the demo
- `NEXUSAGENT_XLAYER_TRANSFER_AMOUNT`
  - optional
  - defaults to `0.10`

## Outputs
- `output/testnet-flow/latest.json`
- `output/testnet-flow/latest.md`
- `output/testnet-flow/runs/<timestamp>.json`

## What The Test Proves
- the test wallet can connect to X Layer testnet
- the wallet has enough token balance for the bounded transfer
- the transfer executes successfully onchain
- the resulting tx hash and explorer URL are machine-captured
- the artifact can be reused in validation and morning review

## What The Test Does Not Prove
- live x402 payment execution
- live external agent runtime orchestration
- production-grade settlement or escrow

## Rule
This test is a live settlement validation step.
It must not be described as a live x402 payment.
