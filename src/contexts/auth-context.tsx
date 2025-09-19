"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { auth, provider, signInWithRedirect, signOut } from '@/lib/firebase-auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                setLoading(false);
            } else {
                // Check if there is a redirect result
                try {
                    const result = await getRedirectResult(auth);
                    if (result) {
                        setUser(result.user);
                    }
                } catch (error) {
                    console.error("Error getting redirect result: ", error);
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };

    const value = { user, loading, signInWithGoogle, signOut: () => signOut(auth) };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </Auth-Context.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
