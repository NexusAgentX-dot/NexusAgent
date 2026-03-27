import { readFileSync } from 'node:fs'
import path from 'node:path'

const repoRoot = '/Users/kb/Desktop/X链比赛2个'

const publicFiles = [
  'frontend/src/components/landing/Hero.tsx',
  'frontend/src/components/landing/HowItWorks.tsx',
  'frontend/src/components/landing/CallToAction.tsx',
  'frontend/src/components/landing/ProtocolStack.tsx',
  'frontend/src/components/dashboard/SettlementProof.tsx',
  'frontend/src/components/layout/Layout.tsx',
  'frontend/src/data/demo.ts',
  'README.md',
  'docs/20_DEMO_SCRIPT.md',
]

const patterns = [
  { label: 'testnet wording', regex: /\btestnet\b/gi },
  { label: 'demo-compatible payment wording', regex: /\bdemo-compatible\b/gi },
  { label: 'x402_compatible_demo literal', regex: /\bx402_compatible_demo\b/g },
  { label: 'draft-based wording', regex: /\bdraft-based\b/gi },
  { label: 'placeholder wording', regex: /\bplaceholder\b/gi },
]

type MatchRecord = {
  file: string
  label: string
  count: number
}

const matches: MatchRecord[] = []

for (const relativePath of publicFiles) {
  const fullPath = path.join(repoRoot, relativePath)
  const text = readFileSync(fullPath, 'utf8')

  for (const pattern of patterns) {
    const found = text.match(pattern.regex)
    if (found && found.length > 0) {
      matches.push({
        file: fullPath,
        label: pattern.label,
        count: found.length,
      })
    }
  }
}

if (matches.length === 0) {
  console.log('No flagged public-facing claim terms found.')
  process.exit(0)
}

console.log('Public-facing claim audit:')
for (const match of matches) {
  console.log(`- ${match.label}: ${match.count} hit(s) in ${match.file}`)
}
