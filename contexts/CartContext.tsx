
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, deliveryAddress?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const item = window.localStorage.getItem('oumage-cart');
      // FIX: Ensure the parsed value from localStorage is an array before treating it as such.
      const parsed = item ? JSON.parse(item) : [];
      if (Array.isArray(parsed)) {
        return parsed as CartItem[];
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem('oumage-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (productId: string, deliveryAddress?: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
          deliveryAddress: deliveryAddress ?? existingItem.deliveryAddress,
        };
        if (deliveryAddress && existingItem.deliveryAddress && deliveryAddress !== existingItem.deliveryAddress) {
          toast('Delivery address for this item has been updated.', { icon: '🚚' });
        }
        return prevItems.map(item => (item.productId === productId ? updatedItem : item));
      }
      return [...prevItems, { productId, quantity: 1, deliveryAddress }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.productId !== productId);
      }
      return prevItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  };
  
  const clearCart = () => {
      setCartItems([]);
  }

  const value = { cartItems, addToCart, removeFromCart, updateQuantity, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};