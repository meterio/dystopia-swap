import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BigNumber from "bignumber.js";

import {
  Typography,
  Switch,
  Button,
  SvgIcon,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TableCell,
  ClickAwayListener,
} from "@mui/material";
import { styled, withStyles, withTheme } from "@mui/styles";
import {
  ArrowDropDown,
  AccountBalanceWalletOutlined,
  DashboardOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";

import Navigation from "../navigation";
import Unlock from "../unlock";
import TransactionQueue from "../transactionQueue";

import { ACTIONS, getSupportChainList } from "../../stores/constants";

import stores from "../../stores";
import { formatAddress } from "../../utils";

import classes from "./header.module.css";
import TopHeader from "../../ui/TopHeader";
import Logo from "../../ui/Logo";
import ThemeSwitcher from "../../ui/ThemeSwitcher";
import { useAppThemeContext } from "../../ui/AppThemeProvider";
import SSWarning from "../ssWarning";

const {
  CONNECT_WALLET,
  CONNECTION_DISCONNECTED,
  ACCOUNT_CONFIGURED,
  ACCOUNT_CHANGED,
  FIXED_FOREX_BALANCES_RETURNED,
  FIXED_FOREX_CLAIM_VECLAIM,
  FIXED_FOREX_VECLAIM_CLAIMED,
  FIXED_FOREX_UPDATED,
  ERROR,
  CONNECTION_CONNECTED,
} = ACTIONS;

import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount, useAppKitProvider, useAppKitNetworkCore } from '@reown/appkit/react'
import { BrowserProvider, JsonRpcSigner, parseUnits, formatEther } from 'ethers'
import { MulticallWrapper } from "ethers-multicall-provider";


const StyledBadge = withStyles((theme) => ({
  badge: {
    background: "#15B525",
    color: "#ffffff",
    width: 12,
    height: 12,
    minWidth: 12,
    fontSize: 8,
  },
}))(Badge);

function Header(props) {
  const accountStore = stores.accountStore.getStore("account");
  const router = useRouter();

  const [account, setAccount] = useState(accountStore);
  const [supportChain, setSupportChain] = useState(
    stores.accountStore.getStore("supportChain")
  );
  const [maticBalance, setMaticBalance] = useState();
  const [darkMode, setDarkMode] = useState(
    props.theme.palette.mode === "dark" ? true : false
  );
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [chainInvalid, setChainInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);

  const [isMetaMask, setIsMetaMask] = useState(true);

  const { chainId } = useAppKitNetworkCore();
  const { switchNetwork } = useAppKitNetwork();
  const { isConnected, address } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { walletProvider } = useAppKitProvider('eip155')

  useEffect(() => {
    if (router.query.chain && !chainId) {

      open()
    }
    return () => {

    }
  }, [router.query, chainId])

  useEffect(() => {
    if (router.query.chain && chainId) {

      if (router.query.chain != chainId) {
        if (switchNetwork) {
          switchNetwork({ id: Number(router.query.chain) })
        }
      }
    }

    return () => {

    }
  }, [router.query, chainId, switchNetwork])

  useEffect(() => {
    console.log('network, account', chainId, address)

    const fun = async () => {
      if (walletProvider && chainId && address) {

        const supportChainList = getSupportChainList();
        const supportedChainIds = supportChainList.map((c) => c.id);
        const isChainSupported = supportedChainIds.includes(
          String(chainId)
        );
        stores.accountStore.setStore({ chainInvalid: !isChainSupported });
        console.log('isChainSupported', isChainSupported)
        if (isChainSupported) {
          const supportChain = supportChainList.find(
            (c) => c.id === String(chainId)
          );

          const web3Provider = new BrowserProvider(walletProvider)
          const signer = await web3Provider.getSigner()
          const multiProvider = MulticallWrapper.wrap(web3Provider)

          stores.accountStore.setStore({
            chainId: String(chainId),
            account: { address },
            provider: walletProvider,
            web3Provider,
            multiProvider,
            signer,

            supportChain
          });

          stores.emitter.emit(CONNECTION_CONNECTED);
          stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
          stores.dispatcher.dispatch({
            type: ACTIONS.CONFIGURE_SS,
            content: { connected: true },
          });
        } else {
          stores.accountStore.setStore({
            supportChain: null,
          });
        }
      }
    }

    fun()

    return () => {

    }
  }, [walletProvider, chainId, address])

  const web = async (add) => {
    const web3Provider = await stores.accountStore.getWeb3Provider();
    if (!web3Provider || !add) {
      return;
    }

    let bal = await web3Provider.getBalance(add);

    setMaticBalance(
      BigNumber(bal)
        .div(10 ** 18)
        .toFixed(2)
    );
  };

  useEffect(() => {
    const accountConfigure = () => {
      console.log("account configure");
      const accountStore = stores.accountStore.getStore("account");
      console.log("accountstore:", accountStore);
      const supportChain = stores.accountStore.getStore("supportChain");
      console.log("supportChain:", supportChain);
      const provider = stores.accountStore.getStore("provider");
      setIsMetaMask(provider ? provider.isMetaMask : true);
      if (accountStore) {
        web(accountStore.address);
      }
      setAccount(accountStore);
      setSupportChain(supportChain);
      closeUnlock();
      setAnchorEl(false);
      setShowSwitchNetworkModal(false);
    };

    const connectWallet = () => {
      onAddressClicked();
    };

    const accountChanged = () => {
      const invalid = stores.accountStore.getStore("chainInvalid");
      setChainInvalid(invalid);
      setWarningOpen(invalid);
    };

    const connected = () => {
      const invalid = stores.accountStore.getStore("chainInvalid");
      setChainInvalid(invalid);
      setWarningOpen(invalid);
    };

    const invalid = stores.accountStore.getStore("chainInvalid");
    setChainInvalid(invalid);
    setWarningOpen(invalid);

    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    stores.emitter.on(CONNECTION_CONNECTED, connected);

    // accountConfigure();
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
      stores.emitter.removeListener(CONNECTION_CONNECTED, connected);
    };
  }, [maticBalance]);

  const openWarning = () => {
    setWarningOpen(true);
  };

  const closeWarning = () => {
    setWarningOpen(false);
  };

  const onAddressClicked = async () => {
    // await stores.accountStore.getStore("web3modal").clearCachedProvider();

    // deactivate();

    if (isConnected) {
      disconnect();
    }

    setAccount(null);

    stores.accountStore.setStore({
      account: { address: null },
      web3Provider: null,
      provider: null,
    });

    stores.dispatcher.dispatch({
      type: ACTIONS.CONFIGURE_SS,
      content: { connected: false },
    });

    window.localStorage.removeItem("walletconnect");
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");

    stores.accountStore.emitter.emit(ACTIONS.DISCONNECT_WALLET);
    stores.accountStore.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    setWarningOpen(false);
  };

  const handleClickAway = () => {
    setAnchorEl(false);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);

    if (chainInvalid) {
      setWarningOpen(true);
    }
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem(
      "dystopia.finance-dark-mode"
    );
    setDarkMode(localStorageDarkMode ? localStorageDarkMode === "dark" : true);

    return () => {

    }
  }, []);

  const navigate = (url) => {
    router.push(url);
  };

  const callClaim = () => {
    setLoading(true);
    stores.dispatcher.dispatch({
      type: FIXED_FOREX_CLAIM_VECLAIM,
      content: {},
    });
  };

  const switchChain = async (network) => {
    console.log("network", network);
    switchNetwork(Number(network.chainId))
  };

  const cancleSwitch = () => {
    setShowSwitchNetworkModal(false);
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const [anchorEl, setAnchorEl] = React.useState(false);
  const [showSwitchNetworkModal, setShowSwitchNetworkModal] = useState(false);

  const handleClick = () => {
    setAnchorEl(!anchorEl);
  };

  const supportChainClick = () => {
    setShowSwitchNetworkModal(true);
  };

  const { appTheme } = useAppThemeContext();

  return (
    <TopHeader>
      <div
        className={[
          classes.headerContainer,
          classes[`headerContainer--${appTheme}`],
        ].join(" ")}
      >
        <div className={classes.logoContainer}>
          <a className={classes.logoLink} onClick={() => router.push("/home")}>
            <Logo />
          </a>
          {/*<Typography className={ classes.version}>version 0.0.30</Typography>*/}
        </div>

        <Navigation />

        <div className={classes.userBlock}>
          {supportChain && (
            <div className={classes.testnetDisclaimer}>
              <Button
                disableElevation
                className={[
                  classes.supportChainButton,
                  classes[`supportChainButton--${appTheme}`],
                ].join(" ")}
                variant="contained"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={supportChainClick}
              >
                <div
                  style={{
                    color: appTheme === "dark" ? "#ffffff" : "#0B5E8E",
                  }}
                >
                  {supportChain.name}
                </div>
              </Button>
            </div>
            // <div className={classes.testnetDisclaimer}>
            //   <Typography
            //     className={[
            //       classes.testnetDisclaimerText,
            //       classes[`testnetDisclaimerText--${appTheme}`],
            //     ].join(" ")}
            //   >
            //     { supportChain.name }
            //   </Typography>
            // </div>
          )}
          <div>
            {account && account.address && (
              <div className={classes.accountButtonContainer}>
                <Button
                  disableElevation
                  className={[
                    classes.accountButton,
                    classes[`accountButton--${appTheme}`],
                  ].join(" ")}
                  variant="contained"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <div
                    className={[
                      classes.accountButtonAddress,
                      classes[`accountButtonAddress--${appTheme}`],
                      "g-flex",
                      "g-flex--align-center",
                    ].join(" ")}
                  >
                    {account && account.address && (
                      <>
                        {!isMetaMask ? (
                          <div
                            className={`${classes.accountIcon} ${classes.coinbase}`}
                          ></div>
                        ) : (
                          <div
                            className={`${classes.accountIcon} ${classes.metamask}`}
                          ></div>
                        )}

                        <div
                          style={{
                            marginLeft: 5,
                            marginRight: 5,
                            color: appTheme === "dark" ? "#ffffff" : "#0B5E8E",
                          }}
                        >
                          •
                        </div>
                      </>
                    )}
                    <Typography className={classes.headBtnTxt}>
                      {account && account.address
                        ? formatAddress(account.address)
                        : "Connect Wallet 1"}
                    </Typography>
                  </div>

                  <Typography
                    className={[
                      classes.headBalanceTxt,
                      classes[`headBalanceTxt--${appTheme}`],
                      "g-flex",
                      "g-flex--align-center",
                    ].join(" ")}
                  >
                    {maticBalance ? maticBalance : 0}{" "}
                    {supportChain ? supportChain.contracts.FTM_SYMBOL : ""}
                  </Typography>
                </Button>

                {anchorEl && (
                  <div
                    className={[
                      classes.headSwitchBtn,
                      classes[`headSwitchBtn--${appTheme}`],
                      "g-flex",
                      "g-flex--align-center",
                    ].join(" ")}
                    onClick={onAddressClicked}
                  >
                    <img
                      src="/images/ui/icon-wallet.svg"
                      className={classes.walletIcon}
                    />

                    <div
                      style={{
                        marginLeft: 5,
                        marginRight: 5,
                        color: "#ffffff",
                      }}
                    >
                      •
                    </div>

                    <div className={classes.headSwitchBtnText}>
                      Disconnect Wallet
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={[
              classes.statButton,
              classes[`statButton--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
            ].join(" ")}
            onClick={() => {
              const supportChain = stores.accountStore.getStore("supportChain");
              if (supportChain) {
                window.open(supportChain.infoURL, "_blank");
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                style={{ marginRight: 5 }}
                d="M1.3335 8.66667H5.3335V14H1.3335V8.66667ZM6.00016 2H10.0002V14H6.00016V2ZM10.6668 5.33333H14.6668V14H10.6668V5.33333Z"
                fill={appTheme === "dark" ? "#4CADE6" : "#0B5E8E"}
              />
            </svg>

            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                fill={appTheme === "dark" ? "#5688A5" : "#5688A5"}
              />
            </svg>
          </div>

          <ThemeSwitcher />

          {transactionQueueLength > 0 && (
            <IconButton
              className={[
                classes.notificationsButton,
                classes[`notificationsButton--${appTheme}`],
              ].join(" ")}
              variant="contained"
              color="primary"
              onClick={() => {
                stores.emitter.emit(ACTIONS.TX_OPEN);
              }}
            >
              <StyledBadge
                badgeContent={transactionQueueLength}
                overlap="circular"
              >
                <NotificationsNoneOutlined
                  style={{
                    width: 20,
                    height: 20,
                    color: appTheme === "dark" ? "#4CADE6" : "#0B5E8E",
                  }}
                />
              </StyledBadge>
            </IconButton>
          )}
        </div>
        {unlockOpen && (
          <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
        )}
        <TransactionQueue setQueueLength={setQueueLength} />
      </div>

      {warningOpen && (
        <SSWarning
          close={switchChain}
          title={"Wrong Network:"}
          subTitle={"The chain you are connected is not supported!"}
          icon={"icon-network"}
          description={
            "Please check that your wallet is connected to right network, only after you can proceed."
          }
          btnLabelList={getSupportChainList().map((c) => {
            return {
              ...c,
              label: `Switch to ${c.name}`,
              chainId: c.id,
            };
          })}
          btnLabel2={"Switch Wallet Provider"}
          action2={onAddressClicked}
          links={[
            {
              name: "The original Voltswap",
              url: "https://v1.voltswap.finance/",
            },
            {
              name: "Bridge Assets to Meter Mainnet",
              url: "https://passport.meter.io/",
            },
          ]}
        />
      )}
      {showSwitchNetworkModal && (
        <SSWarning
          close={switchChain}
          title={"Switch Network:"}
          subTitle={"You can switch between these networks below!"}
          description={
            "Click the button below and the network is about to change."
          }
          btnLabelList={getSupportChainList()
            .filter((c) => {
              return supportChain ? c.id !== supportChain.id : true;
            })
            .map((c) => {
              return {
                ...c,
                label: `Switch to ${c.name}`,
                chainId: c.id,
              };
            })}
          btnLabel2={"Cancel"}
          action2={cancleSwitch}
        />
      )}
    </TopHeader>
  );
}

export default withTheme(Header);
