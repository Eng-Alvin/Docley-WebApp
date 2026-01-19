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
    const fetchTimeoutRef = useRef(null);

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
                    // Start profile fetch but don't AWAIT it if we want non-blocking
                    // However, for the very first load, we might want to wait a bit 
                    // or just rely on the cache.
                    fetchProfile(session.user.id);
                }

                // CRITICAL: Immediate shell render
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
        // High-confidence role from DB table takes precedence
        return profile?.role === 'admin';
    }, [profile]);

    const isPremium = useMemo(() => {
        return profile?.is_premium === true;
    }, [profile]);

    const isEmailVerified = useMemo(() => {
        return user?.email_confirmed_at != null;
    }, [user]);

    // Sign up with email and password
    const signUp = async (email, password, fullName) => {
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
                    // Check for Supabase 504 / Gateway Timeout
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
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // We no longer block sign-in for unverified users. 
        // Verification status is handled via banners and action restrictions.
        return data;
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Reset password (send reset email)
    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        return data;
    };

    // Update password (after clicking reset link)
    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
        return data;
    };

    // Resend verification email
    const resendVerificationEmail = async (email) => {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    };

    const value = {
        user,
        session,
        profile,
        loading,
        profileLoading,
        serverError,
        isInitializing: loading, // Backwards compatibility for components using this
        isAuthenticated: !!user,
        isAdmin,
        isPremium,
        isEmailVerified,
        signUp: async (email, password, fullName) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            return data;
        },
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        },
        signInWithGoogle: async () => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            return data;
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        resetPassword: async (email) => {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return data;
        },
        updatePassword: async (newPassword) => {
            const { data, error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return data;
        },
        resendVerificationEmail: async (email) => {
            const { data, error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            return data;
        },
        refreshProfile: () => fetchProfile(user?.id)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
