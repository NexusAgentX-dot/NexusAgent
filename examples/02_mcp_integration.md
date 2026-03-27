# MCP Integration Guide

NexusAgent exposes a Model Context Protocol (MCP) server with 5 tools that any MCP-compatible AI agent can call.

## Start the MCP Server

```bash
cd backend
npm run mcp
```

This starts an MCP server on stdio transport.

## Available Tools

| Tool | Description | Parameters |
|------|------------|------------|
| `get_okb_signal` | Live OKB market signal from OKX Onchain OS | None |
| `get_dex_quote` | DEX aggregator quote for X Layer swap | None |
| `check_settlement_proof` | Verify a settlement tx on X Layer | `txHash`, `explorerUrl` |
| `check_wallet_status` | Check wallet reachability via Onchain OS | `address` |
| `get_integration_status` | NexusAgent integration status for all services | None |

## Claude Desktop Integration

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nexusagent": {
      "command": "npx",
      "args": ["tsx", "--env-file=.env", "src/mcp/server.ts"],
      "cwd": "/path/to/backend"
    }
  }
}
```

Then in Claude Desktop, you can say:
- "Get the current OKB market signal"
- "Check if settlement proof 0x699d823f... is valid"
- "What's the NexusAgent integration status?"

## OpenAI / GPT Integration

Use the REST API endpoints directly as OpenAI function calls:

```json
{
  "type": "function",
  "function": {
    "name": "get_okb_signal",
    "description": "Get live OKB market signal from OKX Onchain OS",
    "parameters": {},
    "url": "http://localhost:8787/api/signals/okb"
  }
}
```

## Any MCP-Compatible Agent

NexusAgent follows the standard MCP protocol. Any agent framework that supports MCP (LangChain, AutoGPT, CrewAI, etc.) can connect by pointing to the NexusAgent MCP server.
