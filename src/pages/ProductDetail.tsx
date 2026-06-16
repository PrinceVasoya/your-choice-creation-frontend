import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingCart, Heart, Share2, ShieldCheck, Truck, RotateCcw, Plus, Minus, Image as ImageIcon, Type, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import BackButton from '../components/BackButton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { mapApiProductToFrontend } from '../utils/api';
import { parseProductDescription } from './Admin';
import usePageTitle from '../hooks/usePageTitle';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [personalizationText, setPersonalizationText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Custom Size selection states [M6, V2]
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Dynamic variants and customizations states
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, boolean>>({});
  const [customizationErrors, setCustomizationErrors] = useState<{ image?: boolean; text?: boolean }>({});

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

  const [product, setProduct] = useState<any>(null);
  usePageTitle(product?.name);
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setProduct(null); // Clear previous product state to prevent cache leakage (Fix 3)
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        if (!id) return;
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const json = await res.json();
          if ((json.success || json.succeeded) && json.data) {
            setProduct(mapApiProductToFrontend(json.data));
          }
        } else {
          // Check local mock as fallback
          const localProd = PRODUCTS.find(p => p.id === id);
          if (localProd) setProduct(localProd);
        }

        const allRes = await fetch('/api/products?pageSize=100');
        if (allRes.ok) {
          const allJson = await allRes.json();
          if (allJson.data && allJson.data.length > 0) {
            setProducts(allJson.data.map(mapApiProductToFrontend));
          }
        }
      } catch (err) {
                                                                              
        const localProd = PRODUCTS.find(p => p.id === id);
        if (localProd) setProduct(localProd);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const parsedDescription = useMemo(() => {
    if (!product) return null;
    return parseProductDescription(product.description || '');
  }, [product]);

  const showUpload = !!(
    product?.hasCustomization ||
    product?.customizationAvailable ||
    product?.allowCustomImage ||
    (parsedDescription?.isCustomizationAvailable && parsedDescription.customizationTypes.includes('image')) ||
    (product?.personalizationType === 'photo' || product?.personalizationType === 'both')
  );

  const showTextInput = !!(
    (parsedDescription?.isCustomizationAvailable && parsedDescription.customizationTypes.includes('text')) ||
    (product?.personalizationType === 'text' || product?.personalizationType === 'both')
  );

  const hasCustomization = showUpload || showTextInput;

  const isFavorite = isWishlisted(product?.id || '');

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    const success = await toggleWishlist(product.id);
    if (success) {
      triggerToast(isFavorite ? 'Removed from wishlist!' : 'Added to wishlist!', false);
    } else {
      triggerToast('Something went wrong. Please try again.', true);
    }
  };

  const description = parsedDescription?.description || product?.description || '';
  const CHAR_LIMIT = 180;
  const isLong = description.length > CHAR_LIMIT;
  const displayText = showFullDesc ? description : description.slice(0, CHAR_LIMIT);

  const imagesList = useMemo(() => {
    if (parsedDescription?.images && parsedDescription.images.length > 0) {
      return parsedDescription.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  }, [product, parsedDescription]);

  const productVariants = useMemo(() => {
    return parsedDescription?.variants || product?.variants || [];
  }, [parsedDescription, product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (productVariants.length > 0) {
      const initial: Record<string, string> = {};
      productVariants.forEach((v: any) => {
        initial[v.type] = '';
      });
      setSelectedVariants(initial);
      setVariantErrors({});
      setCustomizationErrors({});
      setPersonalizationText('');
      setUploadedImage(null);
    } else {
      setSelectedVariants({});
      setVariantErrors({});
      setCustomizationErrors({});
      setPersonalizationText('');
      setUploadedImage(null);
      setSelectedSize(null);
      setSizeError(false);
    }
  }, [productVariants]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [products, product]);

  const validateCustomSelection = (): boolean => {
    // 1. Dynamic variants and sizes selection validation (Fix 4)
    if (productVariants.length > 0) {
      const errors: Record<string, boolean> = {};
      let hasError = false;
      productVariants.forEach((v: any) => {
        if (!selectedVariants[v.type]) {
          errors[v.type] = true;
          hasError = true;
        }
      });
      if (hasError) {
        setVariantErrors(errors);
        triggerToast('Please select all required variants/sizes to continue.', true);
        return false;
      }
    }



    return true;
  };

  const charLimit = useMemo(() => {
    const label = parsedDescription?.customizationInstructions || '';
    const match = label.match(/max\s+(\d+)\s+character/i);
    if (match) {
      return parseInt(match[1]);
    }
    return 30; // default cap of 30 characters
  }, [parsedDescription]);

  const getCartProduct = () => {
    let sizeVal = selectedSize || 'Standard';
    if (productVariants.length > 0) {
      sizeVal = Object.entries(selectedVariants)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ') || 'Standard';
    }

    // Clean up empty selectedVariants entries
    const cartSelectedVariants: Record<string, string> = {};
    Object.entries(selectedVariants).forEach(([k, v]) => {
      if (v) cartSelectedVariants[k] = v;
    });

    return {
      ...product,
      size: sizeVal,
      customization: personalizationText ? { text: personalizationText } : null,
      selectedVariants: cartSelectedVariants
    };
  };

  const handleAddToCart = () => {
    if (!validateCustomSelection()) return;
    addToCart(getCartProduct(), quantity);
    triggerToast('Added to cart successfully!', false);
  };

  const handleBuyNow = () => {
    if (!validateCustomSelection()) return;
    addToCart(getCartProduct(), quantity);
    navigate('/cart');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast('Product link copied to clipboard!', false);
  };

  // 404 product not found state [V2]
  if (!isLoading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6 select-none">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 shadow-inner">
          <Info size={36} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Product Not Found</h1>
          <p className="text-gray-500 text-sm">The listing you requested could not be resolved in our catalog.</p>
        </div>
        <Link 
          to="/products"
          className="inline-block bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-opacity-95 shadow-md active:scale-95 transition-all"
        >
          Back to Shopping
        </Link>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 space-y-12 animate-pulse select-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="flex gap-4 items-start w-full">
            <div className="hidden lg:flex flex-col gap-2.5 w-[80px]">
              {[1, 2, 3, 4].map(n => <div key={n} className="w-[72px] h-[72px] bg-gray-100 rounded-lg" />)}
            </div>
            <div className="flex-1 aspect-square bg-gray-100 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-6 bg-gray-100 rounded-lg w-1/4" />
            <div className="h-10 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
            <div className="h-12 bg-gray-100 rounded-lg w-1/2" />
            <div className="h-28 bg-gray-100 rounded-lg w-full" />
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || (product as any).stock === '0';

  return (
    <div className="bg-white pb-24 relative select-none">
      {/* Breadcrumbs [U3] */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <BackButton />
        <nav className="flex items-center text-xs sm:text-sm text-gray-400 font-medium font-sans truncate">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Mobile swipeable snap image scroller [M6] */}
          <div className="lg:hidden relative aspect-square overflow-hidden bg-gray-50 rounded-2xl w-full flex-shrink-0">
            <div 
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full h-full" 
              id="mobile-image-carousel"
              onScroll={(e) => {
                const container = e.currentTarget;
                const scrollLeft = container.scrollLeft;
                const width = container.clientWidth;
                if (width > 0) {
                  const newIndex = Math.round(scrollLeft / width);
                  if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < imagesList.length) {
                    setActiveImageIndex(newIndex);
                  }
                }
              }}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {imagesList.map((imgUrl: string, idx: number) => (
                <div key={idx} className="snap-start min-w-full h-full flex-shrink-0 relative">
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} ${idx + 1}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Share overlay */}
            <div className="absolute top-3 right-3 space-y-2 z-20 flex flex-col items-center">
              <button 
                onClick={handleWishlistToggle}
                className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md active:scale-95 z-20 ${
                  isFavorite ? 'text-red-500' : 'text-gray-600'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={handleShareClick}
                className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-full shadow-md active:scale-95"
              >
                <Share2 size={16} />
              </button>
            </div>
            {/* Pagination Indicators (Flipkart-style swipe dots) */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-1.5 z-10">
              {imagesList.map((_, idx: number) => (
                <span 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx 
                      ? 'w-5 bg-[#2563eb] rounded-[3px]' 
                      : 'w-1.5 bg-[#cbd5e1]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Image gallery (Flipkart-style Left Thumbnail Vertical Strip + Large aspect-square Hero) */}
          <div className="hidden lg:flex lg:flex-row gap-4 items-start w-full">
            {/* Left Thumbnail Strip */}
            <div 
              className="flex flex-col gap-2.5 w-[80px] shrink-0 max-h-[480px] overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {imagesList.map((imgUrl: string, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                  }}
                  className={`w-[72px] h-[72px] rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                    activeImageIndex === idx 
                      ? 'border-[#2563eb]' 
                      : 'border-transparent hover:border-[#94a3b8]'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`Thumbnail ${idx + 1}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Right Hero Image */}
            <div className="flex-1 max-w-[480px] aspect-square rounded-[12px] border border-[#e2e8f0] bg-white overflow-hidden relative group cursor-zoom-in">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIndex}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.2 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  src={imagesList[activeImageIndex] || product.image} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-[1.08] transition-transform duration-300 ease-out"
                />
              </AnimatePresence>
              
              <div className="absolute top-3 right-3 space-y-2 flex flex-col items-center">
                <button 
                  onClick={handleWishlistToggle}
                  className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all hover:scale-110 active:scale-95 z-20 ${
                    isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-primary'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={handleShareClick}
                  className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-primary rounded-full shadow-md transition-all hover:scale-110 active:scale-95 z-20"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Info Details Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <span className="text-accent text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 bg-accent/10 rounded-full w-max block">
                {product.category}
              </span>
              
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {/* Star rating and reviews completely removed */}
              
              <div className="flex items-baseline space-x-3.5 pt-2">
                <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg text-gray-300 line-through font-medium">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-accent font-bold bg-accent/5 px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Product Stock Status Badge (Fix 6, Part C) */}
              <div className="flex items-center gap-2 pt-1 font-sans">
                {product.stock > 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    In Stock
                  </span>
                ) : product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    Only {product.stock} left in stock!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description accordion with Read More [M6] */}
            <div className="product-description border-t border-b border-gray-100 py-4">
              <p className="desc-text text-gray-500 text-xs sm:text-sm leading-relaxed">
                {displayText}
                {!showFullDesc && isLong && '...'}
              </p>
              {isLong && (
                <button 
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="desc-toggle-btn text-[10px] font-bold text-primary uppercase tracking-widest hover:underline focus:outline-none"
                >
                  {showFullDesc ? 'Show Less ▲' : 'Read More ▼'}
                </button>
              )}
            </div>
            {/* Dynamic Variant Selectors (Pill-style Chips) (Fix 4) */}
            {productVariants.length > 0 ? (
              <div className="space-y-6 pt-3 select-none">
                {productVariants.map((v: any) => {
                  const hasError = variantErrors[v.type];
                  return (
                    <div key={v.type} className="flex flex-col">
                      <span className="text-[13px] text-[#555] font-bold mb-2 ml-1">
                        Select {v.type}
                      </span>
                      <div className={`flex flex-row flex-wrap gap-2.5 overflow-x-auto sm:overflow-visible scrollbar-hide py-1 ${
                        hasError ? 'ring-2 ring-red-500 rounded-2xl p-1.5' : ''
                      }`}>
                        {v.values.map((val: string) => {
                          const isSelected = selectedVariants[v.type] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setVariantErrors(prev => ({ ...prev, [v.type]: false }));
                                setSelectedVariants(prev => ({ 
                                  ...prev, 
                                  [v.type]: isSelected ? '' : val 
                                }));
                              }}
                              className={`px-5 py-2 text-[13px] font-semibold rounded-full cursor-pointer transition-all duration-250 select-none ${
                                isSelected
                                  ? 'bg-[#832729] text-white hover:bg-[#6f1e20]'
                                  : 'bg-[#f5f5f5] border border-gray-300 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                      {hasError && (
                        <span className="text-red-500 text-xs font-bold mt-1.5 ml-1 flex items-center gap-1">
                          ⚠️ Please select a {v.type.toLowerCase()} to continue
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Customization Note input field on Product Detail page */}
            {showTextInput && (
              <div className="space-y-2.5 pt-3 pb-3 select-none">
                <span className="text-[13px] text-[#555] font-bold mb-1 ml-1 block">
                  {parsedDescription?.customizationInstructions || "Personalization Note"}
                </span>
                <textarea
                  value={personalizationText}
                  onChange={(e) => {
                    const textVal = e.target.value.slice(0, charLimit);
                    setPersonalizationText(textVal);
                  }}
                  maxLength={charLimit}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none placeholder-gray-400"
                  placeholder="Enter your customization note..."
                  rows={2}
                />
                <div className="flex justify-between items-center px-1 text-[10px] text-gray-400 font-medium">
                  <span>Maximum {charLimit} characters</span>
                  <span>{charLimit - personalizationText.length} characters left</span>
                </div>
              </div>
            )}

            {/* Desktop Add to Cart buttons */}
            <div className="hidden lg:block space-y-4 pt-4">
              <div className="flex items-center gap-6">
                <div className={`flex items-center border border-gray-100 rounded-xl overflow-hidden p-1 bg-gray-50 flex-shrink-0 ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="p-2 hover:bg-white text-gray-600 rounded-lg transition-colors disabled:opacity-35"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-xs text-gray-900">{isOutOfStock ? 0 : quantity}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      if (quantity >= product.stock) {
                        triggerToast(`Only ${product.stock} units available in stock.`, true);
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="p-2 hover:bg-white text-gray-600 rounded-lg transition-colors disabled:opacity-35 disabled:hover:bg-transparent"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                {isOutOfStock ? (
                  <button 
                    disabled
                    className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 border border-gray-100 cursor-not-allowed"
                  >
                    <span className="text-xs uppercase tracking-wider">Out of Stock</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-lg active:scale-95 transition-all"
                  >
                    <ShoppingCart size={18} />
                    <span className="text-xs uppercase tracking-wider">Add to Cart</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>



        {/* Similar Products [U3] */}
        <section className="mt-16 space-y-8 select-none">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">You May Also Like</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Discover more customized gift surprises.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4 px-0.5 sm:px-0">
            {relatedProducts.map(p => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile viewport sticky bottom double actions bar [M6] */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-white border-t border-gray-100 p-3.5 flex gap-3 shadow-2xl items-center h-20">
        {isOutOfStock ? (
          <button 
            disabled
            className="w-full h-[52px] bg-gray-100 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed flex items-center justify-center border border-gray-100"
          >
            <span>Out of Stock</span>
          </button>
        ) : (
          <>
            <button 
              onClick={handleAddToCart}
              className="w-1/2 h-[52px] bg-white border-2 border-primary text-primary rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <ShoppingCart size={15} />
              <span>Add to Cart</span>
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-1/2 h-[52px] bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-1.5 shadow-md"
            >
              <span>Buy Now</span>
            </button>
          </>
        )}
      </div>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`toast-top-center fixed z-50 flex items-center space-x-3 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl animate-fade-in ${
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
