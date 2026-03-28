import { motion } from 'framer-motion'
import type { WorkflowRun } from '../../types/workflow'

interface Props {
  run: WorkflowRun
}

export default function SettlementProof({ run }: Props) {
  const { settlement, payment } = run
  const evaluator = run.agents.find((a) => a.name === 'Evaluator')
  const isArtifactPending = !settlement.explorerUrl || settlement.txHash.includes('DEMO')

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-amber animate-pulse-glow" />
        <h2 className="text-lg font-semibold text-text-primary">Settlement Proof</h2>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber/10 text-amber border border-amber/20">
          {settlement.status}
        </span>
        {isArtifactPending && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-surface-light text-text-tertiary border border-border">
            artifact pending
          </span>
        )}
      </div>

      <div className="rounded-xl border border-amber/20 bg-amber/[0.03] overflow-hidden">
        {/* TX Hash — the most prominent element */}
        <div className="p-6 border-b border-amber/10">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
            Transaction Hash
          </span>
          <div className="mt-2 flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-amber bg-abyss/60 rounded-lg px-4 py-3 border border-amber/10 break-all">
              {settlement.txHash}
            </code>
            {settlement.explorerUrl ? (
              <a
                href={settlement.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-4 py-3 rounded-lg border border-amber/20 bg-amber/[0.06] text-amber text-xs font-mono hover:bg-amber/10 transition-colors no-underline"
              >
                View on Explorer
              </a>
            ) : (
              <span className="shrink-0 px-4 py-3 rounded-lg border border-border bg-surface-light text-text-muted text-xs font-mono">
                explorer pending
              </span>
            )}
          </div>
          {isArtifactPending && (
            <p className="mt-3 text-xs text-text-muted">
              This workflow path has not produced a live explorer-verifiable settlement artifact yet.
            </p>
          )}
        </div>

        {/* Proof details grid */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-amber/10">
          {/* Chain & Settlement */}
          <div className="p-6">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Chain & Settlement
            </span>
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-xs text-text-muted">Chain</span>
                <p className="text-sm font-mono text-text-primary">{settlement.chain}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Status</span>
                <p className="text-sm font-mono text-emerald">{settlement.status}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Proof Summary</span>
                <p className="text-xs text-text-secondary leading-relaxed">{settlement.proofSummary}</p>
              </div>
            </div>
          </div>

          {/* Payment Event */}
          <div className="p-6">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Payment Event
            </span>
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-xs text-text-muted">Mode</span>
                <p className="text-sm font-mono text-text-primary">{payment.mode}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Amount</span>
                <p className="text-sm font-mono text-text-primary">
                  {payment.amount} {payment.currency}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Flow</span>
                <p className="text-xs font-mono text-text-tertiary">
                  {payment.source} → {payment.destination}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Reference</span>
                <p className="text-[10px] font-mono text-text-muted break-all">{payment.reference}</p>
              </div>
            </div>
          </div>

          {/* Evaluator Result */}
          <div className="p-6">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Evaluator Result
            </span>
            {evaluator && (
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-xs text-text-muted">Status</span>
                  <p className="text-sm font-mono text-emerald">
                    {(evaluator.output as Record<string, unknown>).result as string || evaluator.status}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Note</span>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {(evaluator.output as Record<string, unknown>).evaluationNote as string || evaluator.summary}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-text-muted">Summary</span>
                  <p className="text-xs text-text-secondary">{evaluator.summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow summary bar */}
        <div className="border-t border-amber/10 px-6 py-4 bg-abyss/30">
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span>
              <strong className="text-text-secondary">Run ID:</strong>{' '}
              <span className="font-mono">{run.id}</span>
            </span>
            <span>
              <strong className="text-text-secondary">Started:</strong>{' '}
              <span className="font-mono">{new Date(run.createdAt).toLocaleString()}</span>
            </span>
            <span>
              <strong className="text-text-secondary">Settled:</strong>{' '}
              <span className="font-mono">{new Date(run.updatedAt).toLocaleString()}</span>
            </span>
            <span>
              <strong className="text-text-secondary">Agents:</strong>{' '}
              <span className="font-mono">{run.agents.filter((a) => a.status === 'completed').length}/4</span>
            </span>
            <span>
              <strong className="text-text-secondary">Events:</strong>{' '}
              <span className="font-mono">{run.events.length}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
