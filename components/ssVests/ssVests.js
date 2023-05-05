import React, { useState, useEffect, useCallback } from 'react';
import { Paper } from '@mui/material';

import classes from './ssVests.module.css';

import VestsTable from './ssVestsTable.js';

import stores from '../../stores';
import { ACTIONS } from '../../stores/constants';

export default function ssVests() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [vestNFTs, setVestNFTs] = useState([]);
  const [govToken, setGovToken] = useState(null);
  const [veToken, setVeToken] = useState(null);

  useEffect(() => {
    const ssUpdated = async () => {
      const govToken = stores.stableSwapStore.getStore("govToken");
      const veToken = stores.stableSwapStore.getStore("veToken");
      if (govToken && veToken) {
        setGovToken(govToken);
        setVeToken(veToken);
      }
    };

    ssUpdated();

    stores.emitter.on(ACTIONS.UPDATED_VETOKEN, ssUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED_VETOKEN, ssUpdated);
    };
  }, []);

  useEffect(() => {
    const vestNFTsReturned = (nfts) => {
      setVestNFTs(nfts);
      forceUpdate();
    };

    const accountConfigured = () => {
      // const supportChain = stores.accountStore.getStore('supportChain');
      // if (supportChain) {
        stores.dispatcher.dispatch({type: ACTIONS.GET_VEST_NFTS, content: {}});
      // }
    }

    // window.setTimeout(() => {
    //   const supportChain = stores.accountStore.getStore('supportChain');
    //   if (supportChain) {
    //     stores.dispatcher.dispatch({type: ACTIONS.GET_VEST_NFTS, content: {}});
    //   }
    // }, 1);

    accountConfigured()

    stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigured);
    return () => {
      stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned);
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, accountConfigured);
    };
  }, []);

  return (
    <VestsTable vestNFTs={vestNFTs} govToken={govToken} veToken={veToken}/>
  );
}
