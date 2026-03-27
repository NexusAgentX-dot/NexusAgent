# 18 Live Proof Capture Playbook

## Purpose
This file gives the shortest safe path to upgrade the placeholder proof into a real X Layer artifact once a human is available for the required interactive verification step.

## Current State
- product workflow is implemented
- proof panel shape is implemented
- backend and frontend are validated
- live settlement proof has been captured on X Layer testnet
- the official explorer URL is confirmed
- the remaining non-live step is the demo-compatible payment event

## Official References
- X Layer faucet landing: `https://web3.okx.com/xlayer/faucet`
- X Layer faucet request page: `https://web3.okx.com/xlayer/faucet/xlayerfaucet`
- X Layer network information: `https://web3.okx.com/xlayer/docs/developer/build-on-xlayer/network-information`

## Captured Outcome
- `settlement.txHash`: `0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d`
- `settlement.explorerUrl`: `https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d`
- `settlement.proofSummary`: live X Layer testnet stablecoin proof transfer of `0.10 USD₮0`

## What Still Matters In The Morning
1. verify that final README and submission copy describe this as a live settlement proof
2. keep the payment step labeled as `x402-compatible`
3. do not collapse payment proof and settlement proof into one claim

## Why This Is The Preferred Path
- it uses an official OKX/X Layer route
- it keeps the current product story intact
- it avoids pretending that placeholder proof is real
- it upgrades the strongest remaining blocker without changing product scope

## Rule
Keep the current artifact unless a better one is captured that remains equally truthful to the workflow story.
