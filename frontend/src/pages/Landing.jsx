import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, ChevronRight, Apple, Milk, ChefHat, Sparkles } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { CardSkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { name: 'Fruits & Vegetables', icon: Apple, color: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400' },
  { name: 'Dairy & Eggs', icon: Milk, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  { name: 'Bakery & Bread', icon: ChefHat, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const response = await productAPI.getProducts({ featured: true, size: 4 });
        setFeaturedProducts(response.data.items || []);
      } catch (error) {
        console.error('Failed to load featured products', error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16 transition-colors duration-200">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/20 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-100/60 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full text-emerald-800 dark:text-emerald-350 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Fastest local grocery delivery service</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Freshness Delivered to <br />
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                Your Doorstep
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0">
              Get organic vegetables, farm-fresh dairy products, bakery breads, and everyday local essentials delivered in under 30 minutes.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto lg:mx-0 flex items-center space-x-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="What are you looking for today?"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md shadow-emerald-100/10 dark:shadow-none text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={20} />
                </div>
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-500/20 text-sm hover-scale"
              >
                Search
              </button>
            </form>
          </div>

          {/* Hero Image / Illustration */}
          <div className="relative flex justify-center items-center">
            <div className="absolute -inset-4 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full filter blur-3xl opacity-70"></div>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
              alt="Fresh Local Grocery Produce"
              className="relative rounded-3xl shadow-2xl w-full max-w-lg object-cover aspect-[4/3] border border-gray-200 dark:border-gray-800"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Browse by Categories
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a category to filter your grocery search
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            <span>See All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex items-center p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-0.5 group"
            >
              <div className={`p-4 rounded-2xl ${cat.color} mr-4 transition-colors`}>
                <cat.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">
                  Browse items
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Handpicked organic selections from our warehouses
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            <span>Browse Catalog</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No featured products available at the moment.</p>
            <Link
              to="/products"
              className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
