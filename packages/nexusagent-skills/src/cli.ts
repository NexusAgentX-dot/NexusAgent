#!/usr/bin/env node
/**
 * NexusAgent Skills CLI
 *
 * Usage:
 *   npx @nexusagent/skills init          — Set up NexusAgent connection
 *   npx @nexusagent/skills signal        — Get live OKB market signal
 *   npx @nexusagent/skills run           — Run a full workflow
 *   npx @nexusagent/skills status        — Check integration status
 */

import { NexusAgentClient } from './index.js'

const command = process.argv[2] || 'help'
const baseUrl = process.env.NEXUSAGENT_URL || 'http://localhost:8787'
const client = new NexusAgentClient({ baseUrl })

async function main() {
  switch (command) {
    case 'init': {
      console.log('🔗 NexusAgent Skills — Setup\n')
      console.log(`Connecting to: ${baseUrl}`)
      try {
        const card = await client.discover() as Record<string, unknown>
        console.log(`✓ Connected to ${card.name} (${card.protocolVersion})`)
        console.log(`  Skills: ${(card.skills as Array<{ id: string }>).map((s) => s.id).join(', ')}`)
        console.log(`  Protocols: ${(card.protocols as string[]).join(', ')}`)

        const status = await client.status() as Record<string, unknown>
        console.log(`  Onchain OS: ${(status.onchainOS as Record<string, unknown>).configured}`)
        console.log(`  Contracts: ERC-8004=${(status.erc8004 as Record<string, unknown>).deployed} ERC-8183=${(status.erc8183 as Record<string, unknown>).deployed}`)
        console.log('\n✓ NexusAgent is ready. Set NEXUSAGENT_URL if not using localhost.')
      } catch (e) {
        console.error(`✗ Could not connect to ${baseUrl}`)
        console.error(`  Make sure NexusAgent backend is running.`)
        console.error(`  Start with: cd backend && npm run dev`)
      }
      break
    }

    case 'signal': {
      console.log('📡 Fetching live OKB market signal...\n')
      const signal = await client.getOKBSignal()
      console.log(`  OKB Price:  $${signal.price}`)
      console.log(`  24h Change: ${signal.change24h}%`)
      console.log(`  Volume 24h: ${signal.volume24h}`)
      console.log(`  Provider:   ${signal.provider}`)
      console.log(`  Approved:   ${signal.approved}`)
      console.log(`  Rule:       ${signal.thresholdRule}`)
      break
    }

    case 'run': {
      console.log('🚀 Running full NexusAgent workflow...\n')

      console.log('  Creating workspace...')
      const ws = await client.createWorkspace('Skills Demo', `skills-${Date.now()}`)
      console.log(`  Workspace: ${ws.workspaceId}`)

      console.log('  Registering canonical agents...')
      await client.registerCanonicalAgents(ws.workspaceId)
      console.log('  ✓ 4 agents registered and verified')

      console.log('  Running workflow...')
      const result = await client.runWorkflow(
        ws.workspaceId,
        'Check the OKB market signal and execute bounded transfer on X Layer',
      )
      console.log(`\n  Status: ${result.status}`)
      console.log(`  Signal: ${result.signalProvider}`)
      for (const step of result.steps) {
        console.log(`  [${step.status.padStart(9)}] ${step.role}: ${(step.outputSummary || '(pending)').slice(0, 80)}`)
      }
      if (result.settlement.txHash) {
        console.log(`\n  Settlement: ${result.settlement.txHash}`)
        console.log(`  Explorer:   ${result.settlement.explorerUrl}`)
      }
      console.log(`  Payment:    ${result.payment.mode} (${result.payment.status})`)
      break
    }

    case 'status': {
      console.log('📊 NexusAgent Integration Status\n')
      const s = await client.status() as Record<string, unknown>
      console.log(JSON.stringify(s, null, 2))
      break
    }

    default:
      console.log(`
@nexusagent/skills — AI agent skills for NexusAgent

Commands:
  init      Set up connection to NexusAgent
  signal    Get live OKB market signal
  run       Run a full multi-agent workflow
  status    Check integration status

Environment:
  NEXUSAGENT_URL    Backend URL (default: http://localhost:8787)

Programmatic usage:
  import { NexusAgentClient } from '@nexusagent/skills'
  const client = new NexusAgentClient({ baseUrl: 'http://localhost:8787' })
  const signal = await client.getOKBSignal()
`)
  }
}

main().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
