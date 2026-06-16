import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, Menu, X, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import Newsletter from '../components/Newsletter';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isLinkActive = (path: string) => {
    const currentUrl = location.pathname + location.search;
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.includes('?')) {
      return currentUrl === path;
    }
    return location.pathname === path && !location.search;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu and search on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchExpanded(false);
  }, [location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchExpanded(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header (exactly 56px / h-14 high on mobile) */}
      <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${isScrolled ? 'glass shadow-sm' : 'bg-white border-b border-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 lg:h-20">
            {/* Logo on Left for Mobile */}
            <div className="flex items-center lg:hidden">
              <Link to="/" className="flex flex-col items-start group">
                <span className="text-xl font-serif font-bold text-primary tracking-tighter leading-none">
                  YourChoice
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-accent font-semibold">
                  Creation
                </span>
              </Link>
            </div>

            {/* Logo for Desktop */}
            <div className="hidden lg:block">
              <Link to="/" className="flex flex-col items-center group">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-primary tracking-tighter leading-none group-hover:scale-105 transition-transform">
                  YourChoice
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                  Creation
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary pb-1 ${
                    isLinkActive(link.path) ? 'text-primary border-b-2 border-primary font-bold' : 'text-gray-600 border-b-2 border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop: Expanded Search in Header */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-64 xl:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gifts, cakes..."
                className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-sans focus:outline-none focus:border-primary/50 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 text-gray-400" size={14} />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3.5 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Desktop: Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link to={isAuthenticated ? "/profile" : "/auth"} className="p-2 text-gray-600 hover:text-primary transition-colors">
                <User size={20} />
              </Link>
              <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary transition-colors relative">
                <Heart size={20} />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="p-2 text-gray-600 hover:text-primary transition-colors relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
              </Link>
            </div>

            {/* Mobile: Icons on Right (search icon + cart icon + menu icon) */}
            <div className="flex items-center space-x-1 lg:hidden">
              <button 
                onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
                className={`p-2 text-gray-600 hover:text-primary transition-colors ${isMobileSearchExpanded ? 'text-primary' : ''}`}
                aria-label="Search"
              >
                <Search size={22} />
              </button>
              <Link to="/cart" className="p-2 text-gray-600 hover:text-primary transition-colors relative" aria-label="Cart">
                <ShoppingCart size={22} />
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm">{cartCount}</span>
              </Link>
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Expandable Search Bar (Exactly 44px high and full width below header) */}
        <AnimatePresence>
          {isMobileSearchExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-b border-gray-100 px-3 py-2 overflow-hidden w-full"
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full h-11">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for cakes, gifts, frames..."
                  className="w-full h-11 pl-11 pr-10 bg-gray-50 border border-gray-100 rounded-xl text-base font-sans focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                  style={{ fontSize: '16px' }} // Prevent iOS auto zoom on input focus
                  autoFocus
                />
                <Search className="absolute left-3.5 text-gray-400" size={18} />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3.5 text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                  </button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>


      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70] p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <Link to="/" className="flex flex-col items-center">
                  <span className="text-2xl font-serif font-bold text-primary tracking-tighter leading-none">
                    YourChoice
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                    Creation
                  </span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-lg font-serif font-medium tracking-wide transition-all ${
                      isLinkActive(link.path) 
                        ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                        : 'text-gray-800 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-6 border-t border-gray-50 flex flex-col space-y-4">
                  <Link to="/cart" className="flex items-center justify-between text-sm font-bold text-gray-600">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart size={18} />
                      <span>My Cart</span>
                    </div>
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{cartCount}</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center justify-between text-sm font-bold text-gray-600">
                    <div className="flex items-center space-x-3">
                      <Heart size={18} />
                      <span>My Wishlist</span>
                    </div>
                    {wishlistIds.length > 0 && (
                      <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full">{wishlistIds.length}</span>
                    )}
                  </Link>
                  <Link to={isAuthenticated ? "/profile" : "/auth"} className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                    <User size={18} />
                    <span>{isAuthenticated ? "My Account" : "Login / Register"}</span>
                  </Link>
                </div>
              </div>
              
              <div className="mt-auto pt-10 border-t border-gray-100 italic text-gray-500 text-sm text-center">
                "Creating memories since 2015"
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="flex flex-col group">
                <span className="text-3xl font-serif font-bold text-white tracking-tighter leading-none">
                  YourChoice
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                  Creation
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Your one-stop destination for premium personalized gifts, handcrafted with love to make every occasion unforgettable.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 border border-gray-700 rounded-full hover:bg-primary transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="p-2 border border-gray-700 rounded-full hover:bg-primary transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="p-2 border border-gray-700 rounded-full hover:bg-primary transition-colors">
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-accent">Quick Links</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?category=Personalized Mugs" className="hover:text-white transition-colors">Personalized Mugs</Link></li>
                <li><Link to="/products?category=Flower Bouquets" className="hover:text-white transition-colors">Flower Bouquets</Link></li>
                <li><Link to="/products?category=Custom Cushions" className="hover:text-white transition-colors">Custom Cushions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-accent">Help & Info</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-serif font-semibold mb-6 text-accent">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <Newsletter layout="stack" />
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} Your Choice Creation. All rights reserved.</p>
            <div className="flex space-x-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-50" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
