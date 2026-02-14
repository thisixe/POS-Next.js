'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    nameEn: string;
    price: number;
    discountPrice?: number;
    image: string;
    quantity: number;
    stock: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items;
                const existingIndex = items.findIndex((i) => i.id === item.id);

                if (existingIndex > -1) {
                    const newItems = [...items];
                    const current = newItems[existingIndex];
                    if (current.quantity < item.stock) {
                        newItems[existingIndex] = {
                            ...current,
                            quantity: current.quantity + 1,
                        };
                        set({ items: newItems });
                    }
                } else {
                    set({ items: [...items, { ...item, quantity: 1 }] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                const items = get().items.map((item) => {
                    if (item.id === id && quantity <= item.stock) {
                        return { ...item, quantity };
                    }
                    return item;
                });

                set({ items });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            subtotal: () => {
                return get().items.reduce((sum, item) => {
                    const price = item.discountPrice || item.price;
                    return sum + price * item.quantity;
                }, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
