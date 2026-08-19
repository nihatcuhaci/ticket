import { useEffect, useState } from 'react';
import { ExchangeRates, getExchangeRates } from '../services/currencyService';

interface State {
  rates: ExchangeRates | null;
  loading: boolean;
}

/** Fetches live FX rates once per app session (see currencyService.ts). */
export function useExchangeRates(): State {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExchangeRates().then((r) => {
      if (!cancelled) {
        setRates(r);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rates, loading };
}
