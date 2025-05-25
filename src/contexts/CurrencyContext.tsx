import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { UserProfile } from './AuthContext';
import { supabase } from '@/lib/supabase';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateProfile } = useAuth();
  const [currency, setCurrencyState] = useState<string>('₦');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency from profile and localStorage
  const loadCurrency = useCallback(async () => {
    if (!user) {
      // If no user, use localStorage
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency && savedCurrency !== currency) {
        setCurrencyState(savedCurrency);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user's currency from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('currency')
        .eq('id', user.id)
        .single();
        
      if (!error && userData?.currency) {
        setCurrencyState(userData.currency);
        localStorage.setItem('selectedCurrency', userData.currency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currency]);

  // Load currency when component mounts and when user changes
  useEffect(() => {
    // Load from localStorage first for immediate feedback
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && savedCurrency !== currency) {
      setCurrencyState(savedCurrency);
    }
    
    // Then try to load from database if user is logged in
    if (user) {
      loadCurrency();
    }
  }, [user?.id]); // Only re-run when user ID changes

  // Update currency in both state, localStorage, and database
  const setCurrency = useCallback(async (newCurrency: string) => {
    try {
      // Update local state immediately for better UX
      setCurrencyState(newCurrency);
      localStorage.setItem('selectedCurrency', newCurrency);
      
      // Update in database via the auth context's updateProfile
      if (user && updateProfile) {
        const updates: Partial<UserProfile> = { currency: newCurrency };
        const { error } = await updateProfile(updates);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      // Revert if there's an error
      const savedCurrency = localStorage.getItem('selectedCurrency') || '₦';
      setCurrencyState(savedCurrency);
      throw error;
    }
  }, [user, updateProfile, setCurrencyState]);

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
