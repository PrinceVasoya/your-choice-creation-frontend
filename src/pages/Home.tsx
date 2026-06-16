import { motion } from 'motion/react';
import { ArrowRight, Gift, Truck, ShieldCheck, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CATEGORIES, PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { mapApiProductToFrontend } from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';

const colorList = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa', '#a7f3d0', '#fce7f3'];

export default function Home() {
  usePageTitle('Shop Now');
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [trendingProducts, setTrendingProducts] = useState<any[]>(PRODUCTS.filter(p => p.isTrending));
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number, name: string) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.style.backgroundColor = colorList[index % 8];
      parent.style.display = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      parent.innerHTML = `<span style="font-size:24px; font-weight:700; color:#555;">${name[0].toUpperCase()}</span>`;
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch categories from live API
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catJson = await catRes.json();
          if ((catJson.success || catJson.succeeded) && catJson.data && catJson.data.length > 0) {
            const mappedCats = catJson.data.map((c: any) => ({
              id: String(c.id),
              name: c.name,
              image: c.imageUrl || '',
              count: 30 + (c.id * 15)
            }));
            setCategories(mappedCats);
          }
        }

        // Fetch products from live API
        const prodRes = await fetch('/api/products?pageSize=30');
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.data && prodJson.data.length > 0) {
            const mappedProds = prodJson.data.map(mapApiProductToFrontend);
            setTrendingProducts(mappedProds.filter((p: any) => p.isTrending).slice(0, 4));
          }
        }
      } catch (err) {

      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/hero/1920/1080"
            alt="Hero"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-white space-y-8"
          >
            <div className="space-y-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-accent uppercase tracking-[0.3em] font-bold text-sm"
              >
                Premium Personalised Gifts
              </motion.span>
              <h1 className="text-5xl sm:text-7xl font-serif font-bold leading-[1.1]">
                Crafting Your <br />
                <span className="text-accent italic">Perfect</span> Moment
              </h1>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              Every gift tells a story. We help you make yours unforgettable with our range of custom cakes, flower bouquets, and unique personalized treasures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/products" className="bg-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg group">
                <span>Shop Collection</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary transition-all active:scale-95">
                Bulk Orders
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated Orbs */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-1 text-left">
            <span className="text-primary font-bold uppercase tracking-widest text-xs">Curated Categories</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 animate-fade-in">Shop by Category</h2>
          </div>
          <Link to="/products" className="text-primary font-bold flex items-center space-x-1 hover:underline group">
            <span>View All</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="categories-wrapper">
          <button
            onClick={() => scrollCategories('left')}
            className="category-arrow left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={categoryScrollRef}
            className="categories-scroll-container scrollbar-hide"
          >
            {categories.map((category, index) => (
              <div key={category.id} className="category-item">
                <Link to={`/products?category=${category.name}`} className="group block text-center">
                  <div className="circle">
                    <img
                      src={category.image}
                      alt={category.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => handleImageError(e, index, category.name)}
                    />
                  </div>
                  <h3 className="font-serif font-bold text-gray-800 group-hover:text-primary transition-colors leading-tight text-sm sm:text-base mt-3">
                    {category.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollCategories('right')}
            className="category-arrow right"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>



      {/* Trending Products */}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end items-start mb-16 gap-6">
            <div className="space-y-4 text-left">
              <span className="text-primary font-bold uppercase tracking-widest text-xs">Curated for you</span>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900">Trending Now</h2>
            </div>
            <Link to="/products" className="text-primary font-bold flex items-center space-x-2 hover:underline group">
              <span>View All Products</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 px-0.5 sm:px-0">
            {trendingProducts.slice(0, 4).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[2rem] p-12 lg:p-16 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center text-white">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Truck className="text-accent" size={32} />
              </div>
              <h4 className="text-xl font-serif font-bold">Fast Delivery</h4>
              <p className="text-white/60 text-sm">Same day delivery available for cakes & flowers in select areas.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <Gift className="text-accent" size={32} />
              </div>
              <h4 className="text-xl font-serif font-bold">Gift Wrapping</h4>
              <p className="text-white/60 text-sm">Premium gift wrapping or custom messages with every order.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <ShieldCheck className="text-accent" size={32} />
              </div>
              <h4 className="text-xl font-serif font-bold">Secure Payment</h4>
              <p className="text-white/60 text-sm">Multiple secure payment options with 100% data protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex items-center gap-16">
        <div className="lg:w-1/2 space-y-8 mb-12 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block bg-accent px-6 py-1 rounded-full text-white font-bold text-xs uppercase tracking-widest"
          >
            Limited Time Offer
          </motion.div>
          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 leading-tight">
            Personalize Your <br /> First Order & Get <br /> <span className="text-primary italic">25% OFF</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
            Join our community of 10,000+ happy gifters. Sign up today and get an exclusive discount on your very first customized creation.
          </p>
          <div className="flex space-x-4">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg">
              Claim Offer
            </button>
            <button className="border-2 border-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-900 hover:text-white transition-all active:scale-95">
              Learn More
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://picsum.photos/seed/offer1/500/700"
              alt="Offer 1"
              referrerPolicy="no-referrer"
              className="rounded-3xl w-full h-[500px] object-cover shadow-2xl translate-y-12"
            />
            <img
              src="https://picsum.photos/seed/offer2/500/700"
              alt="Offer 2"
              referrerPolicy="no-referrer"
              className="rounded-3xl w-full h-[500px] object-cover shadow-2xl -translate-y-12"
            />
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="bg-gray-50 py-24 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-bold text-gray-900">Sign Up for Special Moments</h2>
            <p className="text-gray-500 text-lg">Receive gift ideas, occasion reminders, and exclusive offers right in your inbox.</p>
          </div>
          <div className="max-w-lg mx-auto">
            <Newsletter />
          </div>
          <p className="text-xs text-gray-400 italic">By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>
    </div>
  );
}
