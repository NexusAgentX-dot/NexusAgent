import type { WorkflowRun } from '../types/workflow'

export const HERO_USE_CASE = 'Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.'

export const demoApprovedRun: WorkflowRun = {
  id: 'run_demo_001',
  intent: {
    raw: HERO_USE_CASE,
    normalized: 'okb_signal_then_bounded_xlayer_stablecoin_transfer',
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
      summary: 'Fetched OKB/USDT market context from the configured data source.',
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
        txHash: '0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f',
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
      input: { executionResult: 'submitted', txHash: '0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f' },
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
      id: 'evt_4',
      type: 'action_prepared',
      title: 'Action Prepared',
      description: 'Executor assembled the bounded stablecoin transfer payload.',
      timestamp: '2026-03-27T10:00:41Z',
    },
    {
      id: 'evt_5',
      type: 'payment_triggered',
      title: 'Payment Triggered',
      description: 'x402 payment event recorded for Onchain OS signal access.',
      timestamp: '2026-03-27T10:00:45Z',
    },
    {
      id: 'evt_6',
      type: 'action_executed',
      title: 'Action Executed',
      description: 'Executor completed the X Layer stablecoin transfer.',
      timestamp: '2026-03-27T10:01:10Z',
    },
    {
      id: 'evt_7',
      type: 'result_evaluated',
      title: 'Result Evaluated',
      description: 'Evaluator verified the transaction outcome.',
      timestamp: '2026-03-27T10:01:18Z',
    },
    {
      id: 'evt_8',
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
    txHash: '0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f',
    explorerUrl:
      'https://www.oklink.com/xlayer/tx/0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f',
    proofSummary:
      'Live X Layer mainnet settlement: 0.01 USD₮0 bounded transfer verified on OKLink explorer.',
  },
}

export const demoRejectedRun: WorkflowRun = {
  id: 'run_demo_rejected_001',
  intent: {
    raw: HERO_USE_CASE,
    normalized: 'okb_signal_then_bounded_xlayer_stablecoin_transfer',
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
      description: 'Sentinel fetched live OKB market data via OKX Onchain OS Market API.',
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
    proofSummary:
      'No settlement proof was generated because the workflow was rejected before execution.',
  },
}

export const PIPELINE_STEPS = [
  { key: 'intent_received', label: 'Intent', short: 'IN' },
  { key: 'signal_fetched', label: 'Signal', short: 'SG' },
  { key: 'decision_made', label: 'Decision', short: 'DC' },
  { key: 'action_prepared', label: 'Preparation', short: 'PR' },
  { key: 'payment_triggered', label: 'Payment', short: 'PY' },
  { key: 'action_executed', label: 'Execution', short: 'EX' },
  { key: 'result_evaluated', label: 'Evaluation', short: 'EV' },
  { key: 'settlement_recorded', label: 'Settlement', short: 'ST' },
] as const

export const AGENT_META: Record<string, { color: string; icon: string; tagline: string }> = {
  Sentinel: {
    color: '#00e5cc',
    icon: '◉',
    tagline: 'Signal Fetcher — External context and data',
  },
  Arbiter: {
    color: '#f0b232',
    icon: '◈',
    tagline: 'Decision Engine — Conditional judgment',
  },
  Executor: {
    color: '#3b82f6',
    icon: '▸',
    tagline: 'Execution Engine — Chain action and wallet ops',
  },
  Evaluator: {
    color: '#10b981',
    icon: '✓',
    tagline: 'Verification Engine — Result validation',
  },
}

export const PROTOCOL_STACK = [
  {
    name: 'X Layer',
    desc: 'Settlement and proof recording chain',
    layer: 'Settlement',
  },
  {
    name: 'Agentic Wallet',
    desc: 'TEE-protected secure wallet for AI agents',
    layer: 'Security',
  },
  {
    name: 'OKX Onchain OS',
    desc: 'Wallet, trade, market, and payment-relevant capabilities in one agent ecosystem',
    layer: 'Infrastructure',
  },
  {
    name: 'x402',
    desc: 'Open pay-per-call payment protocol',
    layer: 'Payment',
  },
  {
    name: 'A2A v1.0',
    desc: 'Agent-to-agent coordination standard',
    layer: 'Coordination',
  },
  {
    name: 'MCP',
    desc: 'Agent-to-tool connectivity layer',
    layer: 'Connectivity',
  },
]
