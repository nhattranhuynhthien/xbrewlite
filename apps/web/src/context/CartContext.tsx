'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItemTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // generated unique key: productId + sizeCode + toppings sorted
  productId: string;
  name: string;
  imageUrl?: string;
  sizeCode: string;
  sizeName: string;
  toppings: CartItemTopping[];
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void;
  updateQuantity: (itemId: string, newQty: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate cart from localStorage on mount (TV5: S2-18)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('brewlite_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Lỗi khi đọc giỏ hàng từ localStorage:', e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage on cart change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('brewlite_cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const generateCartItemId = (
    productId: string,
    sizeCode: string,
    toppings: CartItemTopping[],
  ) => {
    const toppingKey = toppings
      .map((t) => t.id)
      .sort()
      .join('-');
    return `${productId}_${sizeCode}_${toppingKey}`;
  };

  const addItem = (newItem: Omit<CartItem, 'id' | 'subtotal'>) => {
    const id = generateCartItemId(newItem.productId, newItem.sizeCode, newItem.toppings);
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const updatedQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: updatedQty,
          subtotal: existing.unitPrice * updatedQty,
        };
        return updated;
      } else {
        const itemWithId: CartItem = {
          ...newItem,
          id,
          subtotal: newItem.unitPrice * newItem.quantity,
        };
        return [...prev, itemWithId];
      }
    });
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              subtotal: item.unitPrice * newQty,
            }
          : item,
      ),
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brewlite_cart');
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalAmount,
        totalCount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
