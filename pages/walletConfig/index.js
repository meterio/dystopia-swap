import { meter, meterTestnet, theta } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// Get projectId from https://cloud.reown.com
export const projectId = "31995a32c9e9c2876df4f27830f9c941"

// Create a metadata object - optional
export const metadata = {
  name: 'Voltswap',
  description: 'Voltswap',
  url: 'https://voltswap.finance',
  icons: ['https://raw.githubusercontent.com/meterio/token-list/refs/heads/master/data/VOLT/logo.png']
}

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [meter, theta, meterTestnet]

export const ethersAdapter = new EthersAdapter();