import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2, AlertCircle, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { setCookie } from '../utils/cookies';
import BackButton from '../components/BackButton';
import usePageTitle from '../hooks/usePageTitle';

export default function Cart() {
  usePageTitle('My Cart');
  const { cart, restoreCart, updateQuantity, removeFromCart, cartTotal, promoCode, discount, applyPromoCode } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; message: string; isError: boolean }>({
    show: false,
    message: '',
    isError: false
  });

  const [adjustedItems, setAdjustedItems] = useState<Record<string, boolean>>({});

  // Real-time stock fetch from API on page load (Fix 5)
  useEffect(() => {
    const fetchLatestStocks = async () => {
      let updated = false;
      const updatedCart = await Promise.all(cart.map(async (item) => {
        try {
          const cleanId = item.id.startsWith('p') ? item.id.replace('p', '') : item.id;
          const res = await fetch(`/api/products/${cleanId}`);
          if (res.ok) {
            const json = await res.json();
            if ((json.success || json.succeeded) && json.data) {
              const latestStock = Number(json.data.stock !== undefined && json.data.stock !== null ? json.data.stock : 0);
              const isActive = json.data.isActive !== false;
              if (item.stock !== latestStock || item.isDeleted !== !isActive) {
                updated = true;
                return { ...item, stock: latestStock, isDeleted: !isActive };
              }
            }
          } else if (res.status === 404) {
            if (!item.isDeleted) {
              updated = true;
              return { ...item, isDeleted: true, stock: 0 };
            }
          }
        } catch (err) {
          // ignore network errors
        }
        return item;
      }));

      if (updated) {
        restoreCart(updatedCart);
      }
    };

    fetchLatestStocks();
  }, []);

  useEffect(() => {
    cart.forEach(item => {
      const stock = Number((item as any).stock);
      if ((item as any).stock !== undefined && stock > 0 && item.quantity > stock) {
        updateQuantity(item.id, stock);
        setAdjustedItems(prev => ({ ...prev, [item.id]: true }));
        triggerToast(`Only ${stock} units of '${item.name}' left — quantity adjusted automatically.`, true);
      }
    });
  }, [cart, updateQuantity]);

  const triggerToast = (message: string, isError: boolean) => {
    setToast({ show: true, message, isError });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Check if any items are out of stock or deleted [V3]
  const hasOutOfStockOrDeleted = useMemo(() => {
    return cart.some(item => (item as any).stock === 0 || (item as any).stock === '0' || item.isDeleted);
  }, [cart]);
  const handleCheckoutClick = () => {
    console.log("Place Order clicked");
    const token = localStorage.getItem("token");
    console.log("User logged in:", !!token);
    if (hasOutOfStockOrDeleted) {
      triggerToast('Item is now out of stock. Please remove it to proceed.', true);
      return;
    }
    if (!token) {
      console.log("Saving redirect:", "/checkout");
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login?redirect=checkout");
      return;
    }
    navigate("/checkout");
  };

  const handleApplyPromo = () => {
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoSuccess(true);
      setPromoError(false);
      setTimeout(() => setPromoSuccess(false), 3000);
    } else {
      setPromoError(true);
      setPromoSuccess(false);
      setTimeout(() => setPromoError(false), 3000);
    }
  };

  const shipping = cartTotal > 999 ? 0 : (cartTotal === 0 ? 0 : 99);
  const total = cartTotal - discount + shipping;

  // Empty Cart State validation [V3]
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center select-none">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 text-xs mb-8">Add customized products and cakes to start making memories.</p>
        <Link
          to="/products"
          className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 shadow-md active:scale-95 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary/30 min-h-screen py-10 sm:py-16 pb-24 lg:pb-16 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <BackButton />
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 mb-8 sm:mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs relative flex flex-row items-start gap-4 sm:items-center sm:gap-6"
              >
                {/* Remove button at top right for Mobile */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 sm:hidden p-1.5 rounded-full hover:bg-gray-50 active:scale-95"
                  aria-label="Remove"
                >
                  <X size={18} />
                </button>

                {/* Thumbnail Image (80x80 / w-20 h-20 on mobile) */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {Number(item.stock || 0) === 0 && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <span className="text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-black/40 rounded-md">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Details (Name, Size, Price, Quantities) */}
                <div className="flex-grow space-y-1 pr-6 sm:pr-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-widest leading-none">{item.category}</span>
                  <h3 className="font-serif font-bold text-sm sm:text-lg text-gray-900 leading-tight line-clamp-1 sm:line-clamp-none">{item.name}</h3>
                  {item.size && (
                    <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider leading-none pt-0.5">Option: {item.size}</p>
                  )}
                  {!!(item.hasCustomization || item.customizationAvailable || item.allowCustomImage || (item.personalizationType && item.personalizationType !== 'none')) && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        ⚠️ Customization required at checkout
                      </span>
                    </div>
                  )}

                  {/* Stock Status Badge mirroring Product Details */}
                  <div className="flex items-center gap-2 pt-1 font-sans">
                    {Number(item.stock || 0) > 10 ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        In Stock
                      </span>
                    ) : Number(item.stock || 0) > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        Only {item.stock} left!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Dynamic stock warning validations [V3] */}
                  {item.isDeleted ? (
                    <span className="inline-block text-[9px] font-extrabold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider mt-1">No longer available</span>
                  ) : (item as any).stock === 0 || (item as any).stock === '0' ? (
                    <span className="inline-block text-[9px] font-extrabold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider mt-1 animate-pulse">Item is now out of stock</span>
                  ) : (
                    <>
                      <p className="text-primary font-bold text-sm sm:text-base pt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                      {adjustedItems[item.id] && (
                        <p className="text-amber-600 font-bold text-[10px] sm:text-xs bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl mt-1.5 inline-flex items-center gap-1.5 animate-pulse">
                          ⚠️ Only {(item as any).stock} left — quantity adjusted
                        </p>
                      )}
                    </>
                  )}

                  {/* Steppers & Quantity Adjuster for Mobile (minimum 44px touch targets!) */}
                  <div className="flex items-center gap-4 pt-1 sm:hidden">
                    <div className={`flex items-center border border-gray-100 rounded-xl bg-gray-50 p-0.5 h-11 ${((item as any).stock === 0 || (item as any).stock === '0') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={(item as any).stock === 0 || (item as any).stock === '0'}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-primary transition-colors shadow-2xs active:scale-95 disabled:opacity-35"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-gray-900">
                        {((item as any).stock === 0 || (item as any).stock === '0') ? 0 : item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.stock !== undefined && item.quantity >= item.stock) {
                            triggerToast(`Only ${item.stock} units available`, true);
                            return;
                          }
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        disabled={Number(item.stock || 0) === 0 || (item.stock !== undefined && item.quantity >= item.stock)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-gray-500 hover:text-primary transition-colors shadow-2xs active:scale-95 disabled:opacity-35"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Quantity & Remove bar */}
                <div className="hidden sm:flex items-center space-x-4">
                  <div className={`flex items-center border border-gray-100 rounded-xl bg-gray-50 p-1 ${((item as any).stock === 0 || (item as any).stock === '0') ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={(item as any).stock === 0 || (item as any).stock === '0'}
                      className="p-2 hover:bg-white rounded-lg text-gray-500 transition-colors disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">
                      {((item as any).stock === 0 || (item as any).stock === '0') ? 0 : item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (item.stock !== undefined && item.quantity >= Number(item.stock)) {
                          triggerToast(`Only ${item.stock} units available`, true);
                        } else {
                          updateQuantity(item.id, item.quantity + 1);
                        }
                      }}
                      disabled={Number(item.stock || 0) === 0 || (item.stock !== undefined && item.quantity >= Number(item.stock))}
                      className="p-1.5 hover:bg-white text-gray-500 hover:text-primary rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={`p-3 rounded-xl transition-all ${((item as any).stock === 0 || (item as any).stock === '0')
                      ? 'text-white bg-red-600 hover:bg-red-700 border border-red-700 animate-pulse'
                      : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                    aria-label="Remove"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="hidden sm:block text-right min-w-[80px]">
                  <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs space-y-6 hidden lg:block">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">Order Summary</h2>

              <div className="space-y-4 text-xs sm:text-sm font-semibold">
                <div className="flex justify-between text-gray-400 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent font-bold">
                    <div className="flex items-center space-x-1">
                      <Tag size={14} />
                      <span>Discount ({promoCode})</span>
                    </div>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 uppercase tracking-wider">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-900"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-accent italic">Add ₹{(999 - cartTotal).toLocaleString('en-IN')} more for FREE shipping!</p>
                )}
                <div className="border-t border-gray-100 pt-4 flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                disabled={hasOutOfStockOrDeleted}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-md transition-all active:scale-95 cursor-pointer ${hasOutOfStockOrDeleted
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-opacity-95'
                  }`}
              >
                <span>Place Order</span>
                <ArrowRight size={18} />
              </button>
              {hasOutOfStockOrDeleted && (
                <p className="text-red-500 text-[10px] font-extrabold uppercase text-center mt-2 animate-pulse">
                  Remove out of stock items to continue
                </p>
              )}
            </div>

            {/* Coupons Card (responsive flex for stacked inputs on mobile [M7]) */}
            <div className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-2xs relative overflow-hidden">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Coupon Apply</p>
                  {promoCode && <span className="text-[9px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Active: {promoCode}</span>}
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="ENTER CODE"
                    className={`w-full sm:flex-grow px-4 py-3 rounded-xl text-xs border focus:ring-2 transition-all uppercase font-bold tracking-widest focus:outline-none ${promoError ? 'border-red-200 bg-red-50 focus:ring-red-100' :
                      promoSuccess ? 'border-green-200 bg-green-50 focus:ring-green-100' :
                        'border-gray-50 bg-gray-50 focus:ring-primary/10'
                      }`}
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoInput}
                    className="w-full sm:w-auto bg-gray-950 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                    style={{ minHeight: '44px' }}
                  >
                    Apply
                  </button>
                </div>

                <AnimatePresence>
                  {promoSuccess && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Discount Code applied successfully!
                    </motion.p>
                  )}
                  {promoError && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} /> Invalid discount coupon code.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile viewport sticky bottom proceeding bar [M7] */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-45 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] select-none">
        {/* Expandable summary breakups */}
        <AnimatePresence>
          {isMobileSummaryExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-4 bg-gray-50 border-b border-gray-100 space-y-3 font-medium text-xs text-gray-500 overflow-hidden"
            >
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span>Promo Discount ({promoCode})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className={shipping === 0 ? "text-green-600 font-bold" : "text-gray-900 font-bold"}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasOutOfStockOrDeleted && (
          <div className="bg-red-50 text-red-600 text-[10px] font-bold text-center py-2 border-b border-red-100 animate-pulse">
            Remove out of stock items to continue
          </div>
        )}

        {/* Mobile bottom bar action */}
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsMobileSummaryExpanded(!isMobileSummaryExpanded)}
            className="flex flex-col text-left focus:outline-none"
          >
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Total Amount</span>
            <div className="flex items-center text-primary font-serif font-bold text-base sm:text-lg">
              <span>₹{total.toLocaleString('en-IN')}</span>
              <ChevronDown size={14} className={`ml-1 transition-transform duration-300 ${isMobileSummaryExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <button
            onClick={handleCheckoutClick}
            disabled={hasOutOfStockOrDeleted}
            className={`px-5 h-[44px] rounded-xl font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center space-x-1.5 transition-all ${hasOutOfStockOrDeleted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-100'
              : 'bg-primary text-white active:scale-95'
              }`}
          >
            <span>Place Order</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`toast-top-center fixed z-50 flex items-center space-x-3 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl ${toast.isError ? 'bg-red-600 border border-red-500' : 'bg-emerald-600 border border-emerald-500'
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
