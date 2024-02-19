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
import { WalletConnect } from "../WalletConnect/WalletConnect";
import { ethers } from "ethers";
import Web3 from "web3";
import { useEthers } from "@usedapp/core";
import { useNetwork, useSwitchNetwork, useDisconnect, useAccount } from "wagmi"
import { getEthersProvider, getWeb3Signer } from "../WalletConnect/convertUtils";

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

function WrongNetworkIcon(props) {
  const { color, className } = props;
  return (
    <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
      <g strokeWidth="2" transform="translate(0, 0)">
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M33.994,42.339 C36.327,43.161,38,45.385,38,48c0,3.314-2.686,6-6,6c-2.615,0-4.839-1.673-5.661-4.006"
          strokeLinejoin="miter"
        ></path>{" "}
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M47.556,32.444 C43.575,28.462,38.075,26,32,26c-6.075,0-11.575,2.462-15.556,6.444"
          strokeLinejoin="miter"
        ></path>{" "}
        <path
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          d="M59.224,21.276 C52.256,14.309,42.632,10,32,10c-10.631,0-20.256,4.309-27.224,11.276"
          strokeLinejoin="miter"
        ></path>{" "}
        <line
          data-color="color-2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
          strokeMiterlimit="10"
          x1="10"
          y1="54"
          x2="58"
          y2="6"
          strokeLinejoin="miter"
        ></line>
      </g>
    </SvgIcon>
  );
}

const StyledMenu = styled(Menu)(({ theme, appTheme }) => ({
  paper: {
    border: "1px solid rgba(126,153,176,0.2)",
    marginTop: "10px",
    minWidth: "230px",
    background: appTheme === "dark" ? "#4CADE6" : "#0B5E8E",
  },
}));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: "none",
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: "#FFF",
      },
    },
  },
}))(MenuItem);

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
  const { deactivate } = useEthers();
  const [isMetaMask, setIsMetaMask] = useState(true);

  const { chain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(async () => {
    console.log('network, account', chain, address)
    if (chain && address) {
      const chainId = chain.id
      let signer = null
      let provider = null
      try {
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
        signer = await getWeb3Signer({chainId})
        provider = await getEthersProvider({chainId})
      } catch(e) {
        console.log('get web3 signer error', e)
      }

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
        account: { address },
        web3provider: signer,
        provider,
        httpWeb3provider: httpWeb3,
      });

      stores.emitter.emit(CONNECTION_CONNECTED);
      stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
      stores.dispatcher.dispatch({
        type: ACTIONS.CONFIGURE_SS,
        content: { connected: true },
      });
    }
  }, [chain, address])

  const web = async (add) => {
    const web3provider = await stores.accountStore.getWeb3Provider();
    if (!web3provider || !add) {
      return;
    }

    let bal = await web3provider.eth.getBalance(add);

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
      web3provider: null,
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
          {/* <WalletConnect>
            {({ connect }) => {
              return (
                <>
                  {account && account.address ? (
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
                              {
                                !isMetaMask ? <div
                                  className={`${classes.accountIcon} ${classes.coinbase}`}
                                ></div> : <div
                                className={`${classes.accountIcon} ${classes.metamask}`}
                              ></div>
                              }
                              

                              <div
                                style={{
                                  marginLeft: 5,
                                  marginRight: 5,
                                  color:
                                    appTheme === "dark" ? "#ffffff" : "#0B5E8E",
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
                          {maticBalance ? maticBalance : 0} {supportChain ? supportChain.contracts.FTM_SYMBOL : ''}
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
                  ) : (
                    <Button
                      style={{
                        marginLeft: !account?.address ? 14 : 0,
                      }}
                      disableElevation
                      className={[
                        classes.accountButton,
                        classes[`accountButton--${appTheme}`],
                        !account?.address
                          ? classes[`accountButtonConnect--${appTheme}`]
                          : "",
                      ].join(" ")}
                      variant="contained"
                      // onClick={onAddressClicked}
                      onClick={connect}
                    >
                      {account && account.address && (
                        <div
                          className={`${classes.accountIcon} ${classes.metamask}`}
                        ></div>
                      )}

                      {!account?.address && (
                        <img
                          src="/images/ui/icon-wallet.svg"
                          className={classes.walletIcon}
                        />
                      )}

                      <div className={classes.walletPointContainer}>
                        <div
                          className={[
                            classes.walletPoint,
                            classes[`walletPoint--${appTheme}`],
                          ].join(" ")}
                        ></div>
                      </div>

                      <Typography className={classes.headBtnTxt}>
                        {account && account.address
                          ? formatAddress(account.address)
                          : "Connect Wallet"}
                      </Typography>
                    </Button>
                  )}
                </>
              );
            }}
          </WalletConnect> */}

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
