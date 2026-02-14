'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './cart';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
}

interface AuthStore {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: (token, user) => {
                localStorage.setItem('token', token);
                // Clear cart when a user logs in to avoid mixing anonymous cart with user cart
                try {
                    useCartStore.getState().clearCart();
                } catch (e) {
                    // ignore if cart store is not available
                }
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                // Clear cart on logout to avoid leftover items
                try {
                    useCartStore.getState().clearCart();
                } catch (e) {
                    // ignore
                }
                set({ token: null, user: null, isAuthenticated: false });
            },

            isAdmin: () => {
                return get().user?.role === 'admin';
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
