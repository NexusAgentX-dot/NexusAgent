import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with:', deployer.address)
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'OKB')

  // Deploy AgentRegistry (ERC-8004)
  console.log('\n--- Deploying AgentRegistry (ERC-8004) ---')
  const AgentRegistry = await ethers.getContractFactory('AgentRegistry')
  const registry = await AgentRegistry.deploy()
  await registry.waitForDeployment()
  const registryAddr = await registry.getAddress()
  console.log('AgentRegistry deployed to:', registryAddr)

  // Deploy AgentEscrow (ERC-8183)
  console.log('\n--- Deploying AgentEscrow (ERC-8183) ---')
  const AgentEscrow = await ethers.getContractFactory('AgentEscrow')
  const escrow = await AgentEscrow.deploy()
  await escrow.waitForDeployment()
  const escrowAddr = await escrow.getAddress()
  console.log('AgentEscrow deployed to:', escrowAddr)

  // Register canonical agents (best-effort, may fail if gas is low)
  console.log('\n--- Registering Canonical Agents ---')
  const agents = [
    { id: 'agent_sentinel', role: 'signal_fetcher', name: 'Sentinel' },
    { id: 'agent_arbiter', role: 'decision_engine', name: 'Arbiter' },
    { id: 'agent_executor', role: 'execution_engine', name: 'Executor' },
    { id: 'agent_evaluator', role: 'verification_engine', name: 'Evaluator' },
  ]

  let registered = 0
  for (const agent of agents) {
    try {
      const agentId = ethers.id(agent.id)
      const metadata = {
        name: agent.name,
        role: agent.role,
        framework: 'NexusAgent',
        version: '0.1.0',
        capabilities: [agent.role],
      }
      const uri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString('base64')}`

      const tx = await registry.registerAgent(agentId, deployer.address, agent.role, uri)
      await tx.wait()
      registered++
      console.log(`  Registered ${agent.name} (${agent.role}): ${agentId.slice(0, 18)}...`)
    } catch (err: any) {
      console.log(`  Skipped ${agent.name}: ${err.shortMessage || err.message}`)
    }
  }

  console.log('\n--- Deployment Summary ---')
  console.log(`AgentRegistry (ERC-8004): ${registryAddr}`)
  console.log(`AgentEscrow   (ERC-8183): ${escrowAddr}`)
  console.log(`Network: X Layer Testnet (chain 1952)`)
  console.log(`Deployer: ${deployer.address}`)
  console.log(`Total Agents Registered: ${registered}`)

  // Output as JSON for integration
  const summary = {
    network: 'xlayer_testnet',
    chainId: 1952,
    deployer: deployer.address,
    contracts: {
      agentRegistry: registryAddr,
      agentEscrow: escrowAddr,
    },
    agents: agents.map((a) => ({
      ...a,
      agentIdHash: ethers.id(a.id),
    })),
    deployedAt: new Date().toISOString(),
  }
  console.log('\n' + JSON.stringify(summary, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
