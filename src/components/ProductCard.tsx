import { motion } from 'motion/react';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { Product } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isFavorite = isWishlisted(product.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Math check for discount percentages
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Enforce out of stock overlay checks
  const isOutOfStock = (product as any).stock === 0 || (product as any).stock === '0';
  const isCustomizable = !!(product.hasCustomization || product.customizationAvailable || product.allowCustomImage || (product.personalizationType && product.personalizationType !== 'none'));

  return (
    <Link to={`/products/${product.id}`} className="block h-full cursor-pointer select-none">
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md md:hover:shadow-lg md:hover:scale-[1.03] transition-[transform,box-shadow] duration-300 ease-in-out h-full flex flex-col lg:pb-0 pb-1 flex-shrink-0"
      >
        {/* Aspect square thumbnail container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            width="400"
            height="400"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Left Discount Pill Overlay */}
          {discount > 0 ? (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-extrabold py-0.5 px-2 rounded-md shadow-sm z-10 animate-pulse">
              {discount}% OFF
            </div>
          ) : product.isOffer ? (
            <div className="absolute top-2 left-2 bg-accent text-white text-[9px] uppercase font-bold py-0.5 px-2 rounded-md shadow-sm z-10">
              Offer
            </div>
          ) : null}

          {/* Top Right Wishlist heart icon with 32x32px tap area */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full transition-all hover:scale-110 active:scale-95 z-20 shadow-sm ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}
            style={{ width: '32px', height: '32px' }}
            aria-label="Wishlist"
          >
            <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Out of Stock Semi-Transparent Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-15">
              <span className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest px-3 py-1 bg-black/40 rounded-md">
                Out of Stock
              </span>
            </div>
          )}


        </div>

        {/* Card info segment */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-widest truncate max-w-[70%]">
                {product.category}
              </span>
              <div className="flex items-center text-yellow-400">
                <Star size={10} fill="currentColor" />
                <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold ml-1">
                  ({product.reviews})
                </span>
              </div>
            </div>

            {/* Product name: max 2 lines truncate */}
            <h3 className="text-gray-900 font-sans font-bold text-xs sm:text-[13px] leading-snug line-clamp-2 h-8 sm:h-9 overflow-hidden group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col justify-end">
            <div className="flex items-baseline space-x-2">
              <span className="text-primary font-bold text-sm sm:text-base">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-gray-400 line-through text-2xs sm:text-xs">₹{product.originalPrice}</span>
              )}
            </div>


          </div>
        </div>
      </motion.div>
    </Link>
  );
}
