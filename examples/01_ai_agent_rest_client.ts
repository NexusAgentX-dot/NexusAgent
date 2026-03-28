#!/usr/bin/env npx tsx
/**
 * Example 1: External AI Agent calling NexusAgent via REST API
 *
 * This demonstrates how any AI agent (Claude, GPT, custom LLM) can:
 * 1. Discover NexusAgent capabilities via A2A Agent Card
 * 2. Check live OKB market signal
 * 3. Create a workspace and run a full workflow
 *
 * Usage:
 *   npx tsx examples/01_ai_agent_rest_client.ts
 *
 * Requires: backend running at http://localhost:8787
 */

const BASE = 'http://localhost:8787'

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function main() {
  console.log('=== NexusAgent AI Agent Client Demo ===\n')

  // Step 1: Discover capabilities via A2A Agent Card
  console.log('1. Discovering NexusAgent via A2A Agent Card...')
  const card = await json<Record<string, unknown>>('/.well-known/agent.json')
  console.log(`   Name: ${card.name}`)
  console.log(`   Protocol: ${card.protocolVersion}`)
  console.log(`   Skills: ${(card.skills as Array<{ id: string }>).map(s => s.id).join(', ')}`)

  // Step 2: Check integration status
  console.log('\n2. Checking integration status...')
  const status = await json<Record<string, unknown>>('/api/integrations/status')
  console.log(`   Onchain OS: ${(status.onchainOS as Record<string, unknown>).configured}`)
  console.log(`   x402: ${(status.x402 as Record<string, unknown>).configured}`)
  console.log(`   ERC-8004: ${(status.erc8004 as Record<string, unknown>).deployed}`)
  console.log(`   ERC-8183: ${(status.erc8183 as Record<string, unknown>).deployed}`)

  // Step 3: Fetch live OKB market signal
  console.log('\n3. Fetching live OKB market signal...')
  const { signal } = await json<{ signal: Record<string, unknown> }>('/api/signals/okb')
  console.log(`   OKB Price: $${signal.price}`)
  console.log(`   24h Change: ${signal.change24h}%`)
  console.log(`   Provider: ${signal.provider}`)
  console.log(`   Approved: ${signal.approved}`)

  // Step 4: Create workspace
  console.log('\n4. Creating workspace...')
  const ws = await json<{ workspace: { workspaceId: string }; workspaceAccess: { accessKey: string } }>(
    '/api/workspaces',
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'AI Agent Demo', slug: `ai-demo-${Date.now()}`, createdBy: 'external_ai_agent' }) },
  )
  const wsId = ws.workspace.workspaceId
  const key = ws.workspaceAccess.accessKey
  const auth = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  console.log(`   Workspace: ${wsId}`)

  // Step 5: Register 4 agents
  console.log('\n5. Registering 4 specialized agents...')
  const roles = [
    { agentId: 'ext_sentinel', name: 'External Sentinel', role: 'signal_fetcher', capabilities: ['market_context'], supportedActions: ['fetch_market_context'] },
    { agentId: 'ext_arbiter', name: 'External Arbiter', role: 'decision_engine', capabilities: ['decisioning'], supportedActions: ['approve_or_reject_run'] },
    { agentId: 'ext_executor', name: 'External Executor', role: 'execution_engine', capabilities: ['execution'], supportedActions: ['bounded_stablecoin_transfer'] },
    { agentId: 'ext_evaluator', name: 'External Evaluator', role: 'verification_engine', capabilities: ['evaluation'], supportedActions: ['verify_outcome'] },
  ]
  for (const r of roles) {
    await json(`/api/workspaces/${wsId}/agents`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ ...r, ownerMemberId: 'ai_agent', description: `AI-controlled ${r.name}`, integrationPath: 'skills', walletType: 'agentic_wallet', walletReference: `okx://wallet/${r.agentId}` }),
    })
    await json(`/api/workspaces/${wsId}/agents/${r.agentId}/verify-wallet`, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ verificationMethod: 'ai_attestation' }),
    })
    console.log(`   Registered + verified: ${r.name} (${r.role})`)
  }

  // Step 6: Run workflow
  console.log('\n6. Triggering workflow: "Check OKB signal and execute bounded transfer"...')
  const wf = await json<{ workflow: { workflowRun: Record<string, unknown>; workflowSteps: Array<Record<string, unknown>>; settlement: Record<string, unknown> } }>(
    `/api/workspaces/${wsId}/workflows`,
    { method: 'POST', headers: auth,
      body: JSON.stringify({ workflowTemplateId: 'tpl_ai_agent', intent: 'Check the OKB market signal and execute bounded transfer on X Layer', triggeredByMemberId: 'ai_agent' }) },
  )
  const run = wf.workflow.workflowRun
  console.log(`   Status: ${run.status}`)
  console.log(`   Signal: ${run.signalProvider}`)
  for (const step of wf.workflow.workflowSteps) {
    console.log(`   [${String(step.status).padStart(9)}] ${step.role}: ${String(step.outputSummary || '(pending)').slice(0, 80)}`)
  }

  // Step 7: Check usage
  console.log('\n7. Checking usage summary...')
  const usage = await json<Record<string, unknown>>(`/api/workspaces/${wsId}/usage/summary`, { headers: auth })
  console.log(`   Total runs: ${usage.totalRuns}`)
  console.log(`   Billed: $${usage.totalBillableAmount} ${usage.billableCurrency}`)

  console.log('\n=== Demo Complete ===')
  console.log('An external AI agent successfully:')
  console.log('  - Discovered NexusAgent via A2A Agent Card')
  console.log('  - Fetched live OKB market data via Onchain OS')
  console.log('  - Created a workspace and registered 4 agents')
  console.log('  - Ran a multi-agent workflow with on-chain settlement')
  console.log('  - Retrieved billing summary')
}

main().catch((e) => { console.error('Error:', e.message); process.exit(1) })
