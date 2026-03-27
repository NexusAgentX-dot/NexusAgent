# Proof Artifact Register

## Purpose
This file is the single source of truth for real evidence used in the demo and submission.

## Rule
Placeholder values may exist in demo specs.
They must never silently flow into final README, UI, or submission copy.

## Required Final Fields
- `xLayerTxHash`
- `explorerUrl`
- `whatThisProofShows`
- `paymentMode`
- `paymentIsLiveOrDemo`
- `capturedAt`

## Status
Current status:
- live X Layer testnet tx hash captured
- official explorer URL confirmed
- payment step remains `x402_compatible_demo`
- settlement proof is now live while payment remains demo-compatible

## Notes
When a real proof artifact is captured, update this file first.
Until then:
- UI must not present the placeholder artifact as a live confirmed demo proof
- README and submission copy must distinguish payment demo state from settlement proof state

## Captured Artifact
- `xLayerTxHash`: `0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d`
- `explorerUrl`: `https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d`
- `whatThisProofShows`: bounded X Layer testnet stablecoin proof transfer of `0.10 USD₮0`
- `paymentMode`: `x402_compatible_demo`
- `paymentIsLiveOrDemo`: `demo-compatible payment, live settlement proof`
- `capturedAt`: `2026-03-27T02:49:48+08:00`

## Captured Alpha Live Artifact
- `xLayerTxHash`: `0x1c4f4e4f91028ae168b75e4b6cfa5d859ccdfdb9f6b0fb9356d0b258839526fe`
- `explorerUrl`: `https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x1c4f4e4f91028ae168b75e4b6cfa5d859ccdfdb9f6b0fb9356d0b258839526fe`
- `whatThisProofShows`: a workspace-scoped private builder alpha workflow auto-selected the canonical active agents and produced a bounded live X Layer testnet settlement artifact
- `paymentMode`: `x402_compatible_demo`
- `paymentIsLiveOrDemo`: `demo-compatible payment, live settlement proof through the alpha workflow`
- `capturedAt`: `2026-03-27T01:04:28.758Z`

## OKB Market Signal + Live Settlement (Phase 1 Upgrade)
- `xLayerTxHash`: `0x1e479d78034d73341d7a5b8e0845c6ea2bc0f0da286dc6ba87b44be0ad8fc855`
- `explorerUrl`: `https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x1e479d78034d73341d7a5b8e0845c6ea2bc0f0da286dc6ba87b44be0ad8fc855`
- `whatThisProofShows`: OKB market signal via OKX Onchain OS ($85.51, -1.51% 24h) triggered an approved bounded 0.10 USD₮0 transfer on X Layer testnet with live RPC receipt verification
- `signalProvider`: `okx_onchain_os`
- `paymentMode`: `x402_compatible_demo`
- `paymentIsLiveOrDemo`: `demo-compatible payment, live settlement proof through OKB signal alpha workflow`
- `capturedAt`: `2026-03-27T01:50:06.194Z`

## Deployed Smart Contracts (X Layer Testnet)
- `AgentRegistry (ERC-8004)`: `0xc66DB3F3D07045686307674A261482d3e5EF9B79`
- `AgentEscrow (ERC-8183)`: `0xB4dDf24c8a6cBDEB976d27C4A142f076272EfEC0`
- `network`: X Layer Testnet (chain 1952)
- `deployer`: `0x031189016E014447C467163D4A818D847359f980`
- `deployedAt`: `2026-03-27T01:47:00Z`

## Full Stack Live Artifact (ERC-8183 Escrow + Settlement)
- `settlementTxHash`: `0x699d823f40a6a6b4e85c5aa7f17b2266cab7762a033dbe9fb905512cd44fd2fc`
- `escrowCreateTx`: `0x488e04d94070081fef7cc79861b1931e2ad62507297e6f754966dfa7a8bade5f`
- `escrowFundTx`: `0xc4093c47dc20961f8acde020c14f12dd98e7ff99d4a17f4d76d786f11aa90001`
- `escrowSubmitTx`: `0x75f16274c29e176507567cc9ea0c7afa2e30557fdee30c25e71ab06f0deafc41`
- `escrowCompleteTx`: `0x9ec6364367f79f15a870a8804ba8faeadaee1dd9a8b9d30a5aca20c9f8c4fc8f`
- `signalProvider`: `okx_onchain_os`
- `whatThisProofShows`: Full-stack workflow with OKB Onchain OS signal → ERC-8183 escrow create/fund/submit/complete → bounded 0.10 USD₮0 transfer → RPC receipt verification. 5 on-chain transactions total.
- `capturedAt`: `2026-03-27T02:58:00Z`

## OKX Onchain OS Integration Evidence
- `evidenceFile`: `output/okx-proof/latest.json`
- `apisVerified`: Market API (okx_onchain_os provider), DEX Quote API, Wallet sign-info API, Integration Status
- `authentication`: HMAC-SHA256 signed headers (OK-ACCESS-KEY, OK-ACCESS-SIGN, OK-ACCESS-TIMESTAMP, OK-ACCESS-PASSPHRASE, OK-ACCESS-PROJECT)
- `capturedAt`: `2026-03-27T06:00:00Z`

## X Layer Mainnet Proof Artifacts

### Mainnet Settlement Transfer
- `xLayerTxHash`: `0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f`
- `explorerUrl`: `https://www.oklink.com/xlayer/tx/0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f`
- `network`: X Layer Mainnet (chain 196)
- `amount`: 0.01 USD₮0
- `token`: `0x779ded0c9e1022225f8e0630b35a9b54be713736`
- `block`: 55826972
- `capturedAt`: `2026-03-27T07:20:11.183Z`

### Mainnet Smart Contracts
- `AgentRegistry (ERC-8004)`: `0xB4dDf24c8a6cBDEB976d27C4A142f076272EfEC0` (X Layer Mainnet)
- `AgentEscrow (ERC-8183)`: `0xa5f560C60F5912bE1a44D24A78B6e82e7C50F455` (X Layer Mainnet)

### Mainnet Agent Registration (ERC-8004)
- Sentinel: `0xf84bea496c2124a96f3698bf47d78833dc0fa6927414eae78c28d84dfc65e10d`
- Arbiter: `0x64056584bff2cc668aa7065d98611d8c84d4d2568337fcf0cd3a397cf3e0d4e5`
- Executor: `0xc9ac0e0cc30bc0022e4b3b93af3f660563337f07313e368f6a1f779f4228609b`
- Evaluator: `0x8dcdeb7f7e4b548af3a29b21276b393226c8fa8f968ab868f447421594e2d305`

## x402 Payment Flow Evidence
- `evidenceFile`: `output/x402-proof/latest.json`
- `flow`: GET /api/signals/premium-okb → HTTP 402 + PAYMENT-REQUIRED header → X-PAYMENT header → HTTP 200 + premium signal
- `verification`: txHash-based simplified verification (not full EIP-3009)
- `capturedAt`: `2026-03-27T06:00:00Z`
