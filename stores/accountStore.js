import async from "async";
import { ACTIONS, getSupportChainList } from "./constants";
import Multicall from "@dopex-io/web3-multicall";
import detectProvider from "@metamask/detect-provider";
import { ethers, Contract, providers } from "ethers";
import stores from "../stores";
// import {
//   injected,
//   walletconnect,
//   walletlink,
//   network
// } from './connectors';

import Web3 from "web3";

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      account: null,
      chainId: '',
      chainInvalid: false,
      supportChain: null,
      web3provider: null,
      web3modal: null,
      provider: null,
      tokens: [],
      // connectorsByName: {
      //   MetaMask: injected,
      //   TrustWallet: injected,
      //   WalletLink: walletlink,
      //   WalletConnect: walletconnect,
      // },
      gasPrices: {
        standard: 90,
        fast: 100,
        instant: 130,
      },
      gasSpeed: "fast",
      currentBlock: 12906197,
      subscribed: false,
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case ACTIONS.CONFIGURE:
            this.configure(payload);
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(ACTIONS.STORE_UPDATED);
  }

  configure = async () => {
    // const supportedChainIds = [process.env.NEXT_PUBLIC_CHAINID];
    // const supportChainList = getSupportChainList()
    // const supportedChainIds = supportChainList.map(c => c.id)
    // const provider = await this.getProvider();

    // if (!provider) {
    //   return
    // }

    // // this.getGasPrices();

    // let providerChain = provider
    //   ? await provider.request({ method: "eth_chainId" })
    //   : null;

    // const parsedChainId = parseInt(providerChain + "", 16) + "";
    // const isChainSupported = supportedChainIds.includes(parsedChainId);
    // if (isChainSupported) {
    //   this.setStore({
    //     supportChain: supportChainList.find(c => c.id === parsedChainId)
    //   })
    // } else {
    //   this.setStore({
    //     supportChain: null
    //   })
    // }
    // this.setStore({ chainInvalid: !isChainSupported });
    this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);

    // this.dispatcher.dispatch({
    //   type: ACTIONS.CONFIGURE_SS,
    //   content: { connected: false },
    // });

    // const subscribed = this.getStore('subscribed')

    // if (!subscribed) {
    //   this.subscribeProvider()
    // }

    // window.removeEventListener("ethereum#initialized", this.subscribeProvider);
    // window.addEventListener("ethereum#initialized", this.subscribeProvider, {
    //   once: true,
    // });
  };

  // setProvider = async (provider) => {
  //   this.ethersProvider = new ethers.providers.Web3Provider(provider);
  //   const signer = this.ethersProvider.getSigner();
  //   this.provider = provider;

  //   try {
  //     const address = await signer.getAddress();
  //     this.setWalletAddress(address);
  //     // await this.getNetwork()
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  subscribeProvider = async () => {
    // const subscribed = this.getStore('subscribed')
    // if (subscribed) {
    //   console.log('subscribed return')
    //   return
    // }

    const provider = await this.getProvider()
    if (!provider) {
      console.log('no privider for subscribe provider')
      return
    }
    // this.setStore({
    //   subscribed: true
    // })
    this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);

    if (provider.removeListener) {
      provider.removeListener("accountsChanged", this.accountChanged.bind(this));
      provider.removeListener("chainChanged", this.chainChanged.bind(this));
    }

    provider.on("accountsChanged", this.accountChanged.bind(this));

    provider.on("chainChanged", this.chainChanged.bind(this));
  };

  chainChanged = async function (chainId) {
    console.log('chain changed', chainId)
    const supportChainList = getSupportChainList();
    const supportedChainIds = supportChainList.map(c => c.id);
    const parsedChainId = Number(chainId) + "";
    const isChainSupported = supportedChainIds.includes(parsedChainId);
    if (isChainSupported) {
      this.setStore({
        supportChain: supportChainList.find(c => c.id === parsedChainId)
      })
    } else {
      this.setStore({
        supportChain: null
      })
    }
    this.setStore({ chainInvalid: !isChainSupported });
    this.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
    this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);

    this.dispatcher.dispatch({
      type: ACTIONS.CONFIGURE_SS,
      content: { connected: false },
    });
  }

  accountChanged = async function (accounts) {
    const address = accounts[0];
    await stores.stableSwapStore.configure();
    this.setStore({
      account: { address },
    });
    this.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
    this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    this.dispatcher.dispatch({
      type: ACTIONS.CONFIGURE_SS,
      content: { connected: true },
    });
  }

  getGasPrices = async (payload) => {
    const gasPrices = await this._getGasPrices();
    let gasSpeed = localStorage.getItem("dystopia.finance-gas-speed");

    if (!gasSpeed) {
      gasSpeed = "fast";
      localStorage.getItem("dystopia.finance-gas-speed", "fast");
    }

    this.setStore({ gasPrices: gasPrices, gasSpeed: gasSpeed });
    this.emitter.emit(ACTIONS.GAS_PRICES_RETURNED);
  };

  _getGasPrices = async () => {
    try {
      const web3 = await this.getWeb3Provider();
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
      return {
        standard: gasPriceInGwei,
        fast: gasPriceInGwei,
        instant: gasPriceInGwei,
      };
    } catch (e) {
      console.log(e);
      return {};
    }
  };

  getGasPrice = async (speed) => {
    let gasSpeed = speed;
    if (!speed) {
      gasSpeed = this.getStore("gasSpeed");
    }

    try {
      const web3 = await this.getWeb3Provider();
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
      return gasPriceInGwei;
    } catch (e) {
      console.log(e);
      return {};
    }
  };

  getWeb3Provider = async () => {
    // let web3context = this.getStore('web3context');
    // let provider = null;

    // if (!web3context) {
    //   provider = network.providers['1'];
    // } else {
    //   provider = web3context.library.provider;
    // }

    // if (!provider) {
    //   return null;
    // }
    let web3provider = this.getStore("web3provider");

    // if (web3provider === null) {
    //   // return new Web3(window.ethereum || (await detectProvider()));
    //   return new Web3(await this.getProvider())
    // }

    return web3provider;
  };

  getProvider = async () => {
    return this.getStore('provider')
    // const provider = window.ethereum || (await detectProvider());
    // if (provider.providers) {
    //   if (provider.selectedProvider) {
    //     const isCoinbaseWallet = provider.selectedProvider.isCoinbaseWallet
    //     if (isCoinbaseWallet) {
    //       localStorage.setItem('isCoinbaseWallet', true)
    //     }
    //     return provider.selectedProvider
    //   }
    //   // if (provider.providerMap.has('MetaMask')) {
    //   //   return provider.providerMap.get('MetaMask')
    //   // }

    //   return provider.providers[0]
    // } else {
    //   return provider
    // }
  };

  getMulticall = async () => {
    const supportChain = this.getStore('supportChain')
    const web3 = await this.getWeb3Provider();
    const multicall = new Multicall({
      multicallAddress: supportChain.contracts.MULTICALL_ADDRESS,
      provider: web3,
    });
    return multicall;
  };
}

export default Store;
