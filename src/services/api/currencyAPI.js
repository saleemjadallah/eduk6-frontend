/**
 * Currency API Service
 *
 * Frontend service for location-based currency detection and conversion.
 * Uses GeoPlugin for automatic currency detection based on visitor IP.
 *
 * Detection flow:
 * 1. First try: Direct GeoPlugin call (most reliable for client IP)
 * 2. Fallback: Backend API if direct call fails
 *
 * Features:
 * - Auto-detect visitor's currency from IP
 * - Convert prices from USD to local currency
 * - Batch conversion for multiple prices
 * - Caching to reduce API calls
 */

import { publicRequest } from './apiClient.js';

// Local cache for currency info (persists during session)
let cachedCurrencyInfo = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Direct GeoPlugin API call (client-side)
 * This gets the actual client IP since it's called from the browser
 */
async function detectCurrencyDirect() {
  try {
    // Free tier doesn't need a key - just use the base URL
    const response = await fetch('https://ssl.geoplugin.net/json.gp', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('GeoPlugin API error');
    }

    const data = await response.json();

    // Check for valid response
    if (data.geoplugin_status !== 200 && data.geoplugin_status !== 206) {
      throw new Error('GeoPlugin returned non-success status');
    }

    // Parse response into our format
    return {
      currencyCode: data.geoplugin_currencyCode || 'USD',
      currencySymbol: data.geoplugin_currencySymbol_UTF8 || data.geoplugin_currencySymbol || '$',
      exchangeRate: parseFloat(data.geoplugin_currencyConverter) || 1,
      countryCode: data.geoplugin_countryCode || 'US',
      countryName: data.geoplugin_countryName || 'United States',
      city: data.geoplugin_city || '',
      region: data.geoplugin_regionName || data.geoplugin_region || '',
      timezone: data.geoplugin_timezone || 'UTC',
      isEU: data.geoplugin_inEU === 1,
      euVATrate: data.geoplugin_euVATrate ? parseFloat(data.geoplugin_euVATrate) : null,
    };
  } catch (error) {
    console.warn('Direct GeoPlugin call failed:', error.message);
    return null;
  }
}

/**
 * Check if cached currency info is still valid
 */
function isCacheValid() {
  if (!cachedCurrencyInfo || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION_MS;
}

/**
 * Cache the detected currency info
 */
function cacheResult(data) {
  cachedCurrencyInfo = data;
  cacheTimestamp = Date.now();

  // Also store in sessionStorage for persistence across page navigations
  try {
    sessionStorage.setItem('currencyInfo', JSON.stringify(data));
    sessionStorage.setItem('currencyTimestamp', String(Date.now()));
  } catch (e) {
    // sessionStorage might be unavailable (incognito mode, etc.)
  }
}

/**
 * Detect visitor's currency based on their IP address
 * Results are cached for 30 minutes to reduce API calls
 *
 * Detection flow:
 * 1. Check cache first
 * 2. Try direct GeoPlugin call (most reliable for client IP)
 * 3. Fall back to backend API if direct call fails
 *
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Object>} Currency info including code, symbol, exchange rate
 */
export async function detectCurrency(forceRefresh = false) {
  // Return cached data if valid
  if (!forceRefresh && isCacheValid()) {
    return { success: true, data: cachedCurrencyInfo };
  }

  // Try to load from sessionStorage first
  if (!forceRefresh) {
    try {
      const stored = sessionStorage.getItem('currencyInfo');
      const storedTimestamp = sessionStorage.getItem('currencyTimestamp');
      if (stored && storedTimestamp) {
        const age = Date.now() - parseInt(storedTimestamp, 10);
        if (age < CACHE_DURATION_MS) {
          const info = JSON.parse(stored);
          cachedCurrencyInfo = info;
          cacheTimestamp = parseInt(storedTimestamp, 10);
          return { success: true, data: info, fromCache: true };
        }
      }
    } catch (e) {
      // Ignore sessionStorage errors
    }
  }

  // Method 1: Try direct GeoPlugin call (most reliable for client IP)
  try {
    const directResult = await detectCurrencyDirect();
    if (directResult && directResult.currencyCode) {
      cacheResult(directResult);
      return { success: true, data: directResult, method: 'direct' };
    }
  } catch (error) {
    console.warn('Direct GeoPlugin detection failed, trying backend:', error.message);
  }

  // Method 2: Fall back to backend API
  try {
    const response = await publicRequest('/currency/detect', { method: 'GET' });

    if (response.success) {
      cacheResult(response.data);
      return { ...response, method: 'backend' };
    }
  } catch (error) {
    console.error('Backend currency detection also failed:', error);
  }

  // Return default USD if all methods fail
  return {
    success: true,
    data: {
      currencyCode: 'USD',
      currencySymbol: '$',
      exchangeRate: 1,
      countryCode: 'US',
      countryName: 'United States',
      city: '',
      region: '',
      timezone: 'America/New_York',
      isEU: false,
      euVATrate: null,
    },
    fallback: true,
  };
}

/**
 * Convert a single price to the visitor's local currency
 *
 * @param {number} amount - Price amount in USD
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @returns {Promise<Object>} Converted price info
 */
export async function convertPrice(amount, baseCurrency = 'USD') {
  try {
    const response = await publicRequest('/currency/convert', {
      method: 'POST',
      body: JSON.stringify({ amount, baseCurrency }),
    });
    return response;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    throw error;
  }
}

/**
 * Convert multiple prices at once
 *
 * @param {number[]} amounts - Array of prices in USD
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @returns {Promise<Object>} Array of converted prices
 */
export async function convertPricesBatch(amounts, baseCurrency = 'USD') {
  try {
    const response = await publicRequest('/currency/convert-batch', {
      method: 'POST',
      body: JSON.stringify({ amounts, baseCurrency }),
    });
    return response;
  } catch (error) {
    console.error('Batch currency conversion failed:', error);
    throw error;
  }
}

/**
 * Get list of supported currencies
 * Useful for manual currency selection dropdowns
 *
 * @returns {Promise<Object>} List of supported currencies
 */
export async function getSupportedCurrencies() {
  try {
    const response = await publicRequest('/currency/supported', { method: 'GET' });
    return response;
  } catch (error) {
    console.error('Failed to get supported currencies:', error);
    throw error;
  }
}

/**
 * Get currency info for a specific country code
 * Useful when user manually selects their country
 *
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
 * @returns {Promise<Object>} Currency info for the country
 */
export async function getCurrencyByCountry(countryCode) {
  try {
    const response = await publicRequest(`/currency/by-country/${countryCode}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Failed to get currency for country:', error);
    throw error;
  }
}

/**
 * Client-side price conversion using cached currency info
 * Use this for immediate conversions without API calls
 *
 * @param {number} amountUSD - Price in USD
 * @returns {Object|null} Converted price or null if no currency info cached
 */
export function convertPriceLocal(amountUSD) {
  if (!cachedCurrencyInfo) {
    // Try to load from sessionStorage
    try {
      const stored = sessionStorage.getItem('currencyInfo');
      if (stored) {
        cachedCurrencyInfo = JSON.parse(stored);
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!cachedCurrencyInfo) return null;

  const convertedAmount = amountUSD * cachedCurrencyInfo.exchangeRate;
  const rounded = Math.round(convertedAmount * 100) / 100;

  return {
    originalAmount: amountUSD,
    originalCurrency: 'USD',
    convertedAmount: rounded,
    convertedCurrency: cachedCurrencyInfo.currencyCode,
    currencySymbol: cachedCurrencyInfo.currencySymbol,
    formattedPrice: formatPrice(rounded, cachedCurrencyInfo.currencySymbol, cachedCurrencyInfo.currencyCode),
  };
}

/**
 * Format a price with the appropriate currency symbol
 *
 * @param {number} amount - Price amount
 * @param {string} symbol - Currency symbol
 * @param {string} code - Currency code
 * @returns {string} Formatted price string
 */
export function formatPrice(amount, symbol, code) {
  const rounded = Math.round(amount * 100) / 100;
  const symbolBefore = ['$', '£', '€', '¥', '₹', 'R$', 'kr', 'zł'].includes(symbol);

  if (symbolBefore) {
    return `${symbol}${rounded.toFixed(2)}`;
  } else {
    return `${rounded.toFixed(2)} ${code}`;
  }
}

/**
 * Get the currently cached currency info
 * Returns null if not yet detected
 *
 * @returns {Object|null} Cached currency info
 */
export function getCachedCurrencyInfo() {
  if (cachedCurrencyInfo) return cachedCurrencyInfo;

  // Try to load from sessionStorage
  try {
    const stored = sessionStorage.getItem('currencyInfo');
    if (stored) {
      cachedCurrencyInfo = JSON.parse(stored);
      return cachedCurrencyInfo;
    }
  } catch (e) {
    // Ignore
  }

  return null;
}

/**
 * Clear the currency cache
 * Call this if user manually changes their location/currency preference
 */
export function clearCurrencyCache() {
  cachedCurrencyInfo = null;
  cacheTimestamp = null;
  try {
    sessionStorage.removeItem('currencyInfo');
    sessionStorage.removeItem('currencyTimestamp');
  } catch (e) {
    // Ignore
  }
}

// Export all functions
export const currencyAPI = {
  detectCurrency,
  convertPrice,
  convertPricesBatch,
  getSupportedCurrencies,
  getCurrencyByCountry,
  convertPriceLocal,
  formatPrice,
  getCachedCurrencyInfo,
  clearCurrencyCache,
};

export default currencyAPI;
