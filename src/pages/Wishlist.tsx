import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, Trash2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Wishlist() {
  const { addToCart } = useCart();
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);

  // local toast notification
  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false
  });

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Redirect if not logged in to guarantee database security
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=wishlist');
    }
  }, [isAuthenticated, navigate]);

  const handleRemove = async (productId: string | number) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      triggerToast('Removed from wishlist successfully.', false);
    } else {
      triggerToast('Failed to remove from wishlist. Please try again.', true);
    }
  };

  const handleAddToBag = (item: any) => {
    const isOutOfStock = item.stock === 0 || item.stock === '0';
    if (isOutOfStock) {
      triggerToast('Sorry, this product is currently out of stock.', true);
      return;
    }

    addToCart({ ...item, customization: null }, 1);
    removeFromWishlist(item.id);
    triggerToast('Moved to bag successfully!', false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-secondary min-h-screen py-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 tracking-tight">Your Wishlist</h1>
            <p className="text-gray-500 max-w-xl mx-auto">Items you've saved to buy later. Handpicked with care.</p>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading wishlist...</p>
              </div>
            ) : wishlistItems.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {wishlistItems.map((item, i) => {
                  const isOutOfStock = (item as any).stock === 0 || (item as any).stock === '0';
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-10 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="relative group shrink-0">
                        <img src={item.image} alt={item.name} className="w-48 h-48 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors rounded-2xl" />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                            <span className="text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-black/40 rounded-md">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow space-y-4 text-center sm:text-left">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-accent tracking-[0.3em]">{item.category}</span>
                          <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight">{item.name}</h3>
                        </div>
                        <p className="text-gray-500 text-sm max-w-lg line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-center sm:justify-start space-x-4">
                          <span className="text-2xl font-bold text-primary">₹{item.price.toLocaleString('en-IN')}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 w-full sm:w-auto">
                        <button 
                          onClick={() => handleAddToBag(item)}
                          disabled={isOutOfStock}
                          className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xl transition-all whitespace-nowrap ${
                            isOutOfStock 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-150' 
                              : 'bg-primary text-white hover:bg-opacity-90 hover:scale-[1.02] active:scale-95 cursor-pointer'
                          }`}
                        >
                          <ShoppingBag size={18} />
                          <span>{isOutOfStock ? 'Out of Stock' : 'Add To Bag'}</span>
                        </button>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="px-8 py-4 border border-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center space-x-2 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all text-xs uppercase tracking-widest cursor-pointer"
                        >
                          <Trash2 size={16} />
                          <span>Remove Item</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-32 text-center space-y-8">
                <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto animate-bounce">
                  <Heart size={40} fill="currentColor" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-serif font-bold text-gray-900">Your wishlist is empty</h2>
                  <p className="text-gray-500 text-xs font-semibold">Looks like you haven't saved any customized creations yet.</p>
                </div>
                <Link to="/products" className="inline-flex items-center space-x-2 bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:bg-opacity-95 transition-all group active:scale-95">
                  <span>Explore Collections</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`toast-top-center fixed z-50 flex items-center space-x-3 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl ${
              toast.isError ? 'bg-red-600 border border-red-500' : 'bg-emerald-600 border border-emerald-500'
            }`}
          >
            {toast.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
