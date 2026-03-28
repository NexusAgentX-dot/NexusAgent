import type { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const DUMMY_KEY = '0x' + '0'.repeat(64)
const TEST_KEY = process.env.NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY || DUMMY_KEY
const MAINNET_KEY = process.env.NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY || DUMMY_KEY

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    xlayerTestnet: {
      url: 'https://testrpc.xlayer.tech',
      chainId: 1952,
      accounts: [TEST_KEY],
    },
    xlayerMainnet: {
      url: 'https://rpc.xlayer.tech',
      chainId: 196,
      accounts: [MAINNET_KEY],
    },
  },
}

export default config
