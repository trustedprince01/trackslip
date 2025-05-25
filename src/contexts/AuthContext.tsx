import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Fetch user profile from the database, create if not exists
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // First try to get the user
      const { data: userData } = await supabase.auth.getUser();
      
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

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }
        return newProfile as UserProfile;
      }
      
      if (fetchError) throw fetchError;
      return profile as UserProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Update auth state and fetch profile when session changes
  useEffect(() => {
    // Get initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
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
        
        setLoading(false);
      }
    );

    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth state
    initAuth();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
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
      
      // Update the local state
      setSession(data.session);
      setUser(data.session.user);
      
      // Fetch and set the user profile
      try {
        const userProfile = await fetchUserProfile(data.session.user.id);
        setProfile(userProfile);
      } catch (profileError) {
        console.error('Error fetching user profile after sign in:', profileError);
        // Don't fail the sign in if profile fetch fails
      }
      
      return { error: null, session: data.session };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { 
        error: error instanceof Error ? error : new Error('Failed to sign in'), 
        session: null 
      };
    }
  };

  // Sign up with email and password and optional user metadata
  const signUp = async (email: string, password: string, userMetadata?: Record<string, any>) => {
    try {
      const fullName = userMetadata?.full_name || email.split('@')[0] || 'User';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userMetadata,
            full_name: fullName,
            email_verified: false
          }
        }
      });

      if (error) throw error;
      
      // The profile will be automatically created by the fetchUserProfile function
      // which is called in the auth state change listener
      
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
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as Error };
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
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
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
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
