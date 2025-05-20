import React, { useState, useEffect } from "react";
import stores from "../../stores";
import { ACTIONS, getSupportChainList } from "../../stores/constants";

import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount, useAppKitProvider, useAppKitNetworkCore  } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner,parseUnits, formatEther } from 'ethers'

const { ERROR, CONNECTION_DISCONNECTED, CONNECTION_CONNECTED, CONFIGURE_SS } =
  ACTIONS;

export const WalletConnect = (props) => {
  const [loading, setLoading] = useState(false);

  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  const connect = async function web3Init() {
    if (loading) {
      console.log('waiting web3modal was opened')
      return
    }

    
    console.log("isconnected: ", isConnected);
    if (!isConnected) {
      await onOpen();
    } else {
      // disconnect();
    }
  };

  useEffect(() => {
    if (window.localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) {
      console.log("action connect");
      connect();
    }

    return () => {}
  }, []);

  return props.children({ connect, loading });
};
