import { PIPELINE_STEPS } from '../../data/demo'

const STEP_COLORS: Record<string, string> = {
  intent_received: '#94a3b8',
  signal_fetched: '#00e5cc',
  decision_made: '#f0b232',
  action_prepared: '#3b82f6',
  payment_triggered: '#a78bfa',
  action_executed: '#3b82f6',
  result_evaluated: '#10b981',
  settlement_recorded: '#f0b232',
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  intent_received: 'Workflow request submitted',
  signal_fetched: 'OKB signal via Onchain OS',
  decision_made: 'Arbiter approves or rejects',
  action_prepared: 'Executor assembles payload',
  payment_triggered: 'x402 payment recorded',
  action_executed: 'X Layer transfer submitted',
  result_evaluated: 'Evaluator verifies outcome',
  settlement_recorded: 'Proof recorded on-chain',
}

export default function HowItWorks() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan uppercase tracking-wider">
            Workflow Pipeline
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            From Intent to Settlement
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Every workflow follows a deterministic state machine. No ambiguity, no hidden steps.
            Each state corresponds to one visible product event.
          </p>
        </div>

        {/* Horizontal pipeline flow */}
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start gap-0 min-w-[900px] lg:min-w-0">
            {PIPELINE_STEPS.map((step, i) => {
              const color = STEP_COLORS[step.key]
              const isLast = i === PIPELINE_STEPS.length - 1
              return (
                <div key={step.key} className="flex items-start flex-1 anim-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex flex-col items-center text-center w-full">
                    {/* Node */}
                    <div
                      className="relative w-14 h-14 rounded-xl border flex items-center justify-center mb-2 transition-all hover:scale-110"
                      style={{ borderColor: `${color}40`, background: `${color}10` }}
                    >
                      <span className="font-mono font-bold text-xs" style={{ color }}>
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-text-primary mb-0.5">
                      {step.label}
                    </span>
                    <span className="text-[10px] text-text-muted leading-tight px-1 max-w-[110px]">
                      {STEP_DESCRIPTIONS[step.key]}
                    </span>
                  </div>
                  {/* Arrow connector */}
                  {!isLast && (
                    <div className="flex items-center pt-6 px-0.5 shrink-0">
                      <div className="w-4 h-px bg-border" />
                      <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-border" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Two surfaces callout */}
        <div className="mt-16 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-cyan/20 bg-cyan/[0.04] p-6 anim-fade-up anim-d2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan" />
              <span className="text-xs font-mono text-cyan uppercase tracking-wider">
                Builder Surface
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Third-party agents enter through official OKX-friendly onboarding paths.
              They register capabilities, receive a secure wallet, and become composable workflow participants.
            </p>
          </div>
          <div className="rounded-xl border border-amber/20 bg-amber/[0.04] p-6 anim-fade-up anim-d3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber" />
              <span className="text-xs font-mono text-amber uppercase tracking-wider">
                Showcase Workflow
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              The flagship workflow proves that onboarded agents can coordinate, pay, execute,
              and settle — forming a complete economic loop on X Layer.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
