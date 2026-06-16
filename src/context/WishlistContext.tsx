import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { mapApiProductToFrontend } from '../utils/api';
import { Product } from '../data/mockData';

interface WishlistContextType {
  wishlistIds: number[];
  wishlistItems: Product[];
  isLoading: boolean;
  addToWishlist: (productId: number | string) => Promise<boolean>;
  removeFromWishlist: (productId: number | string) => Promise<boolean>;
  toggleWishlist: (productId: number | string) => Promise<boolean>;
  isWishlisted: (productId: number | string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = async () => {
    if (!isAuthenticated || !user?.token) {
      setWishlistIds([]);
      setWishlistItems([]);
      return;
    }
    setIsLoading(true);
    try {
      // 1. Fetch wishlist items
      const itemsRes = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (itemsRes.ok) {
        const json = await itemsRes.json();
        if ((json.success || json.succeeded) && Array.isArray(json.data)) {
          setWishlistItems(json.data.map(mapApiProductToFrontend));
        }
      }

      // 2. Fetch wishlist IDs
      const idsRes = await fetch('/api/wishlist/ids', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (idsRes.ok) {
        const json = await idsRes.json();
        if ((json.success || json.succeeded) && Array.isArray(json.data)) {
          setWishlistIds(json.data.map(Number));
        }
      }
    } catch (err) {
      console.error('Error refreshing wishlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated, user?.token]);

  const addToWishlist = async (productId: number | string): Promise<boolean> => {
    if (!isAuthenticated || !user?.token) return false;
    const prodId = Number(productId);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: prodId })
      });
      if (res.ok) {
        await refreshWishlist();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return false;
    }
  };

  const removeFromWishlist = async (productId: number | string): Promise<boolean> => {
    if (!isAuthenticated || !user?.token) return false;
    const prodId = Number(productId);
    try {
      const res = await fetch(`/api/wishlist/${prodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        // Optimistic local state update for visual responsiveness
        setWishlistIds(prev => prev.filter(id => id !== prodId));
        setWishlistItems(prev => prev.filter(item => Number(item.id) !== prodId));
        
        // Refresh silently
        refreshWishlist();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return false;
    }
  };

  const toggleWishlist = async (productId: number | string): Promise<boolean> => {
    const prodId = Number(productId);
    if (isWishlisted(prodId)) {
      return await removeFromWishlist(prodId);
    } else {
      return await addToWishlist(prodId);
    }
  };

  const isWishlisted = (productId: number | string): boolean => {
    const prodId = Number(productId);
    return wishlistIds.includes(prodId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      wishlistItems,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
