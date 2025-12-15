/**
 * useCurrency Hook
 *
 * React hook for location-based automatic currency detection and conversion.
 * Detects visitor's currency on first load and provides conversion utilities.
 *
 * Usage:
 * ```jsx
 * const { currencyInfo, convertPrice, formatLocalPrice, isLoading } = useCurrency();
 *
 * // Display a price in the user's local currency
 * <span>{formatLocalPrice(9.99)}</span>
 *
 * // Or get full conversion details
 * const converted = convertPrice(9.99);
 * // { originalAmount: 9.99, convertedAmount: 8.50, formattedPrice: '£8.50', ... }
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  detectCurrency,
  convertPriceLocal,
  formatPrice,
  getCachedCurrencyInfo,
  clearCurrencyCache,
} from '../services/api/currencyAPI.js';

/**
 * Hook for automatic currency detection and conversion
 *
 * @param {Object} options Configuration options
 * @param {boolean} options.autoDetect - Auto-detect currency on mount (default: true)
 * @param {string} options.baseCurrency - Base currency for conversions (default: 'USD')
 * @returns {Object} Currency utilities and state
 */
export function useCurrency(options = {}) {
  const { autoDetect = true, baseCurrency = 'USD' } = options;

  const [currencyInfo, setCurrencyInfo] = useState(() => getCachedCurrencyInfo());
  const [isLoading, setIsLoading] = useState(!getCachedCurrencyInfo());
  const [error, setError] = useState(null);

  // Detect currency on mount
  useEffect(() => {
    if (!autoDetect) return;

    // If we already have cached info, don't show loading
    if (getCachedCurrencyInfo()) {
      setCurrencyInfo(getCachedCurrencyInfo());
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function detect() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await detectCurrency();

        if (mounted && response.success) {
          setCurrencyInfo(response.data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to detect currency');
          // Set default USD on error
          setCurrencyInfo({
            currencyCode: 'USD',
            currencySymbol: '$',
            exchangeRate: 1,
            countryCode: 'US',
            countryName: 'United States',
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    detect();

    return () => {
      mounted = false;
    };
  }, [autoDetect]);

  /**
   * Refresh currency detection (force new API call)
   */
  const refreshCurrency = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await detectCurrency(true);
      if (response.success) {
        setCurrencyInfo(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh currency');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Convert a price from base currency to detected currency
   * Returns full conversion details
   */
  const convertPrice = useCallback(
    (amount) => {
      if (!currencyInfo) {
        return {
          originalAmount: amount,
          originalCurrency: baseCurrency,
          convertedAmount: amount,
          convertedCurrency: baseCurrency,
          currencySymbol: '$',
          formattedPrice: `$${amount.toFixed(2)}`,
        };
      }

      const convertedAmount = amount * currencyInfo.exchangeRate;
      const rounded = Math.round(convertedAmount * 100) / 100;

      return {
        originalAmount: amount,
        originalCurrency: baseCurrency,
        convertedAmount: rounded,
        convertedCurrency: currencyInfo.currencyCode,
        currencySymbol: currencyInfo.currencySymbol,
        formattedPrice: formatPrice(rounded, currencyInfo.currencySymbol, currencyInfo.currencyCode),
      };
    },
    [currencyInfo, baseCurrency]
  );

  /**
   * Quick format a price in local currency (returns string only)
   */
  const formatLocalPrice = useCallback(
    (amount) => {
      const converted = convertPrice(amount);
      return converted.formattedPrice;
    },
    [convertPrice]
  );

  /**
   * Convert multiple prices at once
   */
  const convertPrices = useCallback(
    (amounts) => {
      return amounts.map((amount) => convertPrice(amount));
    },
    [convertPrice]
  );

  /**
   * Clear cache and reset to USD
   */
  const resetCurrency = useCallback(() => {
    clearCurrencyCache();
    setCurrencyInfo(null);
    setIsLoading(false);
    setError(null);
  }, []);

  // Memoize the return object
  return useMemo(
    () => ({
      // State
      currencyInfo,
      isLoading,
      error,
      isDetected: !!currencyInfo,

      // Derived values for convenience
      currencyCode: currencyInfo?.currencyCode || 'USD',
      currencySymbol: currencyInfo?.currencySymbol || '$',
      exchangeRate: currencyInfo?.exchangeRate || 1,
      countryCode: currencyInfo?.countryCode || 'US',
      countryName: currencyInfo?.countryName || 'United States',
      isEU: currencyInfo?.isEU || false,

      // Functions
      convertPrice,
      convertPrices,
      formatLocalPrice,
      refreshCurrency,
      resetCurrency,
    }),
    [currencyInfo, isLoading, error, convertPrice, convertPrices, formatLocalPrice, refreshCurrency, resetCurrency]
  );
}

export default useCurrency;
