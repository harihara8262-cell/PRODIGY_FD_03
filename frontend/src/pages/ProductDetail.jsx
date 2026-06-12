import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Minus, Plus, ShoppingCart, Shield, Truck, AlertTriangle } from 'lucide-react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { DetailSkeleton } from '../components/Skeleton';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProductDetails() {
      setLoading(true);
      try {
        const prodRes = await productAPI.getProduct(id);
        const prod = prodRes.data;
        setProduct(prod);
        setQuantity(1);

        // Fetch related products in the same category
        if (prod && prod.category) {
          const relatedRes = await productAPI.getProducts({ category: prod.category, size: 5 });
          const relatedItems = relatedRes.data.items || [];
          // Filter out current product
          setRelatedProducts(relatedItems.filter((item) => item.id !== prod.id).slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to load product details', error);
        toast.error('Product not found or error loading product.');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    }

    loadProductDetails();
  }, [id, navigate]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!product) {
    return null;
  }

  const price = parseFloat(product.price).toFixed(2);
  const stock = product.stock;

  const handleQtyChange = (type) => {
    if (type === 'inc') {
      if (quantity >= stock) {
        toast.error(`Only ${stock} items available in stock.`);
        return;
      }
      setQuantity((q) => q + 1);
    } else {
      if (quantity > 1) {
        setQuantity((q) => q - 1);
      }
    }
  };

  const handleAddToCart = () => {
    const result = addToCart(product, quantity);
    if (result && !result.success) {
      toast.error(result.message);
    } else {
      toast.success(`${quantity}x ${product.name} added to cart!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center space-x-1 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Large Product Image */}
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 aspect-[4/3] sm:aspect-square flex items-center justify-center">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.featured && (
            <span className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Featured selection
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-50 mt-2">
              ${price}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-800 py-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Stock Availability</h3>
            {stock === 0 ? (
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full">
                <AlertTriangle size={14} />
                <span>Currently Out of Stock</span>
              </div>
            ) : stock <= 5 ? (
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full">
                <AlertTriangle size={14} />
                <span>Critical Stock: Only {stock} items left!</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full">
                <span>In Stock & Ready for Delivery ({stock} items available)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Product Description</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {product.description || 'No detailed description available for this local product.'}
            </p>
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
            {stock > 0 && (
              <div className="flex items-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl p-1.5 w-max">
                <button
                  onClick={() => handleQtyChange('dec')}
                  className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-800 dark:text-gray-100">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQtyChange('inc')}
                  className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-255 transition-colors"
                  disabled={quantity >= stock}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="flex-grow flex items-center justify-center space-x-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/20 disabled:shadow-none transition-all hover-scale"
            >
              <ShoppingCart size={18} />
              <span>{stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
            <div className="flex items-start space-x-2">
              <Truck className="text-emerald-600 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Local Delivery</p>
                <p className="text-[10px] text-gray-400">Arrives in 30 mins</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="text-emerald-600 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Freshness Guaranteed</p>
                <p className="text-[10px] text-gray-400">100% Organic & Clean</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-gray-50 mb-8">
            Customers Also Bought
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
