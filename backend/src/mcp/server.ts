import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const server = new McpServer({
  name: 'nexusagent',
  version: '0.1.0',
})

server.tool(
  'get_okb_signal',
  'Get live OKB market signal from OKX Onchain OS Market API',
  {},
  async () => {
    const { fetchOKBMarketSignal } = await import('../integrations/okxMarket.js')
    const signal = await fetchOKBMarketSignal()
    return { content: [{ type: 'text' as const, text: JSON.stringify(signal, null, 2) }] }
  },
)

server.tool(
  'get_dex_quote',
  'Get DEX aggregator quote for X Layer swap via OKX Onchain OS',
  {},
  async () => {
    const { fetchDexQuote } = await import('../integrations/okxDex.js')
    const quote = await fetchDexQuote()
    return { content: [{ type: 'text' as const, text: JSON.stringify(quote, null, 2) }] }
  },
)

server.tool(
  'check_settlement_proof',
  'Verify a settlement proof transaction on X Layer via RPC receipt',
  { txHash: z.string(), explorerUrl: z.string() },
  async (args) => {
    const { verifySettlementProof } = await import('../lib/verifySettlementProof.js')
    const result = await verifySettlementProof(args.txHash, args.explorerUrl)
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  },
)

server.tool(
  'check_wallet_status',
  'Check if a wallet is reachable via OKX Onchain OS Wallet API',
  { address: z.string() },
  async (args) => {
    const { checkWalletReady } = await import('../integrations/okxWallet.js')
    const status = await checkWalletReady(args.address)
    return { content: [{ type: 'text' as const, text: JSON.stringify(status, null, 2) }] }
  },
)

server.tool(
  'get_integration_status',
  'Get NexusAgent integration status for all connected services',
  {},
  async () => {
    const { isOKXConfigured } = await import('../integrations/okxOnchainOS.js')
    const { isContractIntegrationEnabled } = await import('../integrations/contracts.js')
    const status = {
      okxOnchainOS: isOKXConfigured(),
      erc8004: isContractIntegrationEnabled(),
      erc8183: isContractIntegrationEnabled(),
      x402: true,
      mcpServer: true,
      walletAPI: isOKXConfigured(),
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(status, null, 2) }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
