import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section className="py-24 px-6 border-t border-border relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan/[0.04] blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center anim-fade-up">
        <div className="flex justify-center mb-6">
          <a
            href="https://www.oklink.com/xlayer/tx/0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald/30 bg-emerald/[0.06] text-emerald text-xs font-mono no-underline hover:bg-emerald/[0.10] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
            Settlement Proof · 0x5c49ba29...d37f · OKLink ↗
          </a>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          See the Workflow in Action
        </h2>
        <p className="text-text-secondary mb-8 max-w-xl mx-auto">
          Watch four agents coordinate, pay via x402 through OKX Facilitator, execute on X Layer,
          and produce explorer-verifiable settlement proof — all from a single intent.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-8 py-3.5 rounded-lg bg-cyan text-void font-semibold hover:bg-cyan-dim transition-colors no-underline"
          >
            Launch Dashboard
          </Link>
          <Link
            to="/onboarding"
            className="px-8 py-3.5 rounded-lg border border-border text-text-secondary font-medium hover:border-cyan/40 hover:text-cyan transition-all no-underline"
          >
            Explore Onboarding
          </Link>
        </div>
      </div>
    </section>
  )
}
