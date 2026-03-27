import assert from 'node:assert/strict'

import { approvedWorkflowRun, rejectedWorkflowRun } from '../backend/src/demo/workflowData.js'
import { canonicalAgents, onboardingTemplate } from '../backend/src/demo/onboarding.js'
import {
  HERO_USE_CASE,
  demoApprovedRun,
  demoRejectedRun,
} from '../frontend/src/data/demo.js'

function eventTypes(run: { events: Array<{ type: string }> }) {
  return run.events.map((event) => event.type)
}

function eventTimestamps(run: { events: Array<{ timestamp: string }> }) {
  return run.events.map((event) => event.timestamp)
}

function agentIds(agents: Array<{ id?: string; agentId?: string }>) {
  return agents.map((agent) => agent.id ?? agent.agentId ?? '')
}

function agentTimes(agents: Array<{ startedAt: string; completedAt: string }>) {
  return agents.map((agent) => ({
    startedAt: agent.startedAt,
    completedAt: agent.completedAt,
  }))
}

assert.equal(HERO_USE_CASE, approvedWorkflowRun.intent.raw, 'Hero use case drifted from backend approved workflow')
assert.equal(HERO_USE_CASE, rejectedWorkflowRun.intent.raw, 'Hero use case drifted from backend rejected workflow')

assert.equal(
  demoApprovedRun.createdAt,
  approvedWorkflowRun.createdAt,
  'Approved workflow createdAt drifted',
)

assert.equal(
  demoApprovedRun.updatedAt,
  approvedWorkflowRun.updatedAt,
  'Approved workflow updatedAt drifted',
)

assert.deepEqual(
  eventTypes(demoApprovedRun),
  eventTypes(approvedWorkflowRun),
  'Approved workflow event sequence drifted between frontend fallback and backend payload',
)

assert.deepEqual(
  eventTimestamps(demoApprovedRun),
  eventTimestamps(approvedWorkflowRun),
  'Approved workflow event timestamps drifted between frontend fallback and backend payload',
)

assert.deepEqual(
  eventTypes(demoRejectedRun),
  eventTypes(rejectedWorkflowRun),
  'Rejected workflow event sequence drifted between frontend fallback and backend payload',
)

assert.deepEqual(
  eventTimestamps(demoRejectedRun),
  eventTimestamps(rejectedWorkflowRun),
  'Rejected workflow event timestamps drifted between frontend fallback and backend payload',
)

assert.equal(
  demoApprovedRun.payment.mode,
  approvedWorkflowRun.payment.mode,
  'Approved workflow payment mode drifted',
)

assert.equal(
  demoRejectedRun.payment.mode,
  rejectedWorkflowRun.payment.mode,
  'Rejected workflow payment mode drifted',
)

assert.equal(
  demoApprovedRun.settlement.chain,
  approvedWorkflowRun.settlement.chain,
  'Approved workflow settlement chain drifted',
)

assert.equal(
  demoApprovedRun.settlement.txHash,
  approvedWorkflowRun.settlement.txHash,
  'Approved workflow settlement tx hash drifted',
)

assert.equal(
  demoApprovedRun.settlement.explorerUrl,
  approvedWorkflowRun.settlement.explorerUrl,
  'Approved workflow settlement explorer URL drifted',
)

assert.equal(
  demoApprovedRun.settlement.proofSummary,
  approvedWorkflowRun.settlement.proofSummary,
  'Approved workflow settlement proof summary drifted',
)

assert.equal(
  demoApprovedRun.payment.amount,
  approvedWorkflowRun.payment.amount,
  'Approved workflow payment amount drifted',
)

assert.equal(
  demoRejectedRun.status,
  rejectedWorkflowRun.status,
  'Rejected workflow status drifted',
)

assert.equal(
  demoRejectedRun.createdAt,
  rejectedWorkflowRun.createdAt,
  'Rejected workflow createdAt drifted',
)

assert.equal(
  demoRejectedRun.updatedAt,
  rejectedWorkflowRun.updatedAt,
  'Rejected workflow updatedAt drifted',
)

assert.deepEqual(
  agentIds(demoApprovedRun.agents),
  agentIds(approvedWorkflowRun.agents),
  'Approved workflow agent order drifted',
)

assert.deepEqual(
  agentTimes(demoApprovedRun.agents),
  agentTimes(approvedWorkflowRun.agents),
  'Approved workflow agent timings drifted',
)

assert.deepEqual(
  agentIds(demoRejectedRun.agents),
  agentIds(rejectedWorkflowRun.agents),
  'Rejected workflow agent order drifted',
)

assert.deepEqual(
  agentTimes(demoRejectedRun.agents),
  agentTimes(rejectedWorkflowRun.agents),
  'Rejected workflow agent timings drifted',
)

assert.deepEqual(
  onboardingTemplate.supportedPaths.map((path) => path.id),
  ['skills', 'mcp', 'open_api'],
  'Onboarding path ids drifted from the expected order',
)

assert.deepEqual(
  canonicalAgents.map((agent) => agent.agentId),
  ['agent_sentinel', 'agent_arbiter', 'agent_executor', 'agent_evaluator'],
  'Canonical onboarding agents drifted from the expected order',
)

console.log('Frontend/backend contract sync checks passed.')
