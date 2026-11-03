'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextData {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    decreaseQuantity: (productId: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean; // Novo estado global
    setIsCartOpen: (isOpen: boolean) => void; // Nova função global
}

const CartContext = createContext<CartContextData>({} as CartContextData);
const STORAGE_KEY = '@ByteFome:cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false); // Estado do modal global

    useEffect(() => {
        try {
            const storedCart = sessionStorage.getItem(STORAGE_KEY);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error('Erro ao carregar o carrinho do sessionStorage:', error);
        } finally {
            setIsInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (isInitialized) {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            } catch (error) {
                console.error('Erro ao salvar o carrinho no sessionStorage:', error);
            }
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
            if (existingIndex > -1) {
                return prevCart.map((item, index) => {
                    if (index === existingIndex) {
                        return { ...item, quantity: item.quantity + 1 };
                    }
                    return item;
                });
            }
            return [...prevCart, { product, quantity: 1 }];
        });
        setIsCartOpen(true); // Sempre que adiciona um produto, abre o modal automaticamente de forma global!
    };

    const decreaseQuantity = (productId: number) => {
        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item.product.id === productId) {
                    return { ...item, quantity: item.quantity - 1 };
                }
                return item;
            }).filter((item) => item.quantity > 0);
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, decreaseQuantity, removeFromCart, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
}