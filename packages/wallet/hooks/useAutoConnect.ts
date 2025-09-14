import { useEffect } from 'react';
import { useWallet } from './useWallet';

const AUTOCONNECTED_CONNECTOR_IDS = ['safe'];

export function useAutoConnect() {
  const { connect, connectors } = useWallet();

  useEffect(() => {
    for (const connector in AUTOCONNECTED_CONNECTOR_IDS) {
      const connectorInstance = connectors.find((c) => c.id === connector && c.ready);

      if (connectorInstance) {
        connect({ connector: connectorInstance });
      }
    }
  }, [connect, connectors]);
}
