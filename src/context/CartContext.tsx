import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data/mockData';

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  isDeleted?: boolean;
  stock?: number;
  customization?: {
    text?: string;
    imageUrl?: string;
  } | null;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  restoreCart: (items: CartItem[]) => void;
  cartTotal: number;
  cartCount: number;
  promoCode: string | null;
  discount: number;
  applyPromoCode: (code: string) => boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('ycc_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        localStorage.removeItem('ycc_cart');
      }
    }
    return [];
  });
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('ycc_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode(null);
    setDiscount(0);
  };

  const restoreCart = (items: CartItem[]) => {
    setCart(items);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const applyPromoCode = (code: string) => {
    const upperCode = code.toUpperCase();
    if (upperCode === 'GIFT20') {
      setPromoCode('GIFT20');
      setDiscount(Math.round(cartTotal * 0.2));
      return true;
    } else if (upperCode === 'GIFT25') {
      setPromoCode('GIFT25');
      setDiscount(Math.round(cartTotal * 0.25));
      return true;
    }
    return false;
  };

  // Recalculate discount if cartTotal changes
  useEffect(() => {
    if (promoCode === 'GIFT20') {
      setDiscount(Math.round(cartTotal * 0.2));
    } else if (promoCode === 'GIFT25') {
      setDiscount(Math.round(cartTotal * 0.25));
    }
  }, [cartTotal, promoCode]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      restoreCart,
      cartTotal, 
      cartCount, 
      promoCode, 
      discount, 
      applyPromoCode,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
