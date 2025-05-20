import async from "async";
import { ACTIONS, getSupportChainList } from "./constants";
import stores from "../stores";

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      account: null,
      chainId: '',
      chainInvalid: false,
      supportChain: null,
      provider: null,
      web3Provider: null,
      multiProvider: null,
      signer: null
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
    this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
  };

  chainChanged = async function (chainId) {
    console.log('chain changed', chainId)
    const supportChainList = getSupportChainList();
    const supportedChainIds = supportChainList.map(c => c.id);
    const parsedChainId = Number(chainId) + "";
    const isChainSupported = supportedChainIds.includes(parsedChainId);
    if (isChainSupported) {
      const supportChain = supportChainList.find(c => c.id === parsedChainId)
      const web3 = new Web3(new Web3.providers.HttpProvider(supportChain.privateRpc));
      this.setStore({ supportChain })
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

  getWeb3Provider = async () => {

    let web3Provider = this.getStore("web3Provider");

    return web3Provider;
  };

  getMultiProvider = async () => {
    const multiProvider = this.getStore("multiProvider")
    return multiProvider;
  };

  getSigner = async () => {
    const signer = this.getStore("signer")
    return signer
  }

  getGasPrice = async () => {
    
    return null
  }
}

export default Store;
