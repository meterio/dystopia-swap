import Head from "next/head";
import classes from "./layout.module.css";
import Header from "../header";
import SnackbarController from "../snackbar";
import { useAppThemeContext } from '../../ui/AppThemeProvider';
import { ACTIONS, socialLinks } from "../../stores/constants/constants";
import { useEffect, useState } from "react";
import stores from "../../stores";

// import twitterDay from "../../images/social-media-logo/twitter-dark.svg"


export default function Layout({
  children,
  configure,
  backClicked,
  changeTheme,
  title
}) {
  const { appTheme } = useAppThemeContext();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  const isHomePage = window.location.pathname === '/home'

  useEffect(() => {
    setInterval(() => {
      stores.dispatcher.dispatch({
        type: ACTIONS.CONFIGURE_SS,
      });
    }, 60 * 60 * 10);
  }, [])

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <link
          rel="preload"
          href="/fonts/Inter/Inter-Regular.ttf"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/Inter/Inter-Bold.ttf"
          as="font"
          crossOrigin=""
        />
        <meta name="description" content="Voltswap allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets built on Fantom." />
        <meta name="og:title" content="Voltswap" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div
        className={[
          classes.content,
          classes[`content--${appTheme}`],
          isHomePage ? classes[`homePage--${appTheme}`] : '',
          'g-flex-column'
        ].join(' ')}
      >
        {!configure && (
          <Header backClicked={backClicked} changeTheme={changeTheme} title={title} />
        )}
        <SnackbarController />
        <main className={[classes.main, 'g-flex-column__item', 'g-flex-column', 'g-scroll-y'].join(' ')}>
          <div className={[classes.containerInner, 'g-flex-column'].join(' ')}>
            {children}
          </div>
          <div className={windowWidth > 470 ? classes.layoutPromoSocials : classes.layoutPromoSocialsMobile}>
            <div className={classes.layoutPromoSocialsLink}>
              <a href={socialLinks.twitter} target="_blank">
                <img src={`${appTheme == 'light' ? '/socials/twitter-day.svg' : '/socials/twitter-dark.svg'}`}></img>
              </a>
            </div>
            <div className={classes.layoutPromoSocialsSeparator}>
              <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 2.49983V0.5H2L2 2.49983H0V3.49983H2L2 5.5H3V3.49983H5V2.49983H3Z" fill="#5688A5" />
              </svg>
            </div>
            <div className={classes.layoutPromoSocialsLink}>
              <a href={socialLinks.telegram} target="_blank">
                <img src={`${appTheme == 'light' ? '/socials/telegram-day.svg' : '/socials/telegram-dark.svg'}`}></img>
              </a>
            </div>
            <div className={classes.layoutPromoSocialsSeparator}>
              <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 2.49983V0.5H2L2 2.49983H0V3.49983H2L2 5.5H3V3.49983H5V2.49983H3Z" fill="#5688A5" />
              </svg>
            </div>
            <div className={classes.layoutPromoSocialsLink}>
              <a href={socialLinks.discord} target="_blank">
              <img src={`${appTheme == 'light' ? '/socials/discord-day.svg' : '/socials/discord-dark.svg'}`}></img>
              </a>
            </div>
            <div className={classes.layoutPromoSocialsSeparator}>
              <svg width="5" height="6" viewBox="0 0 5 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 2.49983V0.5H2L2 2.49983H0V3.49983H2L2 5.5H3V3.49983H5V2.49983H3Z" fill="#5688A5" />
              </svg>
            </div>
            <div className={classes.layoutPromoSocialsLink}>
              <a href={socialLinks.gitbook} target="_blank">
              <img src={`${appTheme == 'light' ? '/socials/gitbook-day.svg' : '/socials/gitbook-dark.svg'}`}></img>
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
