import type { AgentMessageEnvelope, WorkflowRun } from '../contracts.js'

const HERO_USE_CASE =
  'Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.'

const NORMALIZED_INTENT = 'okb_signal_then_bounded_xlayer_stablecoin_transfer'

export const approvedWorkflowRun: WorkflowRun = {
  id: 'run_demo_001',
  intent: {
    raw: HERO_USE_CASE,
    normalized: NORMALIZED_INTENT,
  },
  status: 'Settled',
  createdAt: '2026-03-27T10:00:00Z',
  updatedAt: '2026-03-27T10:01:18Z',
  agents: [
    {
      id: 'agent_sentinel',
      name: 'Sentinel',
      role: 'signal_fetcher',
      status: 'completed',
      summary: 'Fetched OKB market context from the configured data source.',
      input: { pair: 'OKB/USDT', signalRule: 'fetch price, 24h volume, RSI' },
      output: {
        price: '48.72',
        volume24h: '12300000',
        rsi14: '28.4',
        signalSummary: 'Oversold signal detected with elevated volume.',
      },
      startedAt: '2026-03-27T10:00:05Z',
      completedAt: '2026-03-27T10:00:25Z',
    },
    {
      id: 'agent_arbiter',
      name: 'Arbiter',
      role: 'decision_engine',
      status: 'completed',
      summary: 'Approved a bounded proof transfer based on the retrieved signal and workflow rules.',
      input: {
        signalSummary: 'Oversold signal detected with elevated volume.',
        maxTransferAmount: '0.10',
        currency: 'USD₮0',
      },
      output: {
        decision: 'approve',
        reason: 'Signal passed the configured threshold.',
        executionMode: 'bounded_proof_transfer',
      },
      startedAt: '2026-03-27T10:00:26Z',
      completedAt: '2026-03-27T10:00:40Z',
    },
    {
      id: 'agent_executor',
      name: 'Executor',
      role: 'execution_engine',
      status: 'completed',
      summary: 'Prepared and submitted the bounded X Layer stablecoin proof transfer.',
      input: {
        decision: 'approve',
        amount: '0.10',
        currency: 'USD₮0',
        targetChain: 'X Layer',
      },
      output: {
        preparedAction: 'stablecoin_proof_transfer',
        executionResult: 'submitted',
        txHash: '0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d',
      },
      startedAt: '2026-03-27T10:00:41Z',
      completedAt: '2026-03-27T10:01:10Z',
    },
    {
      id: 'agent_evaluator',
      name: 'Evaluator',
      role: 'verification_engine',
      status: 'completed',
      summary: 'Verified the execution result and marked the run as settlement-ready.',
      input: {
        executionResult: 'submitted',
        txHash: '0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d',
      },
      output: {
        result: 'pass',
        evaluationNote: 'A live X Layer stablecoin transfer hash is present and explorer-verifiable.',
        settlementReady: true,
      },
      startedAt: '2026-03-27T10:01:11Z',
      completedAt: '2026-03-27T10:01:18Z',
    },
  ],
  events: [
    {
      id: 'evt_1',
      type: 'intent_received',
      title: 'Intent Received',
      description: 'The system accepted the workflow request.',
      timestamp: '2026-03-27T10:00:00Z',
    },
    {
      id: 'evt_2',
      type: 'signal_fetched',
      title: 'Signal Fetched',
      description: 'Sentinel fetched live OKB market data via OKX Onchain OS Market API.',
      timestamp: '2026-03-27T10:00:25Z',
    },
    {
      id: 'evt_3',
      type: 'decision_made',
      title: 'Decision Made',
      description: 'Arbiter approved the bounded X Layer proof transfer.',
      timestamp: '2026-03-27T10:00:40Z',
    },
    {
      id: 'evt_3b',
      type: 'action_prepared',
      title: 'Action Prepared',
      description: 'Executor prepared the bounded stablecoin transfer payload.',
      timestamp: '2026-03-27T10:00:41Z',
    },
    {
      id: 'evt_4',
      type: 'payment_triggered',
      title: 'Payment Triggered',
      description: 'An x402-compatible payment event was recorded for the signal access step.',
      timestamp: '2026-03-27T10:00:45Z',
    },
    {
      id: 'evt_5',
      type: 'action_executed',
      title: 'Action Executed',
      description: 'Executor completed the X Layer stablecoin transfer.',
      timestamp: '2026-03-27T10:01:10Z',
    },
    {
      id: 'evt_6',
      type: 'result_evaluated',
      title: 'Result Evaluated',
      description: 'Evaluator verified the run outcome.',
      timestamp: '2026-03-27T10:01:18Z',
    },
    {
      id: 'evt_7',
      type: 'settlement_recorded',
      title: 'Settlement Recorded',
      description: 'Settlement proof is available for inspection.',
      timestamp: '2026-03-27T10:01:18Z',
    },
  ],
  payment: {
    mode: 'x402_compatible_demo',
    status: 'recorded',
    amount: '0.001',
    currency: 'USDT',
    source: 'orchestrator',
    destination: 'sentinel_signal_service',
    reference: 'pay_evt_demo_001',
  },
  settlement: {
    chain: 'X Layer',
    status: 'confirmed',
    txHash: '0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d',
    explorerUrl:
      'https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d',
    proofSummary:
      'Live X Layer testnet settlement artifact: 0.10 USD₮0 transferred to the proof address and verified on the official explorer.',
  },
}

export const rejectedWorkflowRun: WorkflowRun = {
  id: 'run_demo_rejected_001',
  intent: {
    raw: HERO_USE_CASE,
    normalized: NORMALIZED_INTENT,
  },
  status: 'DecisionMade',
  createdAt: '2026-03-27T11:00:00Z',
  updatedAt: '2026-03-27T11:00:40Z',
  agents: [
    {
      id: 'agent_sentinel',
      name: 'Sentinel',
      role: 'signal_fetcher',
      status: 'completed',
      summary: 'Fetched market context from the configured data source.',
      input: { pair: 'OKB/USDT', signalRule: 'fetch price, 24h volume, RSI' },
      output: {
        price: '51.20',
        volume24h: '6400000',
        rsi14: '57.1',
        signalSummary: 'No execution threshold met.',
      },
      startedAt: '2026-03-27T11:00:05Z',
      completedAt: '2026-03-27T11:00:25Z',
    },
    {
      id: 'agent_arbiter',
      name: 'Arbiter',
      role: 'decision_engine',
      status: 'completed',
      summary: 'Rejected execution because the configured threshold was not met.',
      input: {
        signalSummary: 'No execution threshold met.',
        maxTransferAmount: '1.00',
        currency: 'USDT',
      },
      output: {
        decision: 'reject',
        reason: 'Signal did not pass the configured threshold.',
      },
      startedAt: '2026-03-27T11:00:26Z',
      completedAt: '2026-03-27T11:00:40Z',
    },
    {
      id: 'agent_executor',
      name: 'Executor',
      role: 'execution_engine',
      status: 'skipped',
      summary: 'Execution was skipped after rejection.',
      input: {},
      output: {},
      startedAt: '',
      completedAt: '',
    },
    {
      id: 'agent_evaluator',
      name: 'Evaluator',
      role: 'verification_engine',
      status: 'skipped',
      summary: 'Evaluation was skipped because no action was executed.',
      input: {},
      output: {},
      startedAt: '',
      completedAt: '',
    },
  ],
  events: [
    {
      id: 'evt_r1',
      type: 'intent_received',
      title: 'Intent Received',
      description: 'The system accepted the workflow request.',
      timestamp: '2026-03-27T11:00:00Z',
    },
    {
      id: 'evt_r2',
      type: 'signal_fetched',
      title: 'Signal Fetched',
      description: 'Sentinel retrieved context from the selected data source.',
      timestamp: '2026-03-27T11:00:25Z',
    },
    {
      id: 'evt_r3',
      type: 'decision_made',
      title: 'Decision Made',
      description: 'Arbiter rejected the execution path.',
      timestamp: '2026-03-27T11:00:40Z',
    },
  ],
  payment: {
    mode: 'x402_compatible_demo',
    status: 'pending',
    amount: '0.000',
    currency: 'USDT',
    source: 'orchestrator',
    destination: 'sentinel_signal_service',
    reference: 'pay_evt_demo_rejected_001',
  },
  settlement: {
    chain: 'X Layer',
    status: 'pending',
    txHash: '',
    explorerUrl: '',
    proofSummary: 'No settlement proof was generated because the workflow was rejected before execution.',
  },
}

export const approvedAgentMessages: AgentMessageEnvelope[] = [
  {
    messageId: 'msg_001',
    workflowId: approvedWorkflowRun.id,
    fromAgent: 'Sentinel',
    toAgent: 'Arbiter',
    state: 'SignalFetched',
    payloadType: 'signal_summary',
    payload: approvedWorkflowRun.agents[0].output,
    createdAt: '2026-03-26T18:49:08Z',
  },
  {
    messageId: 'msg_002',
    workflowId: approvedWorkflowRun.id,
    fromAgent: 'Arbiter',
    toAgent: 'Executor',
    state: 'DecisionMade',
    payloadType: 'decision_payload',
    payload: approvedWorkflowRun.agents[1].output,
    createdAt: '2026-03-26T18:49:16Z',
  },
  {
    messageId: 'msg_003',
    workflowId: approvedWorkflowRun.id,
    fromAgent: 'Executor',
    toAgent: 'Evaluator',
    state: 'ActionExecuted',
    payloadType: 'action_payload',
    payload: approvedWorkflowRun.agents[2].output,
    createdAt: '2026-03-26T18:49:40Z',
  },
]

export function normalizeIntent(rawIntent: string) {
  return rawIntent
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function buildWorkflowRun(mode: 'approved' | 'rejected', rawIntent?: string): WorkflowRun {
  const base = mode === 'approved' ? approvedWorkflowRun : rejectedWorkflowRun
  if (!rawIntent || rawIntent === HERO_USE_CASE) {
    return base
  }

  return {
    ...base,
    intent: {
      raw: rawIntent,
      normalized: normalizeIntent(rawIntent),
    },
  }
}

export const heroUseCase = HERO_USE_CASE
