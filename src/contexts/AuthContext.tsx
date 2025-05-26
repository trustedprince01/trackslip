import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country_code: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    session: Session | null;
  }>;
  signUp: (email: string, password: string, userMetadata?: Record<string, any>) => Promise<{
    error: Error | null;
    user: User | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{
    error: Error | null;
    profile: UserProfile | null;
  }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fetch user profile from the database, create if not exists
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First try to get the user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        console.log('No user data found');
        return null;
      }
      
      // Try to get the profile
      let { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profile || fetchError?.code === 'PGRST116') {
        console.log('Creating new profile for user:', userId);
        const userMetadata = userData.user.user_metadata || {};
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{ 
            id: userId, 
            email: userData.user.email || '',
            full_name: userMetadata.full_name || userData.user.email?.split('@')[0] || 'User',
            phone: userMetadata.phone || null,
            country_code: userMetadata.country_code || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }
        console.log('Profile created successfully:', newProfile);
        return newProfile as UserProfile;
      }
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return null; // Don't throw, just return null
      }
      
      console.log('Profile fetched successfully:', profile);
      return profile as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Initialize auth state and set up listener
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    console.log('AuthProvider: Initializing...');
    
    // Set initial loading state
    setLoading(true);
    setInitialized(false);
    
    // Set up a timeout to prevent infinite loading
    const setLoadingTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.log('AuthProvider: Loading timeout reached, marking as initialized');
          setLoading(false);
          setInitialized(true);
        }
      }, 10000); // 10 second timeout
    };
    
    setLoadingTimeout();
    
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User session found, fetching profile...');
            // Don't wait indefinitely for profile
            const profilePromise = fetchUserProfile(session.user.id);
            const timeoutPromise = new Promise<UserProfile | null>((resolve) => {
              setTimeout(() => {
                console.log('Profile fetch timeout, continuing without profile');
                resolve(null);
              }, 5000); // 5 second timeout for profile fetch
            });
            
            const userProfile = await Promise.race([profilePromise, timeoutPromise]);
            
            if (isMounted) {
              setProfile(userProfile);
            }
          } else {
            console.log('No user session, clearing profile');
            setProfile(null);
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          // Don't let profile errors block initialization
        } finally {
          // Always mark as initialized after handling auth state
          if (isMounted) {
            console.log('Auth state change complete, marking as initialized');
            setLoading(false);
            setInitialized(true);
          }
        }
      }
    );
    
    // Initial session check with timeout
    const checkInitialSession = async () => {
      try {
        console.log('Checking initial session...');
        
        // Add a race condition with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: Session | null }, error: any }>((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 5000);
        });
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        console.log('Initial session check complete:', session?.user?.email || 'no session');
        
        // The auth state change listener will handle the session
        // But if there's no session, we should still initialize
        if (!session) {
          console.log('No initial session found, initializing without user');
          setLoading(false);
          setInitialized(true);
        }
        
      } catch (error) {
        console.error('Error in checkInitialSession:', error);
        // Don't block initialization on session check errors
        if (isMounted) {
          console.log('Session check failed, initializing anyway');
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    checkInitialSession();
    
    // Cleanup function
    return () => {
      console.log('AuthProvider: Cleaning up...');
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []); // Remove fetchUserProfile from dependencies to prevent recreation

  // Recreate fetchUserProfile with useCallback but don't include it in useEffect dependencies
  const memoizedFetchUserProfile = useCallback(fetchUserProfile, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      if (!data.session) {
        const error = new Error('No session returned after sign in');
        console.error(error);
        throw error;
      }
      
      // The auth state change listener will handle setting the session and profile
      console.log('Sign in successful for:', email);
      
      return { error: null, session: data.session };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign in'), 
        session: null 
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password and optional user metadata
  const signUp = async (email: string, password: string, userMetadata: Record<string, any> = {}) => {
    try {
      setLoading(true);
      
      // Extract and validate required fields
      const fullName = userMetadata?.full_name || email.split('@')[0] || 'User';
      const phone = userMetadata?.phone || '';
      const countryCode = userMetadata?.country_code || '';
      
      // Validate required fields
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (phone && !countryCode) {
        console.warn('Phone number provided without country code');
      }
      
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userMetadata,
            full_name: fullName,
            email_verified: false,
            // Store phone and country code in user_metadata
            phone: phone || null,
            country_code: countryCode || null
          },
          // Add email confirmation if needed
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      // The auth state change listener will handle profile creation
      console.log('Sign up successful for:', email);
      
      return { 
        error: null, 
        user: data.user 
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign up'), 
        user: null 
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      // Save the current currency preference before clearing storage
      const savedCurrency = localStorage.getItem('selectedCurrency');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore the currency preference
      if (savedCurrency) {
        localStorage.setItem('selectedCurrency', savedCurrency);
      }
      
      // Clear all indexedDB databases except for the ones we want to keep
      if (window.indexedDB) {
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => {
          if (db.name && !db.name.includes('currency')) { // Skip currency-related DBs
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }
      
      // Clear cookies except for the ones we want to keep
      document.cookie.split(';').forEach(c => {
        const cookieName = c.trim().split('=')[0];
        if (!cookieName.toLowerCase().includes('currency')) { // Skip currency-related cookies
          document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
        }
      });
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Force a hard redirect to the login page to clear any cached data
      window.location.href = '/login';
      
      console.log('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error instanceof Error ? error : new Error('Failed to sign out') };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error as Error };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in'), profile: null };
    
    try {
      setLoading(true);
      
      // Prepare the update data
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If phone is being updated, ensure it's properly formatted
      if (updates.phone) {
        // Remove any non-digit characters
        updateData.phone = updates.phone.replace(/\D/g, '');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Also update the user metadata in auth if needed
      if (updates.phone || updates.country_code) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            phone: updates.phone || null,
            country_code: updates.country_code || null
          }
        });
        
        if (metadataError) {
          console.error('Error updating user metadata:', metadataError);
          // Don't fail the whole update for metadata errors
        }
      }
      
      setProfile(data);
      return { error: null, profile: data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to update profile'), 
        profile: null 
      };
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await memoizedFetchUserProfile(user.id);
    setProfile(userProfile);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {initialized ? children : (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Initializing your session...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">This should only take a moment</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;