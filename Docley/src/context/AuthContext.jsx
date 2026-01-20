import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import apiClient from '../api/client';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [serverError, setServerError] = useState(false);

    // Refs for safety
    const lastFetchedId = useRef(null);

    const fetchProfile = useCallback(async (userId) => {
        if (!userId) {
            setLoading(false);
            return null;
        }

        if (lastFetchedId.current === userId && profile) {
            return profile;
        }

        try {
            setProfileLoading(true);
            setServerError(false);
            lastFetchedId.current = userId;

            // 1. Check Persistent Cache (localStorage for cold starts)
            const cached = localStorage.getItem(`profile_v2_${userId}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'is_premium')) {
                    setProfile(parsed);
                    // DO NOT stop loading here if it's the first fetch, 
                    // we want to refresh from backend silently.
                }
            }

            // 2. Fetch from Backend API
            const response = await apiClient.get('/users/profile');
            const data = response.data;

            if (data) {
                setProfile(data);
                localStorage.setItem(`profile_v2_${userId}`, JSON.stringify(data));
                return data;
            }
            return null;
        } catch (error) {
            console.error('[Auth] Profile error:', error);
            // Don't set error state for background refreshes to avoid UI flickering
            if (!profile) setServerError(true);
            return null;
        } finally {
            setProfileLoading(false);
            setLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!isMounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    fetchProfile(session.user.id);
                }

                setLoading(false);
            } catch (err) {
                console.error('[Auth] Initialization error:', err);
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                lastFetchedId.current = null;
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    // 2. Computed values using useMemo
    const isAdmin = useMemo(() => {
        return profile?.role === 'admin';
    }, [profile?.role]);

    const isPremium = useMemo(() => {
        return profile?.is_premium === true;
    }, [profile?.is_premium]);

    const isEmailVerified = useMemo(() => {
        return user?.email_confirmed_at != null;
    }, [user?.email_confirmed_at]);

    // 3. User Actions wrapped in useCallback
    const signUp = useCallback(async (email, password, fullName) => {
        const attemptSignup = async (isRetry = false) => {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) {
                    if ((error.status === 504 || error.message?.includes('504')) && !isRetry) {
                        console.warn('[Signup] Timeout detected, retrying once...');
                        return await attemptSignup(true);
                    }
                    throw error;
                }
                return data;
            } catch (err) {
                if ((err.status === 504 || err.message?.includes('504')) && !isRetry) {
                    console.warn('[Signup] Timeout detected in catch, retrying once...');
                    return await attemptSignup(true);
                }
                throw err;
            }
        };

        return await attemptSignup(false);
    }, []);

    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }, []);

    const resetPassword = useCallback(async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        return data;
    }, []);

    const updatePassword = useCallback(async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
        return data;
    }, []);

    const resendVerificationEmail = useCallback(async (email) => {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    }, []);

    const refreshProfile = useCallback(() => {
        return fetchProfile(user?.id);
    }, [fetchProfile, user?.id]);

    const value = useMemo(() => ({
        user,
        session,
        profile,
        loading,
        profileLoading,
        serverError,
        isInitializing: loading,
        isAuthenticated: !!user,
        isAdmin,
        isPremium,
        isEmailVerified,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
        refreshProfile
    }), [
        user,
        session,
        profile,
        loading,
        profileLoading,
        serverError,
        isAdmin,
        isPremium,
        isEmailVerified,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
        refreshProfile
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
