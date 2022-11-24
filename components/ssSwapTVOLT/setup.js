import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  CircularProgress,
  InputBase,
} from "@mui/material";
import { withTheme } from "@mui/styles";
import {
  formatCurrency,
  formatInputAmount,
} from "../../utils";
import classes from "./ssSwapTVOLT.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants";
import BigNumber from "bignumber.js";
import { useAppThemeContext } from "../../ui/AppThemeProvider";
import BtnSwap from "../../ui/BtnSwap";
import Hint from "../hint/hint";
import Loader from "../../ui/Loader";
import AssetSelect from "../../ui/AssetSelect";
import { WalletConnect } from '../../components/WalletConnect'
import { useRouter } from "next/router";

function Setup() {
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [loading, setLoading] = useState(false);

  const [fromAmountValue, setFromAmountValue] = useState("");
  const [fromAmountError, setFromAmountError] = useState(false);
  const [fromAssetValue, setFromAssetValue] = useState(null);
  const [fromAssetError, setFromAssetError] = useState(false);
  const [fromAssetOptions, setFromAssetOptions] = useState([]);

  const [toAmountValue, setToAmountValue] = useState("");
  const [toAmountError, setToAmountError] = useState(false);
  const [toAssetValue, setToAssetValue] = useState(null);
  const [toAssetError, setToAssetError] = useState(false);
  const [toAssetOptions, setToAssetOptions] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { appTheme } = useAppThemeContext();

  const [account, setAccount] = useState(stores.accountStore.getStore('account'));
  const [supportChain, setSupportChain] = useState(stores.accountStore.getStore('supportChain'));
  const [nativeToken, setNativeToken] = useState(supportChain ? supportChain.contracts.FTM_ADDRESS : '');
  const [wNativeToken, setWNativeToken] = useState(supportChain ? supportChain.contracts.WFTM_SYMBOL : '');

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  useEffect(() => {
    const accountConfigure = () => {
      setAccount(stores.accountStore.getStore('account'));
      const sc = stores.accountStore.getStore('supportChain');
      setSupportChain(sc)
      const nativeToken = sc ? sc.contracts.FTM_ADDRESS : ''
      const wNativeToken = sc ? sc.contracts.WFTM_SYMBOL : ''
      setNativeToken(nativeToken);
      setWNativeToken(wNativeToken);
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    };
  }, []);

  useEffect(
      function () {
        const errorReturned = (msg) => {
          setLoading(false);
        };

        const ssUpdated = () => {
          setLoading(false);
          const swapTvoltAssets = stores.stableSwapStore.getStore("swapTvoltAssets");
          if (swapTvoltAssets) {
            setFromAssetValue(swapTvoltAssets[0])

            setToAssetValue(swapTvoltAssets[1])
          }
        };

        stores.emitter.on(ACTIONS.ERROR, errorReturned);
        stores.emitter.on(ACTIONS.UPDATED, ssUpdated);

        ssUpdated();

        return () => {
          stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
          stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
        };
      },
      [fromAmountValue, fromAssetValue, toAssetValue]
  );

  const onAssetSelect = (type, value) => {};

  const fromAmountChanged = (event) => {
    const value = formatInputAmount(event.target.value.replace(",", "."));

    setFromAmountError(false);
    setFromAmountValue(value);
    if (value) {
      setToAmountValue(new BigNumber(value).times(13).div(10).toFixed());
    } else {
      setToAmountValue(value)
    }
  };

  const toAmountChanged = (event) => { };

  const onSwap = () => {
    if (
        !fromAmountValue ||
        fromAmountValue > Number(fromAssetValue.balance) ||
        Number(fromAmountValue) <= 0
    ) {
      return;
    }

    setFromAmountError(false);
    setFromAssetError(false);
    setToAssetError(false);

    let error = false;

    if (!fromAmountValue || fromAmountValue === "" || isNaN(fromAmountValue)) {
      setFromAmountError("From amount is required");
      error = true;
    } else {
      if (
          !fromAssetValue.balance ||
          isNaN(fromAssetValue.balance) ||
          BigNumber(fromAssetValue.balance).lte(0)
      ) {
        setFromAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(fromAmountValue).lt(0)) {
        setFromAmountError("Invalid amount");
        error = true;
      } else if (
          fromAssetValue &&
          BigNumber(fromAmountValue).gt(fromAssetValue.balance)
      ) {
        setFromAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!fromAssetValue || fromAssetValue === null) {
      setFromAssetError("From asset is required");
      error = true;
    }

    if (!toAssetValue || toAssetValue === null) {
      setFromAssetError("To asset is required");
      error = true;
    }

    if (!error) {
      setLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.SWAPVOLT,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
        },
      });
    }
  };

  const setBalance100 = () => {
    setFromAmountValue(fromAssetValue.balance);
    const value = fromAssetValue.balance;
    if (value) {
      setToAmountValue(new BigNumber(value).times(13).div(10).toFixed());
    } else {
      setToAmountValue(value)
    }
  };

  const swapAssets = () => {};

  const renderMassiveInput = (
      type,
      amountValue,
      amountError,
      amountChanged,
      assetValue,
      assetError,
      assetOptions,
      onAssetSelect,
      disabledSelect
  ) => {
    return (
        <div
            className={[
              classes.textField,
              classes[`textField--${type}-${appTheme}`],
            ].join(" ")}
        >
          <Typography className={classes.inputTitleText} noWrap>
            {type === "From" ? "From" : "To"}
          </Typography>

          <div
              className={[
                classes.inputBalanceTextContainer,
                "g-flex",
                "g-flex--align-center",
              ].join(" ")}
          >
            <img
                src="/images/ui/icon-wallet.svg"
                className={classes.walletIcon}
            />

            <Typography
                className={[classes.inputBalanceText, "g-flex__item"].join(" ")}
                noWrap
                onClick={() => setBalance100()}
            >
            <span>
              {assetValue && assetValue.balance
                  ? " " + formatCurrency(assetValue.balance)
                  : ""}
            </span>
            </Typography>

            {assetValue?.balance &&
            Number(assetValue?.balance) > 0 &&
            type === "From" && (
                <div
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "120%",
                      color: appTheme === "dark" ? "#4CADE6" : "#0B5E8E",
                    }}
                    onClick={() => setBalance100()}
                >
                  MAX
                </div>
            )}
          </div>

          <div
              className={`${classes.massiveInputContainer} ${(amountError || assetError) && classes.error
              }`}
          >
            <div className={classes.massiveInputAssetSelect}>
              <AssetSelect
                  type={type}
                  value={assetValue}
                  assetOptions={assetOptions}
                  onSelect={onAssetSelect}
                  disabledSelect={disabledSelect}
              />
            </div>

            <InputBase
                className={classes.massiveInputAmount}
                placeholder="0.00"
                error={amountError}
                value={amountValue}
                onChange={amountChanged}
                disabled={loading || type === "To"}
                inputMode={"decimal"}
                inputProps={{
                  className: [
                    classes.largeInput,
                    classes[`largeInput--${appTheme}`],
                  ].join(" "),
                }}
            />

            <Typography
                className={[
                  classes.smallerText,
                  classes[`smallerText--${appTheme}`],
                ].join(" ")}
            >
              {assetValue?.symbol}
            </Typography>
          </div>
        </div>
    );
  };

  const [swapIconBgColor, setSwapIconBgColor] = useState(null);
  const [swapIconBorderColor, setSwapIconBorderColor] = useState(null);
  const [swapIconArrowColor, setSwapIconArrowColor] = useState(null);

  const swapIconHover = () => {
    setSwapIconBgColor(appTheme === "dark" ? "#2D3741" : "#9BC9E4");
    setSwapIconBorderColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
    setSwapIconArrowColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
  };

  const swapIconClick = () => {
    setSwapIconBgColor(appTheme === "dark" ? "#5F7285" : "#86B9D6");
    setSwapIconBorderColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
    setSwapIconArrowColor(appTheme === "dark" ? "#4CADE6" : "#0B5E8E");
  };

  const swapIconDefault = () => {
    setSwapIconBgColor(null);
    setSwapIconBorderColor(null);
    setSwapIconArrowColor(null);
  };

  return (
      <div className={classes.swapInputs}>
        {renderMassiveInput(
            "From",
            fromAmountValue,
            fromAmountError,
            fromAmountChanged,
            fromAssetValue,
            fromAssetError,
            fromAssetOptions,
            onAssetSelect,
            true
        )}

        {fromAssetError && (
            <div
                style={{ marginTop: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError,
                ].join(" ")}
            >
              <div
                  className={[
                    classes.warningDivider,
                    classes.warningDividerError,
                  ].join(" ")}
              ></div>
              <Typography
                  className={[
                    classes.warningError,
                    classes[`warningText--${appTheme}`],
                  ].join(" ")}
                  align="center"
              >
                {fromAssetError}
              </Typography>
            </div>
        )}

        <div
            className={[
              classes.swapIconContainer,
              classes[`swapIconContainer--${appTheme}`],
            ].join(" ")}
            onMouseOver={swapIconHover}
            onMouseOut={swapIconDefault}
            onMouseDown={swapIconClick}
            onMouseUp={swapIconDefault}
            onTouchStart={swapIconClick}
            onTouchEnd={swapIconDefault}
            onClick={swapAssets}
        >
          {windowWidth > 470 && (
              <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                    cx="40"
                    cy="40"
                    r="39.5"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                    stroke={appTheme === "dark" ? "#5F7285" : "#86B9D6"}
                />

                <rect
                    y="30"
                    width="4"
                    height="20"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                />

                <rect
                    x="76"
                    y="30"
                    width="4"
                    height="20"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                />

                <circle
                    cx="40"
                    cy="40"
                    r="29.5"
                    fill={
                      swapIconBgColor || (appTheme === "dark" ? "#24292D" : "#B9DFF5")
                    }
                    stroke={
                      swapIconBorderColor ||
                      (appTheme === "dark" ? "#5F7285" : "#86B9D6")
                    }
                />

                <path
                    d="M41.0002 44.172L46.3642 38.808L47.7782 40.222L40.0002 48L32.2222 40.222L33.6362 38.808L39.0002 44.172V32H41.0002V44.172Z"
                    fill={
                      swapIconArrowColor ||
                      (appTheme === "dark" ? "#4CADE6" : "#0B5E8E")
                    }
                />
              </svg>
          )}

          {windowWidth <= 470 && (
              <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                    cx="25"
                    cy="25"
                    r="24.5"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                    stroke={appTheme === "dark" ? "#5F7285" : "#86B9D6"}
                />

                <rect
                    y="20"
                    width="3"
                    height="10"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                />

                <rect
                    x="48"
                    y="20"
                    width="2"
                    height="10"
                    fill={appTheme === "dark" ? "#151718" : "#DBE6EC"}
                />

                <circle
                    cx="25"
                    cy="25"
                    r="18.5"
                    fill={
                      swapIconBgColor || (appTheme === "dark" ? "#24292D" : "#B9DFF5")
                    }
                    stroke={
                      swapIconBorderColor ||
                      (appTheme === "dark" ? "#5F7285" : "#86B9D6")
                    }
                />

                <path
                    d="M25.8336 28.4773L30.3036 24.0073L31.4819 25.1857L25.0002 31.6673L18.5186 25.1857L19.6969 24.0073L24.1669 28.4773V18.334H25.8336V28.4773Z"
                    fill={
                      swapIconArrowColor ||
                      (appTheme === "dark" ? "#ffffff" : "#ffffff")
                    }
                />
              </svg>
          )}
        </div>

        {renderMassiveInput(
            "To",
            toAmountValue,
            toAmountError,
            toAmountChanged,
            toAssetValue,
            toAssetError,
            toAssetOptions,
            onAssetSelect,
            true
        )}

        {toAssetError && (
            <div
                style={{ marginTop: 20 }}
                className={[
                  classes.warningContainer,
                  classes[`warningContainer--${appTheme}`],
                  classes.warningContainerError,
                ].join(" ")}
            >
              <div
                  className={[
                    classes.warningDivider,
                    classes.warningDividerError,
                  ].join(" ")}
              ></div>
              <Typography
                  className={[
                    classes.warningError,
                    classes[`warningText--${appTheme}`],
                  ].join(" ")}
                  align="center"
              >
                {toAssetError}
              </Typography>
            </div>
        )}

        {loading && (
            <div className={classes.loader}>
              <Loader color={appTheme === "dark" ? "#8F5AE8" : "#8F5AE8"} />
            </div>
        )}
        {
          account && account.address ?
            <BtnSwap
              onClick={onSwap}
              className={classes.btnSwap}
              labelClassName={
                !fromAmountValue ||
                fromAmountValue > Number(fromAssetValue.balance) ||
                Number(fromAmountValue) <= 0
                    ? classes["actionButtonText--disabled"]
                    : classes.actionButtonText
              }
              isDisabled={
                !fromAmountValue ||
                fromAmountValue > Number(fromAssetValue.balance) ||
                Number(fromAmountValue) <= 0
              }
              label={
                loading ? "Swapping" : !fromAmountValue || Number(fromAmountValue) <= 0 ? "Enter Amount" : "Swap"
              }
            ></BtnSwap>
            :
            <WalletConnect>
              {({ connect }) => {
                return (
                  <BtnSwap
                    onClick={connect}
                    className={classes.btnSwap}
                    labelClassName={classes.actionButtonText}
                    label={'Connect wallet'}
                  ></BtnSwap>
                )
              }}
            </WalletConnect>
        }
      </div>
  );
}

export default withTheme(Setup);
