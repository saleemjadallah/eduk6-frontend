/**
 * Currency conversion service using currencylayer API
 * Base currency: AED (UAE Dirham)
 * Supported currencies: USD, SAR, QAR, BHD
 */

const CURRENCYLAYER_API_KEY = 'c81232280594909055961c21d918c236';
const CURRENCYLAYER_BASE_URL = 'http://api.currencylayer.com';
const CACHE_KEY = 'currency_rates';
const CACHE_TIMESTAMP_KEY = 'currency_rates_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type Currency = 'AED' | 'USD' | 'SAR' | 'QAR' | 'BHD';

export interface CurrencyRates {
  [key: string]: number;
}

export interface CachedRates {
  rates: CurrencyRates;
  timestamp: number;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AED: 'AED',
  USD: '$',
  SAR: 'SAR',
  QAR: 'QAR',
  BHD: 'BHD',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  AED: 'UAE Dirham',
  USD: 'US Dollar',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  BHD: 'Bahraini Dinar',
};

/**
 * Fetch live exchange rates from currencylayer API
 * Note: Free plan uses USD as base currency, so we need to convert AED -> USD -> Target
 */
async function fetchLiveRates(): Promise<CurrencyRates> {
  try {
    const response = await fetch(
      `${CURRENCYLAYER_BASE_URL}/live?access_key=${CURRENCYLAYER_API_KEY}&currencies=AED,USD,SAR,QAR,BHD&format=1`
    );

    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.info || 'Failed to fetch currency rates');
    }

    // currencylayer returns rates with USD as base (e.g., USDAED, USDSAR)
    // We need to convert these to AED as base
    const usdToAed = data.quotes.USDAED;

    // Convert all rates to use AED as base
    const aedBasedRates: CurrencyRates = {
      AED: 1, // Base currency
      USD: 1 / usdToAed, // AED to USD
      SAR: data.quotes.USDSAR / usdToAed, // AED to SAR
      QAR: data.quotes.USDQAR / usdToAed, // AED to QAR
      BHD: data.quotes.USDBHD / usdToAed, // AED to BHD
    };

    return aedBasedRates;
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    // Return fallback rates if API fails
    return getFallbackRates();
  }
}

/**
 * Fallback rates in case API fails (approximate rates as of 2025)
 */
function getFallbackRates(): CurrencyRates {
  return {
    AED: 1,
    USD: 0.27, // 1 AED ≈ 0.27 USD
    SAR: 1.02, // 1 AED ≈ 1.02 SAR
    QAR: 0.99, // 1 AED ≈ 0.99 QAR
    BHD: 0.10, // 1 AED ≈ 0.10 BHD
  };
}

/**
 * Get cached rates from localStorage if still valid
 */
function getCachedRates(): CurrencyRates | null {
  try {
    const cachedRatesStr = localStorage.getItem(CACHE_KEY);
    const cachedTimestampStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cachedRatesStr || !cachedTimestampStr) {
      return null;
    }

    const timestamp = parseInt(cachedTimestampStr, 10);
    const now = Date.now();

    // Check if cache is still valid (less than 24 hours old)
    if (now - timestamp > CACHE_DURATION) {
      return null;
    }

    return JSON.parse(cachedRatesStr);
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
}

/**
 * Save rates to localStorage cache
 */
function cacheRates(rates: CurrencyRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching rates:', error);
  }
}

/**
 * Get current exchange rates (from cache or API)
 */
export async function getCurrencyRates(): Promise<CurrencyRates> {
  // Try to get from cache first
  const cachedRates = getCachedRates();
  if (cachedRates) {
    return cachedRates;
  }

  // Fetch fresh rates from API
  const rates = await fetchLiveRates();
  cacheRates(rates);
  return rates;
}

/**
 * Convert an amount from AED to target currency
 */
export function convertCurrency(
  amount: number,
  targetCurrency: Currency,
  rates: CurrencyRates
): number {
  if (targetCurrency === 'AED') {
    return amount;
  }

  const rate = rates[targetCurrency];
  if (!rate) {
    console.warn(`No rate found for ${targetCurrency}, returning original amount`);
    return amount;
  }

  return amount * rate;
}

/**
 * Format currency with proper symbol and decimal places
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  showSymbol: boolean = true
): string {
  // Bahraini Dinar uses 3 decimal places, others use 2
  const decimals = currency === 'BHD' ? 3 : 2;
  const formattedAmount = amount.toFixed(decimals);

  if (!showSymbol) {
    return formattedAmount;
  }

  const symbol = CURRENCY_SYMBOLS[currency];

  // For USD, put symbol before amount
  if (currency === 'USD') {
    return `${symbol}${formattedAmount}`;
  }

  // For others, put symbol after amount
  return `${symbol} ${formattedAmount}`;
}

/**
 * Get user's preferred currency from localStorage
 */
export function getPreferredCurrency(): Currency {
  try {
    const stored = localStorage.getItem('preferred_currency');
    if (stored && ['AED', 'USD', 'SAR', 'QAR', 'BHD'].includes(stored)) {
      return stored as Currency;
    }
  } catch (error) {
    console.error('Error reading preferred currency:', error);
  }
  return 'AED'; // Default to AED
}

/**
 * Set user's preferred currency in localStorage
 */
export function setPreferredCurrency(currency: Currency): void {
  try {
    localStorage.setItem('preferred_currency', currency);
  } catch (error) {
    console.error('Error saving preferred currency:', error);
  }
}
