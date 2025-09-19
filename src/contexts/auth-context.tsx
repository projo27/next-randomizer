
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithRedirect, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { getRedirectResult } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    setUser(result.user);
                }
            })
            .catch((error) => {
                console.error("Error getting redirect result: ", error);
            })
            .finally(() => {
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const value = { user, loading, signInWithGoogle, signOut };

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
