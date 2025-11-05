import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Currency,
  CurrencyRates,
  getCurrencyRates,
  convertCurrency,
  formatCurrency,
  getPreferredCurrency,
  setPreferredCurrency,
} from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  rates: CurrencyRates | null;
  loading: boolean;
  error: string | null;
  setCurrency: (currency: Currency) => void;
  convertPrice: (priceInAED: number) => number;
  formatPrice: (priceInAED: number, showSymbol?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => getPreferredCurrency());
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedRates = await getCurrencyRates();
        setRates(fetchedRates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch currency rates');
        console.error('Error fetching currency rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Update currency preference
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setPreferredCurrency(newCurrency);
  };

  // Convert price from AED to selected currency
  const convertPrice = (priceInAED: number): number => {
    if (!rates) return priceInAED;
    return convertCurrency(priceInAED, currency, rates);
  };

  // Format price with currency symbol
  const formatPrice = (priceInAED: number, showSymbol: boolean = true): string => {
    if (!rates) return `AED ${priceInAED.toFixed(2)}`;
    const converted = convertPrice(priceInAED);
    return formatCurrency(converted, currency, showSymbol);
  };

  const value: CurrencyContextType = {
    currency,
    rates,
    loading,
    error,
    setCurrency,
    convertPrice,
    formatPrice,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
