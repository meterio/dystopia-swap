import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  InputBase,
} from "@mui/material";
import { withTheme } from "@mui/styles";
import {
  formatCurrency,
  formatInputAmount,
  formatAddress,
  formatCurrencyWithSymbol,
  formatCurrencySmall,
} from "../../utils";
import classes from "./ssSwap.module.css";
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
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

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

  const [slippage, setSlippage] = useState("2");
  const [slippageError, setSlippageError] = useState(false);

  const [quoteError, setQuoteError] = useState(null);
  const [quote, setQuote] = useState(null);
  const [hidequote, sethidequote] = useState(false);
  const [hintAnchor, setHintAnchor] = React.useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { appTheme } = useAppThemeContext();

  const [account, setAccount] = useState(stores.accountStore.getStore('account'));
  const [supportChain, setSupportChain] = useState(stores.accountStore.getStore('supportChain'));
  const [nativeToken, setNativeToken] = useState(supportChain ? supportChain.contracts.FTM_ADDRESS : '');
  const [wNativeToken, setWNativeToken] = useState(supportChain ? supportChain.contracts.WFTM_SYMBOL : '');

  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {

    const timer = setTimeout(() => {
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_BASE_ASSET_BALANCE,
        content: {},
      });
      setLoopNum(loopNum + 1)
    }, 30000);

    return () => {
      clearTimeout(timer)
    }
  }, [loopNum])

  const handleClickPopover = (event) => {
    setHintAnchor(event.currentTarget);
  };

  const handleClosePopover = () => {
    setHintAnchor(null);
  };

  const openHint = Boolean(hintAnchor);

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  const router = useRouter()

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
          setApprovalLoading(false);
          setQuoteLoading(false);
          setQuote(null);
          setFromAmountValue("");
          setToAmountValue("");
          setQuoteError(msg);
        };

        const quoteReturned = (val) => {
          if (!val) {
            setQuoteLoading(false);
            setQuote(null);
            setToAmountValue("");
            setQuoteError(
                "Insufficient liquidity or no route available to complete swap"
            );
          }
          if (
              val &&
              val.inputs &&
              val.inputs.fromAmount === fromAmountValue &&
              val.inputs.fromAsset.address === fromAssetValue.address &&
              val.inputs.toAsset.address === toAssetValue.address
          ) {
            setQuoteLoading(false);
            if (BigNumber(val.output.finalValue).eq(0)) {
              setQuote(null);
              setToAmountValue("");
              setQuoteError(
                  "Insufficient liquidity or no route available to complete swap"
              );
              return;
            }

            setToAmountValue(BigNumber(val.output.finalValue).toFixed(8));
            setQuote(val);
          }
        };

        const ssUpdated = () => {
          let { inputCurrency, outputCurrency } = router.query
          const supportChain = stores.accountStore.getStore('supportChain');
          if (!inputCurrency) {
            inputCurrency = supportChain && supportChain.govAddr
          }
          if (!outputCurrency) {
            outputCurrency = supportChain && supportChain.contracts.FTM_ADDRESS
          }
          const _baseAsset = stores.stableSwapStore.getStore("baseAssets");
          // console.log('baseAssets', _baseAsset)
          const wToken = supportChain ? supportChain.contracts.WFTM_SYMBOL : ''
          const baseAsset = _baseAsset//.filter(item => item.symbol !== wToken)

          setToAssetOptions(baseAsset);
          setFromAssetOptions(baseAsset);

          if (baseAsset.length > 0) {
            let _toAssetValue = null
            let _fromAssetValue = null
            if (toAssetValue) {
              _toAssetValue = baseAsset.find(token => token.address === toAssetValue.address)
            } else {
              _toAssetValue = baseAsset.find(token => token.address.toLowerCase() === outputCurrency.toLowerCase())
            }

            if (fromAssetValue) {
              _fromAssetValue = baseAsset.find(token => token.address === fromAssetValue.address)
            } else {
              _fromAssetValue = baseAsset.find(token => token.address.toLowerCase() === inputCurrency.toLowerCase())
            }
            if (_toAssetValue) {
              setToAssetValue(_toAssetValue)
            } else {
              setToAssetValue(baseAsset[0]);
            }

            if (_fromAssetValue) {
              setFromAssetValue(_fromAssetValue)
            } else {
              setFromAssetValue(baseAsset[1]);
            }
          }
          forceUpdate();
        };

        const assetsUpdated = () => {
          const baseAsset = stores.stableSwapStore.getStore("baseAssets");
          setToAssetOptions(baseAsset);
          setFromAssetOptions(baseAsset);
        };

        const swapReturned = (event) => {
          setLoading(false);
          setFromAmountValue("");
          setToAmountValue("");
          if (
              !(
                  (fromAssetValue?.symbol == nativeToken ||
                      fromAssetValue?.symbol == wNativeToken) &&
                  (toAssetValue?.symbol == wNativeToken ||
                      toAssetValue?.symbol == nativeToken)
              )
          )
            calculateReceiveAmount(0, fromAssetValue, toAssetValue);
          else {
            sethidequote(true);
            setToAmountValue(0);
          }
          setQuote(null);
          setQuoteLoading(false);
        };
        const wrapReturned = () => {
          setLoading(false);
        };

        stores.emitter.on(ACTIONS.ERROR, errorReturned);
        stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
        stores.emitter.on(ACTIONS.WRAP_RETURNED, wrapReturned);
        stores.emitter.on(ACTIONS.UNWRAP_RETURNED, wrapReturned);
        stores.emitter.on(ACTIONS.SWAP_RETURNED, swapReturned);
        stores.emitter.on(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned);
        stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);

        ssUpdated();

        return () => {
          stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
          stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
          stores.emitter.removeListener(ACTIONS.SWAP_RETURNED, swapReturned);
          stores.emitter.removeListener(
              ACTIONS.QUOTE_SWAP_RETURNED,
              quoteReturned
          );
          stores.emitter.removeListener(
              ACTIONS.BASE_ASSETS_UPDATED,
              assetsUpdated
          );
        };
      },
      [fromAmountValue, fromAssetValue, toAssetValue]
  );

  const onAssetSelect = (type, value) => {
    if (type === "From") {
      if (value.address === toAssetValue.address) {
        setToAssetValue(fromAssetValue);
        setFromAssetValue(toAssetValue);
        if (
            !(
                (fromAssetValue?.symbol == nativeToken ||
                    fromAssetValue?.symbol == wNativeToken) &&
                (toAssetValue?.symbol == wNativeToken ||
                    toAssetValue?.symbol == nativeToken)
            )
        )
          calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
        else {
          sethidequote(true);
          setToAmountValue(fromAmountValue);
        }
      } else {
        setFromAssetValue(value);
        if (
            !(
                (value?.symbol == nativeToken || value?.symbol == wNativeToken) &&
                (toAssetValue?.symbol == wNativeToken ||
                    toAssetValue?.symbol == nativeToken)
            )
        )
          calculateReceiveAmount(fromAmountValue, value, toAssetValue);
        else {
          sethidequote(true);
          setToAmountValue(fromAmountValue);
        }
      }
    } else {
      if (value.address === fromAssetValue.address) {
        setFromAssetValue(toAssetValue);
        setToAssetValue(fromAssetValue);
        if (
            !(
                (fromAssetValue?.symbol == nativeToken ||
                    fromAssetValue?.symbol == wNativeToken) &&
                (toAssetValue?.symbol == wNativeToken ||
                    toAssetValue?.symbol == nativeToken)
            )
        )
          calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
        else {
          sethidequote(true);
          setToAmountValue(fromAmountValue);
        }
      } else {
        setToAssetValue(value);
        if (
            !(
                (fromAssetValue?.symbol == nativeToken ||
                    fromAssetValue?.symbol == wNativeToken) &&
                (value?.symbol == wNativeToken || value?.symbol == nativeToken)
            )
        )
          calculateReceiveAmount(fromAmountValue, fromAssetValue, value);
        else {
          sethidequote(true);
          setToAmountValue(fromAmountValue);
        }
      }
    }

    forceUpdate();
  };

  const fromAmountChanged = (event) => {
    const value = formatInputAmount(event.target.value.replace(",", "."));

    setFromAmountError(false);
    setFromAmountValue(value);
    if (value == "" || Number(value) === 0) {
      setToAmountValue("");
      setQuote(null);
    } else {
      if (
          !(
              (fromAssetValue?.symbol == nativeToken ||
                  fromAssetValue?.symbol == wNativeToken) &&
              (toAssetValue?.symbol == wNativeToken || toAssetValue?.symbol == nativeToken)
          )
      )
        calculateReceiveAmount(value, fromAssetValue, toAssetValue);
      else {
        sethidequote(true);
        setToAmountValue(value);
      }
      // else setToAmountValue(value);
    }
  };

  const toAmountChanged = (event) => { };

  const onSlippageChanged = (event) => {
    if (event.target.value == "" || !isNaN(event.target.value)) {
      setSlippage(event.target.value);
    }
  };

  const calculateReceiveAmount = (amount, from, to) => {
    if (amount !== "" && !isNaN(amount) && to != null) {
      setQuoteLoading(true);
      setQuoteError(false);

      stores.dispatcher.dispatch({
        type: ACTIONS.QUOTE_SWAP,
        content: {
          fromAsset: from,
          toAsset: to,
          fromAmount: amount,
        },
      });
    }
  };

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
        type: ACTIONS.SWAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          quote: quote,
          slippage: slippage,
        },
      });
    }
  };
  const onWrap = () => {
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
        type: ACTIONS.WRAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          quote: quote,
          slippage: slippage,
        },
      });
    }
  };
  const onUnwrap = () => {
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
        type: ACTIONS.UNWRAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          quote: quote,
          slippage: slippage,
        },
      });
    }
  };

  const setBalance100 = () => {
    setFromAmountValue(fromAssetValue.balance);
    if (
        !(
            (fromAssetValue?.symbol == nativeToken ||
                fromAssetValue?.symbol == wNativeToken) &&
            (toAssetValue?.symbol == wNativeToken || toAssetValue?.symbol == nativeToken)
        )
    )
      calculateReceiveAmount(
          fromAssetValue.balance,
          fromAssetValue,
          toAssetValue
      );
    else {
      sethidequote(true);
      setToAmountValue(fromAssetValue.balance);
    }
  };

  const swapAssets = () => {
    const fa = fromAssetValue;
    const ta = toAssetValue;
    setFromAssetValue(ta);
    setToAssetValue(fa);
    if (
        !(
            (fromAssetValue?.symbol == nativeToken ||
                fromAssetValue?.symbol == wNativeToken) &&
            (toAssetValue?.symbol == wNativeToken || toAssetValue?.symbol == nativeToken)
        )
    )
      calculateReceiveAmount(fromAmountValue, ta, fa);
    else {
      sethidequote(true);
      setToAmountValue(fromAmountValue);
    }
  };

  const renderSwapInformation = () => {
    if (quoteError) {
      return (
          <div
              className={[classes.quoteLoader, classes.quoteLoaderError].join(" ")}
          >
            <div
                className={[
                  classes.quoteLoaderDivider,
                  classes.quoteLoaderDividerError,
                ].join(" ")}
            ></div>
            <Typography className={classes.quoteError}>{quoteError}</Typography>
          </div>
      );
    }

    if (quoteLoading) {
      return (
          <div
              className={[classes.quoteLoader, classes.quoteLoaderLoading].join(
                  " "
              )}
          >
            <CircularProgress size={20} className={classes.loadingCircle} />
          </div>
      );
    }

    return (
        <div className={classes.depositInfoContainer}>
          {quote && (
              <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
              >
                {fromAmountValue <= Number(fromAssetValue.balance) && (
                    <div
                        className={[
                          classes.warningContainer,
                          classes[`warningContainer--${appTheme}`],
                          BigNumber(quote.priceImpact).gt(5)
                              ? classes.warningContainerError
                              : classes.warningContainerWarning,
                        ].join(" ")}
                    >
                      <div
                          className={[
                            classes.warningDivider,
                            BigNumber(quote.priceImpact).gt(5)
                                ? classes.warningDividerError
                                : classes.warningDividerWarning,
                          ].join(" ")}
                      ></div>
                      <Typography
                          className={[
                            BigNumber(quote.priceImpact).gt(5)
                                ? classes.warningError
                                : classes.warningWarning,
                            classes[`warningText--${appTheme}`],
                          ].join(" ")}
                          align="center"
                      >
                        Price impact: {formatCurrency(quote.priceImpact)}%
                      </Typography>
                    </div>
                )}

                {fromAmountValue > Number(fromAssetValue.balance) && (
                    <div
                        className={[
                          classes.warningContainer,
                          classes[`warningContainer--${appTheme}`],
                          BigNumber(quote.priceImpact).gt(5)
                              ? classes.warningContainerError
                              : classes.warningContainerWarning,
                        ].join(" ")}
                    >
                      <div
                          className={[
                            classes.warningDivider,
                            BigNumber(quote.priceImpact).gt(5)
                                ? classes.warningDividerError
                                : classes.warningDividerWarning,
                          ].join(" ")}
                      ></div>

                      <Typography
                          className={[
                            BigNumber(quote.priceImpact).gt(5)
                                ? classes.warningError
                                : classes.warningWarning,
                            classes[`warningText--${appTheme}`],
                          ].join(" ")}
                          align="center"
                      >
                        Balance is below the entered value
                      </Typography>
                    </div>
                )}

                <Typography
                    className={[
                      classes.depositInfoHeading,
                      classes[`depositInfoHeading--${appTheme}`],
                      classes.depositInfoHeadingPrice,
                    ].join(" ")}
                >
                  Price Info
                </Typography>

                <div
                    className={[
                      classes.priceInfos,
                      classes[`priceInfos--${appTheme}`],
                    ].join(" ")}
                >
                  <div
                      className={[
                        classes.priceInfo,
                        classes[`priceInfo--${appTheme}`],
                      ].join(" ")}
                  >
                    <Typography className={classes.text}>
                      {`${fromAssetValue?.symbol} per ${toAssetValue?.symbol}`}
                    </Typography>

                    <Typography className={classes.title}>
                      {formatCurrency(
                          BigNumber(quote.inputs.fromAmount)
                              .div(quote.output.finalValue)
                              .toFixed(18)
                      )}
                    </Typography>
                  </div>

                  <div
                      className={[
                        classes.priceInfo,
                        classes[`priceInfo--${appTheme}`],
                      ].join(" ")}
                  >
                    <Typography className={classes.text}>
                      {`${toAssetValue?.symbol} per ${fromAssetValue?.symbol}`}
                    </Typography>

                    <Typography className={classes.title}>
                      {formatCurrency(
                          BigNumber(quote.output.finalValue)
                              .div(quote.inputs.fromAmount)
                              .toFixed(18)
                      )}
                    </Typography>
                  </div>
                </div>

                <Typography
                    className={[
                      classes.depositInfoHeading,
                      classes[`depositInfoHeading--${appTheme}`],
                    ].join(" ")}
                >
                  Route
                </Typography>

                <div
                    className={[classes.route, classes[`route--${appTheme}`]].join(
                        " "
                    )}
                >
                  <img
                      className={[
                        classes.routeIcon,
                        classes[`routeIcon--${appTheme}`],
                      ].join(" ")}
                      alt=""
                      src={fromAssetValue ? `${fromAssetValue.logoURI}` : ""}
                      height="40px"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                      }}
                  />
                  <div className={classes.line}>
                    <div
                        className={[
                          classes.routeLinesLeft,
                          classes[`routeLinesLeft--${appTheme}`],
                        ].join(" ")}
                    ></div>

                    {quote?.output?.routeAsset && quote?.output?.routeAsset.length === 1 && (
                        <>
                          <div
                              className={[
                                classes.routeLinesLeftText,
                                classes[`routeLinesLeftText--${appTheme}`],
                              ].join(" ")}
                          >
                            {quote.output.routes[0].stable ? "Stable" : "Volatile"}
                          </div>

                          <img
                              className={[
                                classes.routeIcon,
                                classes[`routeIcon--${appTheme}`],
                              ].join(" ")}
                              alt=""
                              src={quote.output.routeAsset[0].logoURI}
                              height="40px"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                              }}
                          />

                          <div
                              className={[
                                classes.routeLinesRightText,
                                classes[`routeLinesRightText--${appTheme}`],
                              ].join(" ")}
                          >
                            {quote.output.routes[1].stable ? "Stable" : "Volatile"}
                          </div>
                        </>
                    )}

                    {quote?.output?.routeAsset && quote?.output?.routeAsset.length === 2 && (
                        <>
                          <div
                              className={[
                                classes.routeLinesLeftText,
                                classes.routeLinesLeftText1,
                                classes[`routeLinesLeftText--${appTheme}`],
                              ].join(" ")}
                          >
                            {quote.output.routes[0].stable ? "Stable" : "Volatile"}
                          </div>

                          <img
                              className={[
                                classes.routeIcon,
                                classes[`routeIcon--${appTheme}`],
                              ].join(" ")}
                              alt=""
                              src={quote.output.routeAsset[0].logoURI}
                              height="40px"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                              }}
                          />

                          <div
                            className={[
                              classes.routeLinesMiddle,
                              classes[`routeLinesMiddle--${appTheme}`],
                            ].join(" ")}
                          ></div>

                          <div
                              className={[
                                classes.routeLinesMiddleText,
                                classes[`routeLinesMiddleText--${appTheme}`],
                              ].join(" ")}
                          >
                            {quote.output.routes[1].stable ? "Stable" : "Volatile"}
                          </div>

                          <img
                              className={[
                                classes.routeIcon,
                                classes[`routeIcon--${appTheme}`],
                              ].join(" ")}
                              alt=""
                              src={quote.output.routeAsset[1].logoURI}
                              height="40px"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                              }}
                          />

                          <div
                              className={[
                                classes.routeLinesRightText,
                                classes.routeLinesRightText1,
                                classes[`routeLinesRightText--${appTheme}`],
                              ].join(" ")}
                          >
                            {quote.output.routes[2].stable ? "Stable" : "Volatile"}
                          </div>
                        </>
                    )}

                    {!quote?.output?.routeAsset && (
                        <div
                            className={[
                              classes.routeArrow,
                              classes[`routeArrow--${appTheme}`],
                            ].join(" ")}
                        >
                          {quote.output.routes[0].stable ? "Stable" : "Volatile"}
                        </div>
                    )}

                    <div
                        className={[
                          classes.routeLinesRight,
                          classes[`routeLinesRight--${appTheme}`],
                        ].join(" ")}
                    ></div>
                  </div>

                  <img
                      className={[
                        classes.routeIcon,
                        classes[`routeIcon--${appTheme}`],
                      ].join(" ")}
                      alt=""
                      src={toAssetValue ? `${toAssetValue.logoURI}` : ""}
                      height="40px"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `/tokens/unknown-logo--${appTheme}.svg`;
                      }}
                  />
                </div>
              </div>
          )}
        </div>
    );
  };

  const renderSmallInput = (type, amountValue, amountError, amountChanged) => {
    return (
        <div className={classes.slippage}>
          <div
              className={[
                "g-flex",
                "g-flex--align-center",
                classes.slippageLabel,
              ].join(" ")}
          >
            <Typography
                className={[
                  classes.inputBalanceSlippage,
                  classes[`inputBalanceSlippage--${appTheme}`],
                ].join(" ")}
                noWrap
            >
              Slippage
            </Typography>

            <Hint
                hintText={
                  "Slippage is the difference between the price you expect to get on the crypto you have ordered and the price you actually get when the order executes."
                }
                open={openHint}
                anchor={hintAnchor}
                handleClick={handleClickPopover}
                handleClose={handleClosePopover}
                vertical={-110}
            ></Hint>
          </div>

          <TextField
              placeholder="0.00"
              error={amountError}
              value={amountValue}
              onChange={amountChanged}
              disabled={loading}
              autoComplete="off"
              InputProps={{
                classes: {
                  root: [
                    classes.inputBalanceSlippageText,
                    classes[`inputBalanceSlippageText--${appTheme}`],
                  ].join(" "),
                  inputAdornedStart: [
                    classes.inputBalanceSlippageText,
                    classes[`inputBalanceSlippageText--${appTheme}`],
                  ].join(" "),
                },
              }}
              inputProps={{
                size: amountValue?.length || 4,
                style: {
                  padding: 0,
                  borderRadius: 0,
                  border: "none",
                  color: appTheme === "dark" ? "#ffffff" : "#0A2C40",
                  paddingRight: amountValue?.length >= 8 ? 10 : 0,
                },
              }}
          />
        </div>
    );
  };

  const renderMassiveInput = (
      type,
      amountValue,
      amountError,
      amountChanged,
      assetValue,
      assetError,
      assetOptions,
      onAssetSelect
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
            onAssetSelect
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
            onAssetSelect
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

        {renderSmallInput("slippage", slippage, slippageError, onSlippageChanged)}

        {slippageError && (
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
                {slippageError}
              </Typography>
            </div>
        )}

        {!hidequote ? renderSwapInformation() : null}

        {loading && (
            <div className={classes.loader}>
              <Loader color={appTheme === "dark" ? "#8F5AE8" : "#8F5AE8"} />
            </div>
        )}
        {
          account && account.address ?
            <BtnSwap
              onClick={
                (fromAssetValue?.symbol == nativeToken && toAssetValue?.symbol == wNativeToken)
                    ? onWrap
                    : (fromAssetValue?.symbol == wNativeToken && toAssetValue?.symbol == nativeToken)
                        ? onUnwrap
                        : onSwap
              }
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
                loading && fromAssetValue?.symbol == nativeToken && toAssetValue?.symbol == wNativeToken
                    ? "Wrapping"
                    : loading && fromAssetValue?.symbol == wNativeToken && toAssetValue?.symbol == nativeToken
                        ? "Unwrapping"
                        : loading &&
                        !(
                            (fromAssetValue?.symbol == nativeToken ||
                                fromAssetValue?.symbol == wNativeToken) &&
                            (toAssetValue?.symbol == wNativeToken ||
                                toAssetValue?.symbol == nativeToken)
                        )
                            ? "Swapping"
                            : !fromAmountValue || Number(fromAmountValue) <= 0
                                ? "Enter Amount"
                                : (fromAssetValue?.symbol == nativeToken && toAssetValue?.symbol == wNativeToken)
                                    ? "Wrap"
                                    : (fromAssetValue?.symbol == wNativeToken && toAssetValue?.symbol == nativeToken)
                                        ? "Unwrap"
                                        : "Swap"
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
        {
          supportChain && supportChain.id === '82' &&
          <div style={{
            border: '1px solid rgb(76, 173, 230)',
            marginTop: '10px'
          }}>
            <a style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              fontWeight: 'bold',
              color: `${appTheme === 'light' ? '#000' : '#fff'}`,
              textDecoration: 'none'
            }} href="https://wallet.meter.io/swap" target="_blank">Gas Station</a>
          </div>
        }
      </div>
  );
}

export default withTheme(Setup);
