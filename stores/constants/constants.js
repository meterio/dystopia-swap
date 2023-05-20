import BigNumber from 'bignumber.js'
import * as contractsTestnet from './contractsTestnet'
import * as contracts from './contracts'
import * as contractsTheta from './contractsTheta'
import * as actions from './actions'

export const SUPPORT_CHAIN = [
  {
    id: '82',
    mainnet: true,
    name: 'Meter Mainnet',
    nativeSymbol: 'MTR',
    nativeDecimals: 18,
    rpc: 'https://rpc.meter.io',
    privateRpc: 'https://rpc.meter.io',
    contracts: contracts,
    infoURL: 'https://charts.voltswap.finance',
    explorerURL: 'https://scan.meter.io/',
    govAddr: '0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3',
    subgraphApi: 'https://graph-meter.voltswap.finance/subgraphs/name/meterio/voltswapv2-subgraph',
    routeAssets: [
      {
        "name": "BUSD from BSC on Meter",
        "address": "0x24aA189DfAa76c671c279262F94434770F557c35",
        "symbol": "BUSD.bsc",
        "decimals": 18,
        "chainId": 82,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/BUSD/logo.png"
      },
      {
        "name": "Meter Governance",
        "address": "0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3",
        "symbol": "MTRG",
        "decimals": 18,
        "chainId": 82,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/MTRG/logo.png"
      },
      {
        "name": "Volt",
        "address": "0x8Df95e66Cb0eF38F91D2776DA3c921768982fBa0",
        "symbol": "VOLT",
        "decimals": 18,
        "chainId": 82,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/VOLT/logo.png"
      },
      {
        "name": "Theta Drop",
        "address": "0xd5e615BB3c761AB4cD9251dEEd78Dac58BE9CcBF",
        "symbol": "TDROP",
        "decimals": 18,
        "chainId": 82,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/TDROP/logo.png"
      },
    ]
  },
  {
    id: '83',
    mainnet: false,
    name: 'Meter Testnet',
    nativeSymbol: 'MTR',
    nativeDecimals: 18,
    rpc: 'https://rpctest.meter.io',
    privateRpc: 'https://rpctest.meter.io',
    contracts: contractsTestnet,
    infoURL: 'https://vs3-info.surge.sh',
    explorerURL: 'https://scan-warringstakes.meter.io/',
    govAddr: '0x8a419ef4941355476cf04933e90bf3bbf2f73814',
    subgraphApi: 'https://graphtest.meter.io/subgraphs/name/meterio/voltswapv2-subgraph',
    routeAssets: [
      {
        "name": "AmpleForth",
        "address": "0xd259ED8E7ACa1f5eA16fD58a860c09Af335b8198",
        "symbol": "AMPL",
        "decimals": 9,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/AMPL/logo.png"
      },
      {
        "name": "Meter Governance",
        "address": "0x8A419EF4941355476CF04933E90BF3BBF2F73814",
        "symbol": "MTRG",
        "decimals": 18,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/MTRG/logo.png"
      },
      {
        "name": "Sumer Bitcoin",
        "address": "0x0477763b021e0f30680b7266a264d1044fe77a4d",
        "symbol": "suBTC",
        "decimals": 18,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/suBTC/logo.png"
      },
      {
        "name": "Sumer Ethereum",
        "address": "0x4b0d849e5bf7f62bcbb0b7c364ddda552c2c3a8a",
        "symbol": "suETH",
        "decimals": 18,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/suETH/logo.png"
      },
      {
        "name": "Sumer USDC",
        "address": "0x37d982d96ac985a4fa9522383de5010109f0627c",
        "symbol": "suUSD",
        "decimals": 18,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/suUSD/logo.png"
      },
      {
        "name": "Wrapped USDT",
        "address": "0x3e5a2A4812D319Ded22479A88ed708c6B55ca0b1",
        "symbol": "USDT",
        "decimals": 6,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/USDT/logo.png"
      },
      
      {
        "name": "Volt",
        "address": "0x6af7f7cddfd0d69ba9b03863347bd762bd70f8dc",
        "symbol": "VOLT",
        "decimals": 18,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/VOLT/logo.png"
      },
      {
        "name": "BTC on Meter",
        "address": "0xcfd9102a2675e0d898982f1fd1dd0264aaa901da",
        "symbol": "WBTC",
        "decimals": 8,
        "chainId": 83,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/WBTC/logo.png"
      }
    ]
  },
  {
    id: '361',
    mainnet: true,
    name: 'Theta Mainnet',
    nativeSymbol: 'TFUEL',
    nativeDecimals: 18,
    rpc: 'https://eth-rpc-api.thetatoken.org/rpc',
    // privateRpc: 'https://api.infstones.com/theta/mainnet/cb7d0ebf10584c9a88ab8c8478958e6e/eth/rpc',
    privateRpc: 'https://eth-rpc-api.thetatoken.org/rpc',
    contracts: contractsTheta,
    infoURL: 'https://charts-theta.voltswap.finance',
    explorerURL: 'https://explorer.thetatoken.org/',
    govAddr: '0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03',
    subgraphApi: 'https://graph-theta.voltswap.finance/subgraphs/name/theta/voltswapv2-subgraph',
    routeAssets: [
      {
        name: contractsTheta.WFTM_NAME,
        address: contractsTheta.WFTM_ADDRESS,
        symbol: contractsTheta.WFTM_SYMBOL,
        decimals: contractsTheta.WFTM_DECIMALS,
        chainId: 361,
        logoURI: contractsTheta.WFTM_LOGO
      },
      {
        "name": "BUSD from BSC on Theta",
        "address": "0x7B37d0787A3424A0810E02b24743a45eBd5530B2",
        "symbol": "BUSD.bsc",
        "decimals": 18,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/BUSD/logo.png"
      },
      {
        "name": "Meter Governance mapped by Meter.io",
        "address": "0xBd2949F67DcdC549c6Ebe98696449Fa79D988A9F",
        "symbol": "MTRG",
        "decimals": 18,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/MTRG/logo.png"
      },
      {
        "name": "Theta Drop",
        "address": "0x1336739b05c7ab8a526d40dcc0d04a826b5f8b03",
        "symbol": "TDROP",
        "decimals": 18,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/TDROP/logo.png"
      },
      {
        "name": "USDC from Ethereum on Theta",
        "address": "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6",
        "symbol": "USDC",
        "decimals": 6,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/USDC/logo.png"
      },
      {
        "name": "Theta TVOLT",
        "address": "0xae6f0539e33f624ac685cce9ba57cc1d948d909d",
        "symbol": "TVOLT",
        "decimals": 18,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/VOLT/logo.png"
      },
      {
        "name": "WTheta",
        "address": "0xaf537fb7e4c77c97403de94ce141b7edb9f7fcf0",
        "symbol": "WTHETA",
        "decimals": 18,
        "chainId": 361,
        "logoURI": "https://raw.githubusercontent.com/meterio/token-list/master/data/WTHETA/logo.png"
      }
    ]
  }
]

// export const CONTRACTS = cont
export const ACTIONS = actions

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


export const BLACK_LIST_TOKENS = [
  "0x3e8fafac6a39c560b500e9176410e98d01d078ce", // "StableV1 AMM - WMTR/VOLT"
  "0x56e5140298c22c3959dcf2ddaebd89935b8aa9aa", // "VolatileV1 AMM - MTRG/TFUEL"
  "0x6cc1f67af0e7dd88e80b8d153dd1d1cad06b5f47", // "VolatileV1 AMM - FTB/VOLT"
  "0x75e4566d2a418e61ca1a2c7705aaaab2dcbf52f9", // "StableV1 AMM - MTRG/VOLT"
  "0x9599caed4188bd8858c3de2fa62c54e00fb58a67", // "VolatileV1 AMM - MTRG/TARA"
  "0xade3bf255ea49079cc0d32ced219c0708b1369ee", // "VolatileV1 AMM - WMTR/MAE"
  "0xd4ebf4b6efb7c25c3c7066653d27a59654f9bea2", // "StableV1 AMM - MTRG/FTB"
  "0xea8049fc07b079c91a974a02a0dbbe0c8a0e6205", // "VolatileV1 AMM - WMTR/TARA"
  "0xfd1ce3adf6668daacccbf30775f8791c2ab7003a", // "StableV1 AMM - TFUEL/VOLT"
]

export const BASE_ASSETS_WHITELIST = []

// const isMainnet = process.env.NEXT_PUBLIC_NETWORK !== 'testnet'
export const getSupportChainList = () => {
  return SUPPORT_CHAIN  // .filter(c => c.mainnet === isMainnet)
}
