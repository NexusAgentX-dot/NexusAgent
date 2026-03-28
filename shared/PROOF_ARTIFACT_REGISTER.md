# Proof Artifact Register

## Purpose
Single source of truth for all on-chain evidence. Every public claim must trace back to an entry here.

## Current Active Proofs (X Layer Mainnet)

### x402 Payment — OKX Facilitator (2 mainnet TXs)
- `txHash1`: `0xd6d0fa98e9ad5e1be208f39371e81e1ee7d0275ff4b20ef6f38b9e4e82315edf` — [OKLink](https://www.oklink.com/xlayer/tx/0xd6d0fa98e9ad5e1be208f39371e81e1ee7d0275ff4b20ef6f38b9e4e82315edf)
- `txHash2`: `0x41fe452643fe099a0969e3de30a3f86765fcf611c1881dd73a81684f9bb7fb44` — [OKLink](https://www.oklink.com/xlayer/tx/0x41fe452643fe099a0969e3de30a3f86765fcf611c1881dd73a81684f9bb7fb44)
- `flow`: EIP-3009 signature → OKX /api/v6/x402/verify → OKX /api/v6/x402/settle → on-chain USDT
- `amount`: 0.01 USDT each
- `facilitator`: OKX Onchain OS x402 API
- `capturedAt`: 2026-03-27

### Settlement Transfer (mainnet)
- `txHash`: `0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f` — [OKLink](https://www.oklink.com/xlayer/tx/0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f)
- `amount`: 0.01 USDT
- `block`: 55826972

### ERC-8004 AgentRegistry (mainnet)
- `contract`: `0xB4dDf24c8a6cBDEB976d27C4A142f076272EfEC0`
- Sentinel: `0xf84bea496c2124a96f3698bf47d78833dc0fa6927414eae78c28d84dfc65e10d`
- Arbiter: `0x64056584bff2cc668aa7065d98611d8c84d4d2568337fcf0cd3a397cf3e0d4e5`
- Executor: `0xc9ac0e0cc30bc0022e4b3b93af3f660563337f07313e368f6a1f779f4228609b`
- Evaluator: `0x8dcdeb7f7e4b548af3a29b21276b393226c8fa8f968ab868f447421594e2d305`

### ERC-8183 AgentEscrow Lifecycle (mainnet, 4 TXs)
- `contract`: `0xa5f560C60F5912bE1a44D24A78B6e82e7C50F455`
- `createJob`: `0x667e50fd0f1e4e1201fa81396b366d975011b36eb4590ff74d55dccca7c68ea8`
- `fundJob`: `0xd699d8a34b41d9216c646407b4f56cb73c8412d692a1b804bcdcf44778b489f8`
- `submitJob`: `0xba4e7706ced63afee211151a9984f61b4dbc4fedd5f3c7a0ce4505c21476e93d`
- `completeJob`: `0x663151bb3933c7b9d26e2878bf72d5d068a2ab23af03e67d257a0f5b6bc23a2d`
- `amount`: 0.01 USDT

### External AI Agent E2E (mainnet, via @nexusagent/skills CLI)
- `settlementTx`: `0x173401a3c6956e513387cb1e0782a68576546d49f12f8c1d91329ada02eb3d0d` — [OKLink](https://www.oklink.com/xlayer/tx/0x173401a3c6956e513387cb1e0782a68576546d49f12f8c1d91329ada02eb3d0d)
- `flow`: A2A discovery → workspace create → agent register (ERC-8004) → OKB signal → workflow → settlement + escrow

### OKX Onchain OS Integration
- Market API: live, OKB price via authenticated Onchain OS endpoint
- DEX Quote API: integrated, authenticated — pair routing limited by on-chain liquidity
- Wallet API: sign-info endpoint for gas estimation integrated in executor
- x402 API: verify + settle endpoints for payment flow
- `evidenceFile`: output/okx-proof/latest.json

---

## Historical Testnet Artifacts (development phase)

These artifacts were captured during testnet development. They remain valid as engineering proof but are superseded by the mainnet artifacts above.

- `0x7d3fe82a...` — testnet settlement (0.10 USDT, chain 1952)
- `0x1c4f4e4f...` — testnet alpha workflow settlement
- `0x1e479d78...` — testnet OKB signal-triggered settlement
- `0x699d823f...` — testnet full-stack artifact (settlement + 4 escrow TXs)
- Testnet contracts: AgentRegistry `0xc66DB3F3D07045686307674A261482d3e5EF9B79`, AgentEscrow `0xB4dDf24c8a6cBDEB976d27C4A142f076272EfEC0` (chain 1952)
