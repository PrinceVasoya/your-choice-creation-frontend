import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, ChevronDown, SlidersHorizontal, Grid, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { mapApiProductToFrontend } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

export default function Products() {
  usePageTitle('Products');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract URL parameters
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [sortBy, setSortBy] = useState('Featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Sync category state when URL query updates
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  // Case D: When category or other filters change scroll to top of product grid
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [selectedCategory, priceRange, ratingFilter, inStockOnly]);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catJson = await catRes.json();
          if ((catJson.success || catJson.succeeded) && catJson.data && catJson.data.length > 0) {
            const mappedCats = catJson.data.map((c: any) => ({
              id: String(c.id),
              name: c.name,
              image: c.imageUrl || 'https://images.unsplash.com/photo-1517254456776-9bb245d2b843?auto=format&fit=crop&w=400&h=400&q=80',
              count: 30 + (c.id * 15)
            }));
            setCategories(mappedCats);
          }
        }

        const prodRes = await fetch('/api/products?pageSize=100');
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.data && prodJson.data.length > 0) {
            const mappedProds = prodJson.data.map(mapApiProductToFrontend);
            setProducts(mappedProds);
          }
        }
      } catch (err) {
                                                                                             
      }
    };

    fetchProductsData();
  }, []);

  // Filtering + Sorting Math Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchSearch = !searchParam || 
        p.name.toLowerCase().includes(searchParam.toLowerCase()) || 
        p.description.toLowerCase().includes(searchParam.toLowerCase());
      const matchRating = p.rating >= ratingFilter;
      const matchStock = !inStockOnly || (p as any).stock === undefined || (p as any).stock > 0 || (p as any).stock === 'In Stock';
      return matchCategory && matchPrice && matchSearch && matchRating && matchStock;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Rating' || sortBy === 'Top Rated') return b.rating - a.rating;
      if (sortBy === 'Newest') return b.id.localeCompare(a.id); // fallback sort
      return 0; // Featured
    });
  }, [products, selectedCategory, priceRange, sortBy, searchParam, ratingFilter, inStockOnly]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (priceRange[1] < 5000) count++;
    if (ratingFilter > 0) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategory, priceRange, ratingFilter, inStockOnly]);

  const FilterSidebar = () => (
    <div className="space-y-8 select-none">
      {/* Category Checkboxes */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-primary rounded-full" />
          Filter Category
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={selectedCategory === 'All'} 
              onChange={() => setSelectedCategory('All')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
            />
            <span className={selectedCategory === 'All' ? 'text-primary font-bold' : ''}>All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedCategory === cat.name} 
                onChange={() => setSelectedCategory(cat.name)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary"
              />
              <span className={selectedCategory === cat.name ? 'text-primary font-bold' : ''}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>



      {/* Price Range Slider */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-primary rounded-full" />
          Price Range
        </h3>
        <div className="space-y-3">
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <span>₹0</span>
            <span className="text-primary font-extrabold">Up to ₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Rating Filters */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-primary rounded-full" />
          Customer Ratings
        </h3>
        <div className="space-y-2.5">
          {[4, 3, 2].map(stars => (
            <button
              key={stars}
              onClick={() => setRatingFilter(ratingFilter === stars ? 0 : stars)}
              className={`flex items-center space-x-2 text-sm transition-colors w-full text-left active:scale-98 ${ratingFilter === stars ? 'text-primary font-bold' : 'text-gray-500'}`}
            >
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < stars ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs font-medium">& Up ({stars}★+)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="space-y-4 pt-6 border-t border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-primary rounded-full" />
          Availability
        </h3>
        <label className="flex items-center justify-between text-sm text-gray-600 cursor-pointer">
          <span className="text-xs font-bold uppercase text-gray-500">In Stock Only</span>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={inStockOnly} 
              onChange={() => setInStockOnly(!inStockOnly)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div className="bg-secondary min-h-screen pb-16">
      {/* Search Result & Collection Header banner */}
      <div className="bg-white border-b border-gray-100 py-10 sm:py-16 text-center select-none">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 mb-2 sm:mb-4">
            {searchParam ? `Search Results` : selectedCategory === 'All' ? 'Our Collection' : selectedCategory}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto uppercase tracking-wider font-bold">
            {searchParam 
              ? `Found ${filteredProducts.length} items for "${searchParam}"`
              : `Browse through our wide range of premium personalized gifts`
            }
          </p>
        </div>
      </div>

      {/* Mobile Category Chips scroller bar (Sticky below 56px header [M4]) */}
      <div className="lg:hidden sticky top-14 z-30 bg-white border-b border-gray-100 py-3 overflow-x-auto scrollbar-hide shadow-xs">
        <div className="relative">
          <div className="flex px-4 space-x-2.5 min-w-max scrollbar-hide">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                selectedCategory === 'All' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  selectedCategory === cat.name 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Subtle fade overlay to signal scrollable categories */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet [M13] */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bottom-sheet-backdrop"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bottom-sheet-container lg:hidden p-5"
            >
              <div className="bottom-sheet-handle" />
              <div className="flex justify-between items-center mb-5 pt-2">
                <h2 className="text-xl font-serif font-bold text-gray-900">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={() => { setSelectedCategory('All'); setPriceRange([0, 5000]); setRatingFilter(0); setInStockOnly(false); }}
                    className="text-xs font-bold text-primary uppercase tracking-wider active:scale-95"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex-grow overflow-y-auto pr-1 pb-20 scrollbar-hide">
                <FilterSidebar />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md active:scale-95 transition-all"
                >
                  Apply Filters ({filteredProducts.length} items)
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Grid Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-serif font-bold text-gray-900">Filter Facets</h2>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={() => { setSelectedCategory('All'); setPriceRange([0, 5000]); setRatingFilter(0); setInStockOnly(false); }}
                    className="text-2xs font-extrabold text-primary uppercase tracking-widest hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Catalog layout */}
          <div className="flex-grow space-y-6">
            
            {/* Control Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs select-none">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of <span className="font-bold text-gray-900">{products.length}</span> items
              </div>

              <div className="flex items-center space-x-4">
                {/* Responsive Sort dropdown */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-widest hidden sm:inline">Sort:</span>
                  <div className="relative group">
                    <button className="flex items-center space-x-1 text-xs font-bold text-gray-900 hover:text-primary transition-colors focus:outline-none">
                      <span>{sortBy}</span>
                      <ChevronDown size={14} />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2.5 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      {['Featured', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'].map(option => (
                        <button
                          key={option}
                          onClick={() => setSortBy(option)}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-secondary transition-colors ${sortBy === option ? 'text-primary font-bold' : 'text-gray-600'}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Filter Toggle Drawer button */}
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden p-2 text-primary bg-primary/5 rounded-lg flex items-center space-x-1.5 px-3 border border-primary/10 active:scale-95 shadow-sm"
                >
                  <SlidersHorizontal size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Product Grid: 2 columns mobile, 3 tablet, 5 desktop [M2, Step 5] */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5 px-0.5 sm:px-0">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Empty grid results handler [V1] */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 px-4 bg-white border border-gray-100 rounded-2xl shadow-2xs space-y-5">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Filter size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-gray-900">No products matched</h3>
                  {searchParam ? (
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      We couldn't find any listings matching your search for "{searchParam}".
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Try resetting your rating, stock filters, or categories selections.
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => { setSelectedCategory('All'); setPriceRange([0, 5000]); setRatingFilter(0); setInStockOnly(false); navigate('/products'); }}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-opacity-95 active:scale-95 transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
