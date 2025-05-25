import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Configure the storage key for better persistence
const STORAGE_KEY = 'trackslip-supabase';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: STORAGE_KEY,
    storage: {
      getItem: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      },
    },
  },
  global: {
    headers: {
      'x-app-version': '1.0.0',
    },
  },
});

// Add a function to check if we have an active session
export const hasActiveSession = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to handle errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw error;
};

// Types for our database schema
export type Tables = {
  receipts: {
    id: string;
    user_id: string;
    store_name: string;
    total_amount: number;
    date: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    created_at: string;
    updated_at: string;
  };
  // Add other tables as needed
};

export type Receipt = Tables['receipts'];

export type ReceiptInsert = Omit<Receipt, 'id' | 'created_at' | 'updated_at'>;
export type ReceiptUpdate = Partial<Omit<Receipt, 'id' | 'user_id' | 'created_at'>> & { id: string };
