import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
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
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!userData.user) return null;
      
      // Try to get the profile
      let { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!profile || fetchError?.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{ 
            id: userId, 
            email: userData.user.email || '',
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as UserProfile;
      }
      
      if (fetchError) throw fetchError;
      return profile as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('Auth state changed:', event);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      try {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    } else {
      setProfile(null);
    }
    
    setInitialized(true);
    setLoading(false);
  }, [fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | undefined;
    
    const initAuth = async () => {
      console.log('Initializing auth...');
      try {
        if (!isMounted) return;
        
        setLoading(true);
        
        // First, check for an existing session
        const { data: { session: existingSession }, error: sessionError } = 
          await supabase.auth.getSession();
        
        console.log('Session check complete', { existingSession, error: sessionError });
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }
        
        if (existingSession) {
          console.log('Found existing session, fetching profile...');
          await handleAuthStateChange('INITIAL_SESSION', existingSession);
        } else {
          console.log('No existing session found');
          // No session found, ensure we're signed out
          if (isMounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          console.log('Auth initialization complete, setting initialized to true');
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      console.log('Auth state changed:', event, session);
      handleAuthStateChange(event, session);
    });
    
    subscription = data.subscription;

    // Initialize auth state
    initAuth();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up auth listener');
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [handleAuthStateChange]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null, session: data.session };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error, session: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up with email and password and optional user metadata
  const signUp = useCallback(async (email: string, password: string, userMetadata?: Record<string, any>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) throw error;
      return { error: null, user: data.user };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error, user: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in'), profile: null };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return { error: null, profile: data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error, profile: null };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserProfile]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
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

// Named export for the context itself
export { AuthContext };

// Default export for backward compatibility
const AuthContextExport = AuthContext;
export default AuthContextExport;
