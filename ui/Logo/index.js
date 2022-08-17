import React, { useState } from "react";

import { useAppThemeContext } from "../AppThemeProvider";

const Logo = (props) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const {width = windowWidth <= 770 ? "24" : "156", height = windowWidth <= 770 ? "24" : "36"} = props;
  const {appTheme} = useAppThemeContext();
  const mainFillColor = appTheme === "dark" ? "white" : "#0A2C40";

  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth);
  });

  return (
    <>
      {windowWidth > 770 &&
        <img src="/Voltswap_Logo.png" width={width} height={height} />
      }

      {windowWidth <= 770 &&
        <img src="/favicon.png" width={width} height={height} />
      }
    </>
  );
};

export default Logo;
