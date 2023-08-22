import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Layout from "../components/layout/layout.js";
import CssBaseline from "@mui/material/CssBaseline";
import { useRouter } from "next/router";

import { AppThemeProvider, useAppTheme } from "../ui/AppThemeProvider";

import Configure from "./configure";

import stores from "../stores/index.js";

import { ACTIONS } from "../stores/constants";
import "../styles/global.css";
import "../styles/variables.css";
import "../styles/grid.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import classes from "./home/home.module.css";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, optimism, polygon, base } from "wagmi/chains";

// 1. Get projectID at https://cloud.walletconnect.com
// if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
// throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
// }
const projectId = "4a9daa7479cd37c1545d5dbb98040c30"; // process.env.NEXT_PUBLIC_PROJECT_ID;

// 2. Configure wagmi client
import { Chain } from "@wagmi/core";

const meter = {
  id: 82,
  name: "Meter",
  network: "meter",
  nativeCurrency: {
    decimals: 18,
    name: "Meter Stable",
    symbol: "MTR",
  },
  rpcUrls: {
    default: { http: ["https://rpc.meter.io"] },
    public: { http: ["https://rpc.meter.io"] },
  },
  blockExplorers: {
    etherscan: { name: "MeterScan", url: "https://scan.meter.io" },
    default: { name: "MeterScan", url: "https://scan.meter.io" },
  },
  contracts: {},
};

const meterTestnet = {
  id: 83,
  name: "Meter Testnet",
  network: "meterTestnet",
  nativeCurrency: {
    decimals: 18,
    name: "Meter Stable",
    symbol: "MTR",
  },
  rpcUrls: {
    default: { http: ["https://rpctest.meter.io"] },
    public: { http: ["https://rpctest.meter.io"] },
  },
  blockExplorers: {
    etherscan: {
      name: "MeterScan",
      url: "https://scan-warringstakes.meter.io",
    },
    default: { name: "MeterScan", url: "https://scan-warringstakes.meter.io" },
  },
  contracts: {},
  testnet: true,
};

const theta = {
  id: 361,
  name: "Theta",
  network: "theta",
  nativeCurrency: {
    decimals: 18,
    name: "TFUEL",
    symbol: "TFUEL",
  },
  rpcUrls: {
    default: { http: ["https://eth-rpc-api.thetatoken.org/rpc	"] },
    public: { http: ["https://eth-rpc-api.thetatoken.org/rpc	"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Theta Explorer",
      url: "https://explorer.thetatoken.org/",
    },
    default: {
      name: "Theta Explorer",
      url: "https://explorer.thetatoken.org/",
    },
  },
  contracts: {},
};

const chains = [meter, meterTestnet, theta, base];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ chains, projectId }),
  publicClient,
});

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function MyApp({ Component, pageProps }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { appTheme, setAppTheme } = useAppTheme();

  const [stalbeSwapConfigured, setStableSwapConfigured] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const changeTheme = (dark) => {
    setAppTheme(dark ? "dark" : "light");

    localStorage.setItem("dystopia.finance-dark-mode", dark ? "dark" : "light");
  };

  const accountConfigureReturned = () => {
    setAccountConfigured(true);
  };

  const stalbeSwapConfigureReturned = () => {
    setStableSwapConfigured(true);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem(
      "dystopia.finance-dark-mode"
    );
    changeTheme(localStorageDarkMode ? localStorageDarkMode === "dark" : true);
  }, []);

  useEffect(function () {
    stores.emitter.on(ACTIONS.CONFIGURED_SS, stalbeSwapConfigureReturned);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigureReturned);

    stores.dispatcher.dispatch({ type: ACTIONS.CONFIGURE });

    return () => {
      stores.emitter.removeListener(
        ACTIONS.CONFIGURED_SS,
        stalbeSwapConfigureReturned
      );
      stores.emitter.removeListener(
        ACTIONS.ACCOUNT_CONFIGURED,
        accountConfigureReturned
      );
    };
  }, []);

  const validateConfigured = () => {
    switch (router.pathname) {
      case "/":
        return accountConfigured;
      default:
        return accountConfigured;
    }
  };

  const theme = createTheme({
    typography: {
      allVariants: {
        fontFamily: '"Roboto Mono", serif',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <WagmiConfig config={wagmiConfig}>
          <Head>
            <title>Voltswap</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <AppThemeProvider value={{ appTheme, setAppTheme }}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {validateConfigured() && (
              <Layout>
                {ready ? (
                  
                    <Component {...pageProps} changeTheme={changeTheme} />
                  
                ) : null}
                {/* <Component {...pageProps} changeTheme={changeTheme} /> */}
                <Web3Modal
                  projectId={projectId}
                  ethereumClient={ethereumClient}
                />
              </Layout>
            )}

            {!validateConfigured() && (
              <div>
                <img
                  src={appTheme === "dark" ? "/favicon.png" : "/favicon.png"}
                  style={{
                    position: "absolute",
                    width: "30px",
                    height: "30px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
            )}
          </AppThemeProvider>
        </WagmiConfig>
      </React.Fragment>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
