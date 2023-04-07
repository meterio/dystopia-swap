import React, { useState, useEffect, useCallback } from "react";

import PairsTable from "./ssLiquidityPairsTable.js";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants";

export default function ssLiquidityPairs() {
  const [isLoading, setIsLoading] = useState(true);
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState([]);
  const [pairBalancesLoading, setPairBalancesLoading] = useState(false);

  useEffect(() => {
    const stableSwapUpdated = () => {
      // 0x5da6ceb9dea34bfe6611bec4982506fdeb54a5a2 stable mtrg/busd
      // 0x3f637a435313d8de30e0fbe7b4e546a85b40e581 stable MTR/MTRG
      setPairs(stores.stableSwapStore.getStore("pairs"));
      forceUpdate();
      setIsLoading(false);
    };

    setPairs(stores.stableSwapStore.getStore("pairs"));

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  return (
    <PairsTable
      pairs={pairs.filter(
        (p) =>
          p.id !== "0x5da6ceb9dea34bfe6611bec4982506fdeb54a5a2" &&
          p.id !== "0x3f637a435313d8de30e0fbe7b4e546a85b40e581"
      )}
      isLoading={isLoading}
    />
  );
}
