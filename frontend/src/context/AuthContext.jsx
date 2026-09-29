import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseAvailable } from '../services/supabase';
import { AuthService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile details from backend
  const fetchProfile = async (token) => {
    try {
      if (token) {
        localStorage.setItem('teentrack_token', token);
      }
      const response = await AuthService.getProfile();
      if (response?.data) {
        setProfile(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch profile from API, using cached data:', err.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isLiveSupabaseAvailable() && supabase) {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (initialSession && mounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.access_token);
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
              if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user || null);
                if (currentSession?.access_token) {
                  await fetchProfile(currentSession.access_token);
                } else {
                  setProfile(null);
                  localStorage.removeItem('teentrack_token');
                }
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Check for existing demo session in localStorage
          const savedToken = localStorage.getItem('teentrack_token');
          const savedUser = localStorage.getItem('teentrack_demo_user');
          if (savedToken && savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            await fetchProfile(savedToken);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    if (isLiveSupabaseAvailable() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.session.access_token);
      return data;
    } else {
      // Mock login for instant evaluation
      const mockUser = {
        id: '00000000-0000-4000-a000-000000000001',
        email,
        user_metadata: { full_name: 'Alex Rivera', username: 'alex_teen' },
      };
      const token = 'demo-token';
      localStorage.setItem('teentrack_token', token);
      localStorage.setItem('teentrack_demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await fetchProfile(token);
      return { user: mockUser };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    if (isLiveSupabaseAvailable() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name || 'Teen Explorer',
            username: metadata.username || email.split('@')[0],
            age_group: metadata.age_group || '16-17',
            currency: metadata.currency || 'INR',
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfile(data.session.access_token);
      }
      return data;
    } else {
      const mockUser = {
        id: '00000000-0000-4000-a000-000000000001',
        email,
        user_metadata: metadata,
      };
      const token = 'demo-token';
      localStorage.setItem('teentrack_token', token);
      localStorage.setItem('teentrack_demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      await fetchProfile(token);
      return { user: mockUser };
    }
  };

  const logout = async () => {
    try {
      if (isLiveSupabaseAvailable() && supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      localStorage.removeItem('teentrack_token');
      localStorage.removeItem('teentrack_demo_user');
    }
  };

  const resetPassword = async (email) => {
    if (isLiveSupabaseAvailable() && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      return data;
    }
    return { success: true };
  };

  const fastDemoLogin = async () => {
    const demoUser = {
      id: '00000000-0000-4000-a000-000000000001',
      email: 'alex.rivera@teentrack.dev',
      user_metadata: {
        full_name: 'Alex Rivera',
        username: 'alex_teen',
        age_group: '16-17',
        currency: 'INR',
      },
    };
    const token = 'demo-token';
    localStorage.setItem('teentrack_token', token);
    localStorage.setItem('teentrack_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    await fetchProfile(token);
  };

  const updateUserProfile = async (updatedData) => {
    const response = await AuthService.updateProfile(updatedData);
    if (response?.data) {
      setProfile(response.data);
    }
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: Boolean(user),
        currency: profile?.currency || 'INR',
        login,
        signUp,
        logout,
        resetPassword,
        fastDemoLogin,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
