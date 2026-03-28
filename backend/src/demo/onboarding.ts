import type { OnboardingTemplate, RegisteredAgent } from '../contracts.js'

export const onboardingTemplate: OnboardingTemplate = {
  supportedPaths: [
    {
      id: 'skills',
      label: 'AI Skills + Agentic Wallet',
      badge: 'Preferred',
      description:
        'The simplest official onboarding path. Use OKX AI Skills for pre-built capabilities and Agentic Wallet for secure wallet setup.',
      walletType: 'agentic_wallet',
    },
    {
      id: 'mcp',
      label: 'MCP + Agentic Wallet',
      badge: 'Secondary',
      description:
        'For MCP-native clients. Connect through the MCP layer with Agentic Wallet for secure execution.',
      walletType: 'agentic_wallet',
    },
    {
      id: 'open_api',
      label: 'Open API + Custom Integration',
      badge: 'Advanced',
      description:
        'A lower-level integration path for builders who need more control over their integration model.',
      walletType: 'external_wallet',
    },
  ],
  requiredFields: [
    { field: 'agentId', type: 'string', description: 'Unique identifier for the agent' },
    { field: 'name', type: 'string', description: 'Human-readable agent name' },
    { field: 'description', type: 'string', description: 'What this agent does' },
    {
      field: 'role',
      type: 'enum',
      description: 'signal_fetcher | decision_engine | execution_engine | verification_engine',
    },
    { field: 'integrationPath', type: 'enum', description: 'skills | mcp | open_api' },
    { field: 'walletType', type: 'enum', description: 'agentic_wallet | external_wallet' },
    { field: 'walletReference', type: 'string', description: 'Wallet address or reference' },
    { field: 'capabilities', type: 'string[]', description: 'List of agent capabilities' },
    { field: 'supportedActions', type: 'string[]', description: 'Actions this agent can perform' },
  ],
  capabilityOptions: ['market_context', 'decisioning', 'execution', 'evaluation', 'risk_check'],
}

export const canonicalAgents: RegisteredAgent[] = [
  {
    agentId: 'agent_sentinel',
    name: 'Sentinel',
    description: 'Fetches market or tool context and produces structured signal summaries.',
    role: 'signal_fetcher',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_sentinel_demo',
    capabilities: ['market_context'],
    supportedActions: ['fetch_market_context'],
    status: 'active',
  },
  {
    agentId: 'agent_arbiter',
    name: 'Arbiter',
    description: 'Evaluates workflow rules and decides whether the run should proceed.',
    role: 'decision_engine',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_arbiter_demo',
    capabilities: ['decisioning', 'risk_check'],
    supportedActions: ['approve_or_reject_run'],
    status: 'active',
  },
  {
    agentId: 'agent_executor',
    name: 'Executor',
    description: 'Prepares and performs the chain-side action once a run is approved.',
    role: 'execution_engine',
    integrationPath: 'mcp',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_executor_demo',
    capabilities: ['execution'],
    supportedActions: ['bounded_stablecoin_transfer'],
    status: 'active',
  },
  {
    agentId: 'agent_evaluator',
    name: 'Evaluator',
    description: 'Verifies the execution result and determines settlement readiness.',
    role: 'verification_engine',
    integrationPath: 'skills',
    walletType: 'agentic_wallet',
    walletReference: 'wallet_ref_evaluator_demo',
    capabilities: ['evaluation'],
    supportedActions: ['verify_outcome'],
    status: 'active',
  },
]
