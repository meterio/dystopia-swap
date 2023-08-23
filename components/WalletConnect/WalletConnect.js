import React, { useState, useEffect } from "react";
import { Web3Button, Web3NetworkSwitch } from "@web3modal/react";
import stores from "../../stores";
import Web3 from "web3";
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
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { getEthersSigner, getWeb3Signer } from "./convertUtils";

export const WalletConnect = (props) => {
  const [loading, setLoading] = useState(false);
  const { isOpen, open } = useWeb3Modal();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

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
    // const signer = await getWeb3Signer({chainId})
    // console.log('signer', signer)

    // let httpWeb3 = null;

    // const supportChainList = getSupportChainList();
    // const supportedChainIds = supportChainList.map((c) => c.id);
    // const isChainSupported = supportedChainIds.includes(
    //   String(chainId)
    // );
    // stores.accountStore.setStore({ chainInvalid: !isChainSupported });
    // if (isChainSupported) {
    //   const supportChain = supportChainList.find(
    //     (c) => c.id === String(chainId)
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
    // console.log({chainId, account})
    // stores.accountStore.setStore({
    //   chainId: String(chainId),
    //   account: { address: account },
    //   web3provider: signer,
    //   httpWeb3provider: httpWeb3,
    // });

    // stores.emitter.emit(CONNECTION_CONNECTED);
    // stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    // stores.dispatcher.dispatch({
    //   type: ACTIONS.CONFIGURE_SS,
    //   content: { connected: true },
    // });
  }

  // const { isConnected, account, rpcUrls } = useAccount();
  // const { isConnected } = useAccount();
  // const { disconnect } = useDisconnect();
  // const label = isConnected ? "Disconnect" : "Connect Custom";

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  const connect = async function web3Init() {

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
  };

  useEffect(() => {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      console.log("action connect");
      connect();
    }
  }, []);

  return props.children({ connect });
};
