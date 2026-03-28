const REASONS = [
  { title: 'One Authenticated Stack', desc: 'OKX Onchain OS unifies market signal, DEX quote, wallet gas, and x402 payment under one API key — no stitching separate vendors', icon: '⚡' },
  { title: 'Agentic Wallet Built-in', desc: 'Agents provision TEE-protected wallets via OKX without managing keys — the same infrastructure that secures the execution chain', icon: '🔐' },
  { title: 'x402 Settled On-chain', desc: 'Pay-per-call is not a log entry — it is an EIP-3009 signature that OKX verifies and settles to a mainnet USDT transaction', icon: '💰' },
  { title: 'Explorer-Verifiable Proof', desc: 'Every approved run produces a mainnet TX hash on X Layer — not a simulation, not a stub, an OKLink-verifiable settlement receipt', icon: '📋' },
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
              The full loop — signal to decision to payment to settlement — runs inside one ecosystem. Swap any layer out and you lose the closed chain.
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
