import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { CardSkeleton } from '../components/Skeleton';
import { SlidersHorizontal, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery & Bread'];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for immediate inputs, synced to URL on submit
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('min_price') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('max_price') || '');
  
  // API result states
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read URL params
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Sync inputs with URL changes (e.g., if user searches from navbar)
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setMinPriceInput(searchParams.get('min_price') || '');
    setMaxPriceInput(searchParams.get('max_price') || '');
  }, [searchParams]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {
          page,
          size: 8,
          category: category !== 'All' ? category : undefined,
          search: search || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          sort_by: sortBy,
        };
        const response = await productAPI.getProducts(params);
        setProducts(response.data.items || []);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.pages || 0);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, search, minPrice, maxPrice, sortBy, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(newParams);
  };

  const handleApplyPrice = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (minPriceInput) newParams.set('min_price', minPriceInput);
    else newParams.delete('min_price');
    if (maxPriceInput) newParams.set('max_price', maxPriceInput);
    else newParams.delete('max_price');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shop Local Catalog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {products.length} of {totalItems} items
          </p>
        </div>
        
        {/* Sort and Mobile Filters Toggle */}
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort_by', e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
          >
            <option value="created_at">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-8">
          {/* Category Filter */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-4">Categories</h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => updateParam('category', cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-sm transition-all font-medium flex justify-between items-center ${
                    category === cat
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-4">Price Range</h3>
            <form onSubmit={handleApplyPrice} className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-400 dark:text-gray-600 text-sm">to</span>
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all hover-scale shadow-sm"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={handleResetFilters}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-semibold text-sm rounded-2xl flex items-center justify-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset All Filters</span>
          </button>
        </aside>

        {/* Mobile Filters Drawer (Modal overlay) */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden flex justify-end">
            <div className="bg-white dark:bg-gray-800 w-80 max-w-full h-full p-6 overflow-y-auto shadow-2xl flex flex-col space-y-6 animate-slide">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  Close
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-3">Categories</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateParam('category', cat);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                        category === cat
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-3">Price Range</h4>
                <form
                  onSubmit={(e) => {
                    handleApplyPrice(e);
                    setShowMobileFilters(false);
                  }}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm"
                  >
                    Apply
                  </button>
                </form>
              </div>

              <button
                onClick={() => {
                  handleResetFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 mt-auto"
              >
                <RotateCcw size={16} />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        )}

        {/* Product Grid and Catalog listing */}
        <section className="lg:col-span-3 space-y-8">
          {/* Inline Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-2 max-w-md">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
              <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-1">No products found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                We couldn't find any items matching your selected criteria. Try adjusting your filters or search term.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Page <span className="font-semibold text-gray-800 dark:text-gray-200">{page}</span> of{' '}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPages}</span>
                  </span>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center space-x-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
