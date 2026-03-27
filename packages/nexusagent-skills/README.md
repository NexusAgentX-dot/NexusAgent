# @nexusagent/skills

AI agent skills for connecting to **NexusAgent** — multi-agent commerce on X Layer.

## Install

```bash
npm install @nexusagent/skills
```

## Quick Start

```bash
# Check connection
npx @nexusagent/skills init

# Get live OKB market signal
npx @nexusagent/skills signal

# Run a full multi-agent workflow
npx @nexusagent/skills run
```

## Programmatic Usage

```typescript
import { NexusAgentClient } from '@nexusagent/skills'

const client = new NexusAgentClient({
  baseUrl: 'http://localhost:8787',
})

// Fetch live OKB signal from OKX Onchain OS
const signal = await client.getOKBSignal()
console.log(`OKB: $${signal.price} (${signal.change24h}% 24h)`)

// Run a full workflow
const ws = await client.createWorkspace('My Agent', 'my-agent')
await client.registerCanonicalAgents(ws.workspaceId)
const result = await client.runWorkflow(
  ws.workspaceId,
  'Check OKB signal and execute bounded transfer',
)
console.log(`Status: ${result.status}`)
```

## Available Skills

| Skill | Method | Description |
|-------|--------|------------|
| `nexusagent-signal` | `getOKBSignal()` | Live OKB market data via OKX Onchain OS |
| `nexusagent-signal` | `getPremiumSignal()` | Premium signal with x402 payment |
| `nexusagent-workflow` | `runWorkflow()` | Full signal → decision → execution → settlement |
| `nexusagent-proof` | `verifyProof()` | Verify on-chain settlement on X Layer |
| `nexusagent-wallet` | `checkWallet()` | Wallet status via Agentic Wallet API |
| `nexusagent-discovery` | `discover()` | A2A Agent Card discovery |

## MCP Integration

For MCP-compatible agents (Claude, LangChain, etc.), use the MCP server directly:

```json
{
  "mcpServers": {
    "nexusagent": {
      "command": "npx",
      "args": ["tsx", "--env-file=.env", "src/mcp/server.ts"],
      "cwd": "/path/to/nexusagent/backend"
    }
  }
}
```

## License

MIT
