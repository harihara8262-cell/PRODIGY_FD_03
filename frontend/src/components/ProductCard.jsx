import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const addToCart = useStore((state) => state.addToCart);

  const handleAddToCart = (e) => {
    e.preventDefault();
    const result = addToCart(product, 1);
    if (result && !result.success) {
      toast.error(result.message);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const price = parseFloat(product.price).toFixed(2);
  const stock = product.stock;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Product Image & Overlays */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-100 dark:bg-gray-700 pt-[100%]">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Featured Tag */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md z-10">
            Featured
          </span>
        )}
        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-10">
          <span
            className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
            title="View Details"
          >
            <Eye size={18} />
          </span>
        </div>
      </Link>

      {/* Info details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
          {product.category}
        </span>
        
        {/* Title */}
        <Link 
          to={`/products/${product.id}`} 
          className="text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-base line-clamp-1 mb-2"
        >
          {product.name}
        </Link>
        
        {/* Stock Indicators */}
        <div className="mb-4 text-xs font-medium">
          {stock === 0 ? (
            <span className="text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">Out of Stock</span>
          ) : stock <= 5 ? (
            <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Only {stock} left!</span>
          ) : (
            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">In Stock</span>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold text-gray-900 dark:text-gray-50">
                ₹{price}
              </span>
              {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{parseFloat(product.original_price).toFixed(0)}
                </span>
              )}
            </div>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 mt-0.5">
                {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% OFF
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
              stock === 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-100 dark:border-emerald-900'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
