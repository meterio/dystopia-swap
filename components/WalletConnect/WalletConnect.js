import React, { useState, useEffect } from "react";
// import Web3Modal from 'web3modal'
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";

// import { SafeAppWeb3Modal } from '@safe-global/safe-apps-web3modal/dist'
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import stores from "../../stores";
import Web3 from "web3";
import { Web3Provider } from "@ethersproject/providers";
import { ACTIONS, getSupportChainList } from "../../stores/constants";
import { ethers, providers } from "ethers";
import {
  getAccount,
  getContract,
  getNetwork,
  fetchBalance,
  getConfig,
} from "@wagmi/core";

const { ERROR, CONNECTION_DISCONNECTED, CONNECTION_CONNECTED, CONFIGURE_SS } =
  ACTIONS;

import { useWeb3Modal, useWeb3ModalEvents } from "@web3modal/react";
import { useAccount, useDisconnect } from "wagmi";
import { getEthersSigner, getWeb3Signer } from "./convertUtils";

export const WalletConnect = (props) => {
  const [loading, setLoading] = useState(false);
  const { isOpen, open } = useWeb3Modal();
  useWeb3ModalEvents((evt) => {
    console.log("web3modal event: ", evt);
    if (evt?.data?.name === "ACCOUNT_CONNECTED") {
      const network = getNetwork()
      const account = getAccount()

      console.log("network: ", network);
      console.log("account: ", account);
      // console.log("balance: ", fetchBalance());
      // console.log("config: ", getConfig());

      if (network.chain && account.address) {
        updateAccountStore({chainId: network.chain.id, account: account.address})
      }
    }
  });

  async function updateAccountStore({chainId, account}) {
    const signer = await getWeb3Signer({chainId})
    console.log('signer', signer)

    let httpWeb3 = null;

    const supportChainList = getSupportChainList();
    const supportedChainIds = supportChainList.map((c) => c.id);
    const isChainSupported = supportedChainIds.includes(
      String(chainId)
    );
    stores.accountStore.setStore({ chainInvalid: !isChainSupported });
    if (isChainSupported) {
      const supportChain = supportChainList.find(
        (c) => c.id === String(chainId)
      );

      httpWeb3 = new Web3(
        new Web3.providers.HttpProvider(supportChain.privateRpc)
      );

      stores.accountStore.setStore({
        supportChain,
      });
    } else {
      stores.accountStore.setStore({
        supportChain: null,
      });
    }
    console.log({chainId, account})
    stores.accountStore.setStore({
      chainId: String(chainId),
      account: { address: account },
      web3provider: signer,
      httpWeb3provider: httpWeb3,
    });

    stores.emitter.emit(CONNECTION_CONNECTED);
    stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    stores.dispatcher.dispatch({
      type: ACTIONS.CONFIGURE_SS,
      content: { connected: true },
    });
  }

  // const { isConnected, account, rpcUrls } = useAccount();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const label = isConnected ? "Disconnect" : "Connect Custom";

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  // useEffect(() => {
  //   const handleConnectorUpdate = ({ account, chain }) => {
  //     if (account) {
  //       console.log("new account", account);
  //     } else if (chain) {
  //       console.log("new chain", chain);
  //     }
  //   };

  //   if (connector) {
  //     connector.on("change", handleConnectorUpdate);
  //   }

  //   return () => connector?.off("change", handleConnectorUpdate);
  // }, [connector]);

  const connect = async function web3Init() {
    // const web3modal = new SafeAppWeb3Modal({
    //   cacheProvider: true,
    //   providerOptions: {
    //     walletlink: {
    //       package: CoinbaseWalletSDK,
    //       options: {
    //         appName: "Voltswap app",
    //         // infuraId: `${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    //         rpc: {
    //           82: `https://rpc.meter.io`,
    //           83: "https://rpctest.meter.io",
    //           361: "https://eth-rpc-api.thetatoken.org/rpc",
    //           8453: "https://mainnet.base.org",
    //         },
    //       },
    //     },
    //     // walletconnect: {
    //     //   package: WalletConnectProvider,
    //     //   options: {
    //     //     // infuraId: `${process.env.NEXT_PUBLIC_INFURA_KEY}`,
    //     //     rpc: {
    //     //       82: `https://rpc.meter.io`,
    //     //     },
    //     //     network: 82,
    //     //     supportedChainIds: [82],
    //     //   },
    //     // },
    //   },
    // });

    // const instance = await web3modal.requestProvider().catch((err) => {
    //   console.log("ERR:", err.message);
    //   if (err.message === "No Web3 Provider found") {
    //     stores.emitter.emit(ACTIONS.ERROR, err.message);
    //   }
    // });

    console.log("isOpen", isOpen);
    console.log("isconnected: ", isConnected);
    if (!isConnected) {
      await onOpen();
    } else {
      // disconnect();
    }

    const network = getNetwork()
    const account = getAccount()

    // console.log("network: ", network);
    // console.log("account: ", account);

    if (network.chain && account.address) {
      updateAccountStore({chainId: network.chain.id, account: account.address})
    }

    // if (instance === undefined) {
    //   return;
    // }

    // const provider = new ethers.providers.Web3Provider(instance)

    // const signer = provider.getSigner()
    // const address = await signer.getAddress()

    // if (!provider) {
    //   return
    // }
    // console.log("account", account);
    // console.log("rpcUrls: ", rpcUrls);
    // // console.log("instance", instance.chainId, instance.selectedAddress);
    // const web3 = new Web3(rpcUrls.http[0]);
    // let httpWeb3 = null;

    // const { chainId, selectedAddress } = instance;
    // // const chainId = await web3.eth.getChainId()
    // // const account = await web3.eth.getAccounts()
    // console.log({ chainId, selectedAddress });

    // const supportChainList = getSupportChainList();
    // const supportedChainIds = supportChainList.map((c) => c.id);
    // const isChainSupported = supportedChainIds.includes(
    //   String(Number(chainId))
    // );
    // stores.accountStore.setStore({ chainInvalid: !isChainSupported });
    // if (isChainSupported) {
    //   const supportChain = supportChainList.find(
    //     (c) => c.id === String(Number(chainId))
    //   );

    //   httpWeb3 = new Web3(
    //     new Web3.providers.HttpProvider(supportChain.privateRpc)
    //   );

    //   stores.accountStore.setStore({
    //     supportChain,
    //   });
    // } else {
    //   stores.accountStore.setStore({
    //     supportChain: null,
    //   });
    // }

    // stores.accountStore.setStore({
    //   chainId: String(chainId),
    //   account: { address: selectedAddress },
    //   web3provider: web3,
    //   httpWeb3provider: httpWeb3,
    //   web3modal,
    //   provider: instance,
    // });

    // stores.accountStore.subscribeProvider();

    // setTimeout(() => {
    //   stores.emitter.emit(CONNECTION_CONNECTED);
    //   stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    //   stores.dispatcher.dispatch({
    //     type: ACTIONS.CONFIGURE_SS,
    //     content: { connected: true },
    //   });
    // }, 100);

    // return { web3provider: web3, address: selectedAddress };
  };

  useEffect(() => {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      console.log("action connect");
      connect();
    }
  }, []);

  return props.children({ connect });
};
