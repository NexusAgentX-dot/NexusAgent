const REASONS = [
  { title: 'TEE Wallet', desc: 'OKX Agentic Wallet — sign-info API for gas estimation', icon: '🔐' },
  { title: 'Onchain OS', desc: 'Market, DEX, Wallet APIs in one ecosystem', icon: '⚡' },
  { title: 'Settlement', desc: 'Explorer-verifiable proof on X Layer', icon: '📋' },
  { title: 'Onboarding', desc: 'AI Skills + MCP integration paths', icon: '🔗' },
]

export default function WhyXLayer() {
  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          <div className="md:w-1/3">
            <span className="text-xs font-mono text-cyan uppercase tracking-wider">Ecosystem Fit</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-3">Why X Layer + OKX</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              A uniquely integrated path for agent onboarding, secure execution, and economic activity.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {REASONS.map((r, i) => (
              <div
                key={r.title}
                className="rounded-xl border border-border bg-surface/40 p-4 anim-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="text-xl mb-2">{r.icon}</div>
                <h3 className="font-semibold text-sm text-text-primary mb-1">{r.title}</h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
