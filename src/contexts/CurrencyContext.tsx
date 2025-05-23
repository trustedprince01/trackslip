import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<string>('₦');

  // Load saved currency from localStorage on initial render
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const formatCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: getCurrencyCode(currency),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    // Replace the default currency symbol with the selected one
    return formatter.format(amount).replace(/^\D+/, currency);
  };

  // Helper function to get currency code based on symbol
  const getCurrencyCode = (symbol: string): string => {
    switch (symbol) {
      case '₦': return 'NGN';
      case '$': return 'USD';
      case '€': return 'EUR';
      case '£': return 'GBP';
      default: return 'NGN';
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
