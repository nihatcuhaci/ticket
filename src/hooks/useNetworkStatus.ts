import { useCallback, useEffect, useState } from 'react';
import * as Network from 'expo-network';

export interface NetworkStatus {
  isOffline: boolean;
  checking: boolean;
  recheck: () => void;
}

const isStateOffline = (state: Network.NetworkState): boolean =>
  state.isConnected === false || state.isInternetReachable === false;

/**
 * Whether the device currently has no usable internet connection.
 *
 * Backed by `expo-network`. On web this tracks the browser's own
 * `navigator.onLine` (and its `online`/`offline` events); on native it
 * tracks the OS-reported connectivity/reachability state. See
 * `NetworkGate` for how this is used to gate the app.
 *
 * "Unknown" reads (a field not yet reported, e.g. the very first render
 * before the native module resolves) are treated as online, not
 * offline — we'd rather fail open on a brief/ambiguous first read than
 * falsely block the whole app at launch.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(true);

  const applyState = useCallback((state: Network.NetworkState) => {
    setIsOffline(isStateOffline(state));
  }, []);

  useEffect(() => {
    let mounted = true;

    Network.getNetworkStateAsync()
      .then((state) => {
        if (mounted) applyState(state);
      })
      .catch(() => {
        // Can't determine connectivity — fail open (assume online)
        // rather than block the app on an inconclusive read.
      })
      .finally(() => {
        if (mounted) setChecking(false);
      });

    const subscription = Network.addNetworkStateListener(applyState);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [applyState]);

  const recheck = useCallback(() => {
    setChecking(true);
    Network.getNetworkStateAsync()
      .then(applyState)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [applyState]);

  return { isOffline, checking, recheck };
}
