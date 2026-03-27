# Agent Onboarding Contract

## Purpose
This file defines the minimum contract for bringing a third-party agent into NexusAgent.

Strategic importance:
the project claims builder onboarding as a core value proposition.
That claim is not credible unless we define what an onboarded agent actually is.

## Supported Onboarding Paths
### Preferred
- AI Skills + Agentic Wallet

### Secondary
- MCP + Agentic Wallet

### Advanced
- Open API + custom integration

## Minimum Registration Fields
Every onboarded agent should provide:
- `agentId`
- `name`
- `description`
- `role`
- `integrationPath`
- `walletType`
- `walletReference`
- `capabilities`
- `supportedActions`
- `status`

## Integration Path Values
- `skills`
- `mcp`
- `open_api`

## Wallet Type Values
- `agentic_wallet`
- `external_wallet`

## Capability Examples
- `market_context`
- `decisioning`
- `execution`
- `evaluation`
- `risk_check`

## Product Requirement
The frontend should visibly explain that external agents can be brought in through official onboarding paths.

## MVP Requirement
The MVP does not need full self-serve onboarding.
It does need a visible, believable onboarding model.

## Success Condition
An informed judge or builder should be able to answer:
- what information an external agent needs to provide
- how that agent enters the system
- how the system knows what the agent can do
