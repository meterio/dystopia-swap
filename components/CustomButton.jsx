import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useState } from "react";


export default function CustomButton() {
  const [loading, setLoading] = useState(false);
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount
  const { disconnect } = useDisconnect();
  const label = isConnected ? "Disconnect" : "Connect Custom";

  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  function onClick() {
    if (isConnected) {
      disconnect();
    } else {
      onOpen();
    }
  }

  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : label}
    </button>
  );
}