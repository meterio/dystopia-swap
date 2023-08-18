import React, { useState, useEffect, useCallback } from 'react';
import { Typography } from '@mui/material';
import classes from './ssAirdrop.module.css';
import AirdropTable from './ssAirdropTable.js';
import { Add, AttachMoney } from '@mui/icons-material';
import stores from '../../stores';
import { ACTIONS } from '../../stores/constants';
import { useAppThemeContext } from '../../ui/AppThemeProvider';
import { root } from '../../stores/configurations/airdrop';
import axios from 'axios'

export default function ssAirdrop() {

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [airdrops, setAirdrops] = useState([]);

  const { appTheme } = useAppThemeContext();

  const newAirdrops = (data) => {
    console.log('newAirdrops data', data)
    if (data) {
      setAirdrops(data)
    }
  };

  const initAirdropData = () => {
    const account = stores.accountStore.getStore("account")
    if (account) {
      const fetchUrl = `https://raw.githubusercontent.com/meterio/dystopia-contracts/base/scripts/setting/proofs/${account.address.toLowerCase()}.json`
      axios.get(fetchUrl).then(res => {
        console.log(res)
        const addrInfo = [...res.data, root]
        
        setAirdrops(addrInfo)

        stores.stableSwapStore.getAirdropClaimed(addrInfo)
      }).catch(err => {
        console.log('fetch airdrop addr info', err)
      })
    }
  }

  useEffect(() => {
    
    initAirdropData()

    stores.emitter.on(ACTIONS.IS_AIRDROP_CLAIMED, newAirdrops);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, initAirdropData);
    stores.emitter.on(ACTIONS.CLAIM_AIRDROP_RETURNED, initAirdropData);
    return () => {
      stores.emitter.removeListener(ACTIONS.IS_AIRDROP_CLAIMED, newAirdrops);
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, initAirdropData);
      stores.emitter.removeListener(ACTIONS.CLAIM_AIRDROP_RETURNED, initAirdropData);
    };
  }, []);

  const onClaimAll = () => {
    // stores.dispatcher.dispatch({ type: ACTIONS.CLAIM_ALL_REWARDS, content: { pairs: rewards, tokenID: sendTokenID } });
  };

  return (
    <>
      {/* <div
        className={[classes.toolbarContainer, 'g-flex', 'g-flex--align-baseline', 'g-flex--space-between'].join(' ')}>
        <div
          className={[classes.addButton, classes[`addButton--${appTheme}`], 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}
          onClick={onClaimAll}>
          <div
            className={[classes.addButtonIcon, 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}>
            <Add style={{ width: 20, color: '#fff' }} />
          </div>

          <Typography
            className={[classes.actionButtonText, classes[`actionButtonText--${appTheme}`], 'g-flex', 'g-flex--align-center', 'g-flex--justify-center'].join(' ')}>
            Claim All
          </Typography>
        </div>
      </div> */}

      <AirdropTable airdrops={airdrops} />
    </>
  );
}
