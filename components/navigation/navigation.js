import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Switch, ToggleButton, ToggleButtonGroup, Popover } from "@mui/material";
import { withTheme, withStyles } from "@mui/styles";
import {
  Close,
  ArrowDropDown,
} from "@mui/icons-material";

import SSWarning from "../ssWarning";

import classes from "./navigation.module.css";
import { useAppThemeContext } from "../../ui/AppThemeProvider";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

function Navigation(props) {
  const router = useRouter();
  const { appTheme } = useAppThemeContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("swap");
  const [supportChain, setSupportChain] = useState(stores.accountStore.getStore("supportChain"));

  function handleNavigate(route) {
    router.push(route);
  }

  const [warningOpen, setWarningOpen] = useState(false);

  useEffect(function () {
    const localStorageWarningAccepted = window.localStorage.getItem(
      "fixed.forex-warning-accepted"
    );
    setWarningOpen(
      localStorageWarningAccepted
        ? localStorageWarningAccepted !== "accepted"
        : true
    );
  }, []);

  const openWarning = () => {
    setWarningOpen(true);
  };

  const closeWarning = () => {
    window.localStorage.setItem("fixed.forex-warning-accepted", "accepted");
    setWarningOpen(false);
  };

  const onActiveClick = (event, val) => {
    if (val === undefined) {
      return
    }
    if (val || (!val && active)) {
      setActive(val || active);
      handleNavigate("/" + (val || active));
    }
  };
  const goWhitelist = (event) => {
    if (event.target.id !== 'whitelist') {
      return
    }
    if (active === 'whitelist') {
      return
    }
    handleClosePopover()
    onActiveClick(null, 'whitelist')
  }
  const outerLink = (event) => {
    let url = ''
    const id = event.target.id
    if (id === 'legacy') {
      url = 'https://v1.voltswap.finance'
    } else if (id === 'bridge') {
      url = 'https://passport.meter.io'
    } else if (id === 'gas') {
      url = 'https://wallet.meter.io/swap'
    } else if (id === 'lottery') {
      url = 'https://golucky.io'
    } else if (id === 'wallet') {
      url = 'https://wallet.meter.io'
    } else if (id === 'C14') {
      url = 'https://pay.c14.money/?targetAssetId=cce88109-9347-4f99-b28c-7592d741c46f'
    }

    if (url) {
      handleClosePopover()
      window.open(url, '_blank')
    }
  }

  useEffect(() => {
    const accountConfigure = () => {
      const supportChain = stores.accountStore.getStore("supportChain");

      setSupportChain(supportChain);
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    };
  }, []);

  useEffect(() => {
    const activePath = router.asPath;
    if (supportChain && activePath.includes("swapvolt") && supportChain.id !== '361') {
      router.push("/swap");
    }
  }, [supportChain])

  useEffect(() => {
    const activePath = router.asPath;
    if (activePath.includes("swap")) {
      setActive("swap");
    }
    if (activePath.includes("swapvolt")) {
      setActive("swapvolt");
    }
    if (activePath.includes("liquidity")) {
      setActive("liquidity");
    }
    if (activePath.includes("vest")) {
      setActive("vest");
    }
    if (activePath.includes("vote")) {
      setActive("vote");
    }
    if (activePath.includes("bribe")) {
      setActive("bribe");
    }
    if (activePath.includes("rewards")) {
      setActive("rewards");
    }
    if (activePath.includes("dashboard")) {
      setActive("dashboard");
    }
    if (activePath.includes("whitelist")) {
      setActive("whitelist");
    }
    if (activePath.includes("migrate")) {
      setActive("migrate");
    }
  }, []);

  const renderNavs = () => {
    return (
      <ToggleButtonGroup
        value={router.asPath.includes("home") ? null : active}
        exclusive
        onChange={onActiveClick}
        className={classes.navToggles}
      >
        {renderSubNav("Swap", "swap")}
        {supportChain && supportChain.id === '361' && renderSubNav("SwapVolt", "swapvolt")}
        {renderSubNav("Liquidity", "liquidity")}
        {renderSubNav("Vest", "vest")}
        {renderSubNav("Vote", "vote")}
        {renderSubNav("Rewards", "rewards")}
        {/* {renderSubNav("Migrate", "migrate")} */}
        {renderPopSubNav("Resources")}
        {renderLinkSubNav("NFT")}
      </ToggleButtonGroup>
    );
  };

  const renderSectionHeader = (title) => {
    return (
      <div className={classes.navigationOptionContainer}>
        <div className={classes.navigationOptionNotSelected}></div>
        <Typography variant="h2" className={classes.sectionText}>
          {title}
        </Typography>
      </div>
    );
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleLinkClick = (event, link) => {
    window.open(link)
  }

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const renderSubNav = (title, link) => {
    return (
      <ToggleButton
        value={link}
        className={[
          classes[`nav-button`],
          classes[`nav-button--${appTheme}`],
        ].join(" ")}
        classes={{ selected: classes[`nav-button--active`] }}
      >
        <div
          className={[
            classes[`nav-button-corner-top`],
            classes[`nav-button-corner-top--${appTheme}`],
          ].join(" ")}
        >
          <div
            className={[
              classes[`nav-button-corner-bottom`],
              classes[`nav-button-corner-bottom--${appTheme}`],
            ].join(" ")}
          >
            <Typography variant="h2" className={classes.subtitleText}>
              {title}
            </Typography>
          </div>
        </div>
      </ToggleButton>
    );
  };

  const renderPopSubNav = (title) => {
    return (
      <ToggleButton
        className={[
          classes[`nav-button`],
          classes[`nav-button--${appTheme}`],
        ].join(" ")}
        classes={{ selected: classes[`nav-button--active`] }}
        onClick={handleClick}
      >
        <div
          className={[
            classes[`nav-button-corner-top`],
            classes[`nav-button-corner-top--${appTheme}`],
          ].join(" ")}
        >
          <div
            className={[
              classes[`nav-button-corner-bottom`],
              classes[`nav-button-corner-bottom--${appTheme}`],
            ].join(" ")}
          >
            <Typography variant="h2" className={classes.subtitleText}>
              {title}
            </Typography>
          </div>
        </div>
      </ToggleButton>
    )
  }

  const renderLinkSubNav = (title) => {
    return (
      <ToggleButton
        className={[
          classes[`nav-button`],
          classes[`nav-button--${appTheme}`],
        ].join(" ")}
        classes={{ selected: classes[`nav-button--active`] }}
        onClick={(e) => {
          handleLinkClick(e, 'https://nft.voltswap.finance')
        }}
      >
        <div
          className={[
            classes[`nav-button-corner-top`],
            classes[`nav-button-corner-top--${appTheme}`],
          ].join(" ")}
        >
          <div
            className={[
              classes[`text-nowrap`],
              classes[`nav-button-corner-bottom`],
              classes[`nav-button-corner-bottom--${appTheme}`],
            ].join(" ")}
          >
            <Typography variant="h2" className={classes.subtitleText}>
              <span>{title}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
            </Typography>
          </div>
        </div>
      </ToggleButton>
    )
  }

  return (
    <div className={classes.navigationContainer}>
      <div className={classes.navigationContent}>{renderNavs()}</div>

      {warningOpen && <SSWarning close={closeWarning} />}

      <Popover
        classes={{
          paper: [
            classes.popoverPaper,
            classes[`popoverPaper--${appTheme}`],
          ].join(" "),
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          className={[
            classes.filterContainer,
            classes[`filterContainer--${appTheme}`],
          ].join(" ")}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Typography
              className={[
                classes.filterListTitle,
                classes[`filterListTitle--${appTheme}`],
              ].join(" ")}
            >
              Resources
            </Typography>

            <Close
              style={{
                cursor: "pointer",
                color: appTheme === "dark" ? "#ffffff" : "#0A2C40",
              }}
              onClick={handleClick}
            />
          </div>

          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="whitelist" onClick={goWhitelist}>Whitelist</div>
            </Typography>
          </div>

          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="legacy" onClick={outerLink}>VoltSwap v1</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>

          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="bridge" onClick={outerLink}>Bridge</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>
          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="gas" onClick={outerLink}>Gas Station</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>
          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="lottery" onClick={outerLink}>Lottery</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>
          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="wallet" onClick={outerLink}>Wallet</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>
          <div
            className={[
              classes.filterItem,
              classes[`filterItem--${appTheme}`],
              "g-flex",
              "g-flex--align-center",
              "g-flex--space-between",
            ].join(" ")}
          >
            <Typography
              className={[
                classes.filterLabel,
                classes[`filterLabel--${appTheme}`],
              ].join(" ")}
            >
              <div id="C14" onClick={outerLink}>Fiat to Meter</div>
            </Typography>

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M10.6694 6.276L4.93144 12.014L3.98877 11.0713L9.7261 5.33333H4.66944V4H12.0028V11.3333H10.6694V6.276Z"
                  fill={appTheme === 'dark' ? '#5688A5' : '#5688A5'}/>
            </svg>
          </div>
        </div>
      </Popover>
    </div>
  );
}

export default withTheme(Navigation);
