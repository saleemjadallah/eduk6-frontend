import { motion } from 'framer-motion';
import { DollarSign, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency, CURRENCY_NAMES, CURRENCY_SYMBOLS } from '@/lib/currency';

const CURRENCIES: Currency[] = ['AED', 'USD', 'SAR', 'QAR', 'BHD'];

export function CurrencySelector() {
  const { currency, setCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="px-3 py-2 rounded-lg bg-cream-200">
        <div className="w-16 h-4 bg-cream-300 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Currency Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-200 hover:bg-cream-300 transition-colors cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Select currency"
      >
        <DollarSign className="w-4 h-4 text-charcoal" />
        <span className="text-sm font-medium text-charcoal">{currency}</span>
        <ChevronDown
          className={`w-4 h-4 text-charcoal transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-charcoal/10 py-2 z-50"
        >
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              onClick={() => handleCurrencyChange(curr)}
              className={`w-full px-4 py-2.5 text-left hover:bg-cream-100 transition-colors flex items-center justify-between group ${
                currency === curr ? 'bg-saffron-50' : ''
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`font-medium ${
                    currency === curr ? 'text-saffron-700' : 'text-charcoal'
                  }`}
                >
                  {curr}
                </span>
                <span className="text-xs text-gray-500">{CURRENCY_NAMES[curr]}</span>
              </div>
              <span
                className={`text-sm ${
                  currency === curr ? 'text-saffron-600' : 'text-gray-400'
                }`}
              >
                {CURRENCY_SYMBOLS[curr]}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
