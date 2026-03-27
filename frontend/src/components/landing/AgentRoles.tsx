import { AGENT_META } from '../../data/demo'

const AGENTS = [
  {
    name: 'Sentinel',
    role: 'Signal Fetcher',
    description: 'Fetches relevant tool, market, or service data that grounds the workflow in real context.',
    inputs: ['Normalized intent', 'Data source target'],
    outputs: ['Signal summary', 'Source metadata'],
  },
  {
    name: 'Arbiter',
    role: 'Decision Engine',
    description: 'Interprets Sentinel output and decides whether to proceed. Execution is conditional, not automatic.',
    inputs: ['Sentinel output', 'Decision threshold'],
    outputs: ['Decision (approve/reject)', 'Rationale'],
  },
  {
    name: 'Executor',
    role: 'Execution Engine',
    description: 'Prepares and performs the chain action. The bridge from decision to economic action on X Layer.',
    inputs: ['Arbiter decision', 'Execution payload'],
    outputs: ['Execution result', 'TX hash'],
  },
  {
    name: 'Evaluator',
    role: 'Verification Engine',
    description: 'Verifies whether execution met the expected outcome. Adds trust and closure before settlement.',
    inputs: ['Execution result', 'Acceptance criteria'],
    outputs: ['Pass/fail', 'Settlement recommendation'],
  },
]

export default function AgentRoles() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan uppercase tracking-wider">
            Agent Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Four Specialized Agents
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Each agent has a distinct responsibility. No two are interchangeable —
            the architecture is credible, not theatrical.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {AGENTS.map((agent, i) => {
            const meta = AGENT_META[agent.name]
            return (
              <div
                key={agent.name}
                className="group rounded-xl border bg-surface/40 p-6 transition-all hover:bg-surface/70 anim-fade-up"
                style={{
                  borderColor: `${meta.color}20`,
                  borderLeftWidth: '4px',
                  borderLeftColor: meta.color,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono"
                    style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}30`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{agent.name}</h3>
                    <span className="text-xs font-mono" style={{ color: meta.color }}>{agent.role}</span>
                  </div>
                </div>

                <p className="text-[11px] font-mono mb-3" style={{ color: `${meta.color}99` }}>{meta.tagline}</p>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">{agent.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Inputs</span>
                    <ul className="mt-1 space-y-0.5">
                      {agent.inputs.map((inp) => (
                        <li key={inp} className="text-xs text-text-tertiary flex items-start gap-1.5">
                          <span className="text-text-muted mt-0.5">›</span>{inp}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Outputs</span>
                    <ul className="mt-1 space-y-0.5">
                      {agent.outputs.map((out) => (
                        <li key={out} className="text-xs text-text-tertiary flex items-start gap-1.5">
                          <span className="text-text-muted mt-0.5">›</span>{out}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
