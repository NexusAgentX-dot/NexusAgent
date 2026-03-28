import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HERO_USE_CASE } from '../../data/demo'
import { getOKBSignal } from '../../lib/api'

export default function Hero() {
  const [signal, setSignal] = useState<{ price: string; change24h: string } | null>(null)
  const [signalLoading, setSignalLoading] = useState(true)

  useEffect(() => {
    getOKBSignal()
      .then((s) => {
        if (s) setSignal({ price: s.price, change24h: s.change24h })
      })
      .catch(() => { /* signal stays null — static fallback shown */ })
      .finally(() => setSignalLoading(false))
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-cyan/[0.04] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="flex justify-center mb-8 anim-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan/20 bg-cyan/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse-glow" />
            <span className="text-xs font-mono text-cyan tracking-wide uppercase">
              Built on X Layer
            </span>
          </div>
        </div>

        <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 anim-fade-up anim-d1">
          <span className="text-text-primary">Multi-Agent Commerce</span>
          <br />
          <span className="bg-gradient-to-r from-cyan to-cyan-dim bg-clip-text text-transparent">
            on X Layer
          </span>
        </h1>

        <p className="text-center text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-6 leading-relaxed anim-fade-up anim-d2">
          A governed execution layer where external AI agents register on-chain, access live market signals
          via OKX Onchain OS, pay per call through x402, and produce explorer-verifiable proof on X Layer mainnet.
        </p>

        <p className="text-center text-sm text-text-muted max-w-2xl mx-auto mb-10 font-mono anim-fade-up anim-d3">
          Signal → Decision → x402 Payment → Execution → Settlement · Every step on-chain · Every outcome verifiable
        </p>

        {/* Live Stats Bar */}
        <div className="flex justify-center mb-10 anim-fade-up anim-d3">
          <div className="inline-flex items-center gap-3 md:gap-5 px-5 py-2.5 rounded-full border border-border/60 bg-surface/50 backdrop-blur-sm">
            {signal ? (
              <>
                <span className="text-xs font-mono text-text-primary">
                  OKB <span className="font-semibold">${signal.price}</span>
                </span>
                <span className={`text-xs font-mono ${parseFloat(signal.change24h) < 0 ? 'text-red' : 'text-emerald'}`}>
                  {signal.change24h}%
                </span>
                <span className="w-px h-3 bg-border" />
              </>
            ) : signalLoading ? (
              <>
                <span className="text-xs font-mono text-text-tertiary">OKB Loading...</span>
                <span className="w-px h-3 bg-border" />
              </>
            ) : (
              <>
                <span className="text-xs font-mono text-text-muted">OKB Market Signal</span>
                <span className="w-px h-3 bg-border" />
              </>
            )}
            <span className="text-xs font-mono text-text-muted">x402 · OKX Facilitator</span>
            <span className="w-px h-3 bg-border hidden md:block" />
            <span className="text-xs font-mono text-text-muted hidden md:block">4 Agents Registered</span>
            <span className="w-px h-3 bg-border hidden md:block" />
            <span className="text-xs font-mono text-emerald hidden md:block">X Layer Mainnet</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-16 anim-fade-up anim-d4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg bg-cyan text-void font-semibold text-sm hover:bg-cyan-dim transition-colors no-underline"
          >
            Launch Demo
          </Link>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-lg border border-border text-text-secondary font-medium text-sm hover:border-cyan/40 hover:text-cyan transition-all no-underline"
          >
            Onboard an Agent
          </Link>
        </div>

        <div className="max-w-4xl mx-auto anim-fade-up anim-d5">
          <div className="rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan animate-pulse-glow" />
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">
                  Governed Agent Commerce Flow
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald px-2 py-0.5 rounded border border-emerald/20 bg-emerald/[0.06]">
                Mainnet Verified
              </span>
            </div>
            <p className="font-mono text-sm text-text-secondary leading-relaxed">
              {HERO_USE_CASE}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Sentinel', 'Arbiter', 'Executor', 'Evaluator'].map((agent) => (
                  <span
                    key={agent}
                    className="px-2.5 py-1 rounded text-xs font-mono border border-border bg-surface-light text-text-tertiary"
                  >
                    {agent}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
                <span className="px-2.5 py-1 rounded text-xs font-mono border border-cyan/30 bg-cyan/[0.06] text-cyan">
                  OKX Onchain OS Signal
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono border border-violet-400/30 bg-violet-400/[0.06] text-violet-400">
                  x402 · OKX Facilitator
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono border border-amber/30 bg-amber/[0.06] text-amber">
                  Settlement Proof · OKLink ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
