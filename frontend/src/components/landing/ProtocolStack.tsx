const PROTOCOLS = [
  { name: 'X Layer', desc: 'Settlement and proof recording chain', status: 'live' as const, color: '#f0b232' },
  { name: 'Agentic Wallet', desc: 'TEE-protected secure wallet for AI agents', status: 'integrated' as const, color: '#ff4d4f' },
  { name: 'OKX Onchain OS', desc: 'Market, DEX, and Wallet API for agents', status: 'live' as const, color: '#3b82f6' },
  { name: 'x402', desc: 'HTTP 402 pay-per-call payment protocol', status: 'live' as const, color: '#a78bfa' },
  { name: 'A2A v0.3', desc: 'Agent discovery and coordination', status: 'live' as const, color: '#00e5cc' },
  { name: 'MCP', desc: 'Agent-to-tool connectivity (5 tools)', status: 'live' as const, color: '#10b981' },
  { name: 'ERC-8004', desc: 'On-chain agent identity registry', status: 'deployed' as const, color: '#f0b232' },
  { name: 'ERC-8183', desc: 'Agentic commerce escrow', status: 'deployed' as const, color: '#f0b232' },
]

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald',
  deployed: 'bg-amber',
  integrated: 'bg-cyan',
}

const STATUS_LABEL: Record<string, string> = {
  live: 'Live',
  deployed: 'Deployed',
  integrated: 'Integrated',
}

export default function ProtocolStack() {
  return (
    <section className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-cyan uppercase tracking-wider">
            Standards-Aligned Stack
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Protocol Architecture
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Built on established open standards and OKX infrastructure.
            No proprietary lock-in — agents connect through documented, composable layers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROTOCOLS.map((proto, i) => (
            <div
              key={proto.name}
              className="rounded-xl border border-border bg-surface/40 p-5 hover:bg-surface/70 transition-all anim-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-text-primary">{proto.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[proto.status]}`} />
                  <span className="text-[10px] font-mono text-text-muted uppercase">{STATUS_LABEL[proto.status]}</span>
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{proto.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
