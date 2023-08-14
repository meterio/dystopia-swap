import React, { useState, useEffect } from 'react'
import Web3Modal from 'web3modal'
import { SafeAppWeb3Modal } from '@safe-global/safe-apps-web3modal/dist'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import WalletConnectProvider from '@walletconnect/web3-provider'
import stores from '../../stores'
import Web3 from 'web3'
import { Web3Provider } from "@ethersproject/providers"
import { ACTIONS, getSupportChainList } from '../../stores/constants'
import { ethers } from 'ethers'

const {
  ERROR,
  CONNECTION_DISCONNECTED,
  CONNECTION_CONNECTED,
  CONFIGURE_SS,
} = ACTIONS;

export const WalletConnect = (props) => {
  const connect = async function web3Init() {
    const web3modal = new SafeAppWeb3Modal({
      cacheProvider: true,
      providerOptions: {
        walletlink: {
          package: CoinbaseWalletSDK,
          options: {
            appName: 'Voltswap app',
            // infuraId: `${process.env.NEXT_PUBLIC_INFURA_KEY}`,
            rpc: {
              82: `https://rpc.meter.io`,
              83: 'https://rpctest.meter.io',
              361: 'https://eth-rpc-api.thetatoken.org/rpc',
              8453: 'https://mainnet.base.org'
            },
          },
        },
        // walletconnect: {
        //   package: WalletConnectProvider,
        //   options: {
        //     // infuraId: `${process.env.NEXT_PUBLIC_INFURA_KEY}`,
        //     rpc: {
        //       82: `https://rpc.meter.io`,
        //     },
        //     network: 82,
        //     supportedChainIds: [82],
        //   },
        // },
      },
    })


    const instance = await web3modal.requestProvider()
      .catch((err) => {
        console.log('ERR:', err.message)
        if (err.message === 'No Web3 Provider found') {
          stores.emitter.emit(ACTIONS.ERROR, err.message)
        }
      })

    if (instance === undefined) {
      return
    }

    // const provider = new ethers.providers.Web3Provider(instance)

    // const signer = provider.getSigner()
    // const address = await signer.getAddress()

    // if (!provider) {
    //   return
    // }
    console.log('instance', instance.chainId, instance.selectedAddress)
    const web3 = new Web3(instance);
    let httpWeb3 = null;
    
    const { chainId, selectedAddress } = instance
    // const chainId = await web3.eth.getChainId()
    // const account = await web3.eth.getAccounts()
    console.log({chainId, selectedAddress})
    
    const supportChainList = getSupportChainList()
    const supportedChainIds = supportChainList.map(c => c.id)
    const isChainSupported = supportedChainIds.includes(String(Number(chainId)));
    stores.accountStore.setStore({ chainInvalid: !isChainSupported });
    if (isChainSupported) {
      const supportChain = supportChainList.find(c => c.id === String(Number(chainId)))

      httpWeb3 = new Web3(new Web3.providers.HttpProvider(supportChain.privateRpc));

      stores.accountStore.setStore({
        supportChain
      })
    } else {
      stores.accountStore.setStore({
        supportChain: null
      })
    }
    
    stores.accountStore.setStore({
      chainId: String(chainId),
      account: { address: selectedAddress },
      web3provider: web3,
      httpWeb3provider: httpWeb3,
      web3modal,
      provider: instance,
    });
    
    stores.accountStore.subscribeProvider();

    setTimeout(() => {
      stores.emitter.emit(CONNECTION_CONNECTED);
      stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
      stores.dispatcher.dispatch({
        type: ACTIONS.CONFIGURE_SS,
        content: { connected: true },
      });
    }, 100)

    return { web3provider: web3, address: selectedAddress }
  }

  useEffect(() => {
    if (window.localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
      console.log('action connect')
      connect()
    }
  }, [])

  return props.children({ connect })
}
