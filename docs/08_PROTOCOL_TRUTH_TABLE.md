# 08 Protocol Truth Table

## Purpose
This document defines the safest current wording for every major protocol or product claim in the project.
If a claim is not safe here, it should not appear in the product, README, demo, or submission.

## MCP
### Safe
- MCP is the leading open standard for agent-to-tool and agent-to-data connectivity.
- MCP governance moved into the Agentic AI Foundation ecosystem.

### Avoid
- any unsupported claim about exclusive ownership or universal adoption beyond official published figures

### Sources
- https://modelcontextprotocol.io/docs/getting-started/intro
- https://modelcontextprotocol.io/specification/versioning
- https://blog.modelcontextprotocol.io/posts/2025-12-09-mcp-joins-agentic-ai-foundation/

## A2A
### Safe
- A2A v1.0 is the latest released production-ready standard for agent-to-agent coordination.
- A2A supports agent discovery, task delegation, and status exchange.

### Avoid
- claiming that every major agent framework fully implements all A2A capabilities unless we can cite it

### Sources
- https://a2a-protocol.org/latest/announcing-1.0/
- https://a2a-protocol.org/latest/specification/
- https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/

## x402
### Safe
- x402 is an open pay-per-call payment protocol.
- OKX Onchain OS Payments are built on x402.

### Avoid
- claiming every payment step in our demo is live x402 unless it truly is

### Sources
- https://docs.x402.org/introduction
- https://www.x402.org/writing/x402-v2-launch
- https://web3.okx.com/onchainos/dev-docs/payments/x402-api-introduction

## OKX Onchain OS
### Safe
- Onchain OS provides Wallet, Trade, Market, and Payments capabilities for agents.
- it supports Skills, MCP services, and Open API access paths
- the currently documented live MCP/Skills surfaces are Trade and Market
- Wallet and Payment MCP/Skills should be treated according to the live docs, which currently mark some surfaces as coming soon

### Avoid
- inventing product coverage or service counts we cannot cite

### Sources
- https://web3.okx.com/onchainos/dev-docs/home/what-is-onchainos
- https://web3.okx.com/zh-hans/onchainos/dev-docs/home/develop-with-ai-overview
- https://web3.okx.com/onchainos/dev-docs/home/skills-mcp-services

## OKX Agentic Wallet
### Safe
- Agentic Wallet is OKX's dedicated wallet for AI agents
- key generation, storage, and signing are TEE-protected
- email login is an official onboarding path

### Avoid
- unsupported product dates
- unsupported concurrency or wallet-count claims

### Sources
- https://web3.okx.com/onchainos/dev-docs/home/install-your-agentic-wallet
- https://web3.okx.com/zh-hans/onchainos/dev-docs/home/run-your-first-ai-agent
- https://web3.okx.com/onchainos/dev-docs/home/agentic-wallet-overview

## X Layer
### Safe
- X Layer is the chain where we record settlement proof
- OKX documents gas sponsorship and gas-free stablecoin transfer support in specific contexts

### Avoid
- claiming all actions on X Layer are universally zero gas

### Sources
- https://web3.okx.com/help/announcement-regarding-the-pp-upgrade-of-x-layer-and-optimisation-of-the-okb
- https://web3.okx.com/zh-hans/help/okx-wallet-x-layer-0-gas
- https://web3.okx.com/onchainos/dev-docs/payments/supported-networks

## ERC-8004
### Safe
- NexusAgent is implemented against or inspired by the ERC-8004 draft specification
- we use ERC-8004-style identity and reputation concepts
- official Ethereum ecosystem pages may describe live deployments, but the EIP itself remains Draft

### Avoid
- saying ERC-8004 is finalized on mainnet

### Sources
- https://eips.ethereum.org/EIPS/eip-8004
- https://ethereum.org/ai-agents/

## ERC-8183
### Safe
- NexusAgent uses an ERC-8183-compatible job escrow and evaluator flow
- the design is based on the ERC-8183 draft standard

### Avoid
- saying ERC-8183 is a finalized or mature ratified standard

### Sources
- https://eips.ethereum.org/EIPS/eip-8183

## NexusAgent Implementation Status

| Protocol | Implementation Status |
|----------|----------------------|
| OKX Onchain OS | LIVE — Market API (authenticated), DEX Quote API (quote-only), Wallet sign-info API |
| x402 | LIVE endpoint — HTTP 402 flow with txHash-based verification (not full EIP-3009) |
| ERC-8004 | DEPLOYED on X Layer mainnet (`0xB4dDf24c...`), runtime agent registration on-chain |
| ERC-8183 | DEPLOYED on X Layer mainnet (`0xa5f560C6...`), escrow lifecycle executed on-chain (create/fund/submit/complete) |
| A2A | Agent Card LIVE at `/.well-known/agent.json` with 3 skills |
| MCP | LIVE — 5 tools via stdio transport |
| Agentic Wallet | sign-info API integrated in executor + onboarding; email creation is OKX infrastructure |
| Settlement | LIVE on X Layer mainnet — 2 settlement proofs + escrow lifecycle |

## OKX Onboarding Paths
### Safe
- the simplest official path is AI Skills + Agentic Wallet
- MCP is the next-lightest path for MCP-native clients
- Open API is the lower-level integration path

### Avoid
- claiming Open API is the easiest path
- claiming Payment Skills/MCP are already generally live if the official doc still marks them as coming soon

### Sources
- https://web3.okx.com/onchainos/dev-docs/home/install-your-agentic-wallet
- https://web3.okx.com/onchainos/dev-docs/trade/dex-ai-tools-skills
- https://web3.okx.com/ru/onchainos/dev-docs/trade/dex-ai-tools-mcp-server
- https://web3.okx.com/ja/onchainos/dev-docs/market/market-ai-tools-mcp-server
- https://web3.okx.com/it/onchainos/dev-docs/home/api-access-and-usage
