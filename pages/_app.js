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

import { createAppKit } from '@reown/appkit/react';

import { meter, meterTestnet, theta } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// Get projectId from https://cloud.reown.com
const projectId = "31995a32c9e9c2876df4f27830f9c941"

// Create a metadata object - optional
const metadata = {
  name: 'Voltswap',
  description: 'Voltswap',
  url: 'https://voltswap.finance',
  icons: ['https://raw.githubusercontent.com/meterio/token-list/refs/heads/master/data/VOLT/logo.png']
}

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
const networks = [meter, theta, meterTestnet]

const ethersAdapter = new EthersAdapter();

createAppKit({
  adapters: [ethersAdapter],
  networks,
  metadata,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
})

export default function MyApp({ Component, pageProps }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const { appTheme, setAppTheme } = useAppTheme();

  const [stalbeSwapConfigured, setStableSwapConfigured] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);

  useEffect(() => {
    setReady(true);

    return () => {}
  }, []);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    return () => {}
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

    return () => {}
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
          <Head>
            <title>Voltswap</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
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
      </React.Fragment>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
