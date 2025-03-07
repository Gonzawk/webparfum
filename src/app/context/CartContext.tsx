'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Perfume } from '@/app/types/Product';

export interface CartItem {
  product: Perfume;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Perfume, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Perfume, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.product.perfumeId === product.perfumeId);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.perfumeId === product.perfumeId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.product.perfumeId !== productId));
  };

  const clearCart = () => setCart([]);

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map(item =>
        item.product.perfumeId === productId ? { ...item, quantity } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateCartItemQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
