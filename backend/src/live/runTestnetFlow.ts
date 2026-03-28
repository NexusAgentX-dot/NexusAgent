import { heroUseCase } from '../demo/workflowData.js'
import { executeBoundedTransfer } from './executeBoundedTransfer.js'

const WORKFLOW_ID = 'run_demo_001'

async function main() {
  const artifact = await executeBoundedTransfer({
    workflowId: WORKFLOW_ID,
    heroUseCase,
    writeArtifacts: true,
  })

  console.log(JSON.stringify(artifact, null, 2))
}

main().catch((error) => {
  console.error('[runTestnetFlow] failed')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
