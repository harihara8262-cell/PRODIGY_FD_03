import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    getCartSubtotal,
    getCartTax,
    getCartDeliveryCharge,
    getCartGrandTotal,
    token,
  } = useStore();

  const handleQtyChange = (productId, newQty) => {
    const result = updateCartQuantity(productId, newQty);
    if (result && !result.success) {
      toast.error(result.message);
    }
  };

  const handleCheckoutRedirect = () => {
    if (!token) {
      toast.error('Please sign in to proceed to checkout');
      navigate('/signin', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center transition-colors duration-200">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <ShoppingBag size={56} className="mx-auto text-gray-300 dark:text-gray-600 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart yet. Let's find some fresh local items!
          </p>
          <Link
            to="/products"
            className="mt-6 w-full inline-flex justify-center items-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-md shadow-emerald-500/20 text-sm hover-scale"
          >
            <span>Browse Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <section className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {/* Product Thumbnail */}
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-2xl mr-4 bg-gray-50 dark:bg-gray-900"
              />

              {/* Product Info */}
              <div className="flex-grow min-w-0 pr-4">
                <Link
                  to={`/products/${item.id}`}
                  className="font-bold text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-450 text-base block truncate"
                >
                  {item.name}
                </Link>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Price: ₹{item.price.toFixed(2)}
                </span>
                
                {/* Total Item Price (Mobile-friendly layout position) */}
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-50 block mt-1 sm:hidden">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Adjust Quantity Controls */}
              <div className="flex items-center space-x-2 mr-6">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                    className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-800 dark:text-gray-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                    className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(item.id);
                    toast.success('Removed from cart');
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                  title="Remove Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Total Item Price (Desktop layout position) */}
              <div className="hidden sm:block text-right min-w-[80px]">
                <span className="text-base font-extrabold text-gray-900 dark:text-gray-50">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* Order Summary sidebar panel */}
        <aside className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-4">
            Order Summary
          </h2>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">₹{getCartSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Taxes (5%)</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">₹{getCartTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Charge</span>
              {getCartDeliveryCharge() === 0 ? (
                <span className="text-green-500 font-semibold">Free Delivery</span>
              ) : (
                <span className="font-semibold text-gray-900 dark:text-gray-100">₹{getCartDeliveryCharge().toFixed(2)}</span>
              )}
            </div>
            {getCartDeliveryCharge() > 0 && (
              <p className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md">
                Add <span className="font-bold">{(500 - getCartSubtotal()).toFixed(2)}</span> more to qualify for Free Shipping!
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-end">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200">Grand Total</span>
            <span className="text-2xl font-black text-gray-900 dark:text-gray-50">
              ₹{getCartGrandTotal().toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 hover-scale text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
        </aside>
      </div>
    </div>
  );
}
