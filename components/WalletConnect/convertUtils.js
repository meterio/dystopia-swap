import { getPublicClient } from '@wagmi/core'
import { getWalletClient } from '@wagmi/core'
import { providers } from 'ethers'
import Web3 from 'web3'

export function publicClientToProvider(publicClient) {
  const { chain, transport } = publicClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  if (transport.type === 'fallback')
    return new providers.FallbackProvider(
      transport.transports.map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network),
      ),
    )
  return new providers.JsonRpcProvider(transport.url, network)
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider({ chainId } = {}) {
  const publicClient = getPublicClient({ chainId })
  return publicClientToProvider(publicClient)
}

export function walletClientToSigner(walletClient) {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner({ chainId } = {}) {
  const walletClient = await getWalletClient({ chainId })
  if (!walletClient) return undefined
  return walletClientToSigner(walletClient)
}

export async function getWeb3Signer({ chainId } = {}) {
  const walletClient = await getWalletClient({ chainId });

  if (!walletClient) return undefined
  return new Web3(walletClientToSigner(walletClient).provider.provider)
}

