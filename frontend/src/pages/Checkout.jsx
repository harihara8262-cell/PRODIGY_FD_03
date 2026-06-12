import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { orderAPI, profileAPI } from '../services/api';
import { MapPin, Phone, User, ShoppingBag, CreditCard, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartSubtotal, getCartTax, getCartDeliveryCharge, getCartGrandTotal } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  // Load profile details to autofill address
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await profileAPI.getProfile();
        const profile = response.data;
        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setAddress(profile.address || '');
        }
      } catch (error) {
        console.error('Failed to load profile details for checkout', error);
      } finally {
        setFetchingProfile(false);
      }
    }
    loadProfile();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      toast.error('Please complete all shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare items payload
      const itemsPayload = cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      // 2. Update profile details in the background first so they are saved for next time
      try {
        await profileAPI.updateProfile({
          full_name: fullName,
          phone,
          address,
        });
      } catch (err) {
        console.error('Failed to update profile info', err);
      }

      // 3. Place order via backend API
      const response = await orderAPI.placeOrder({ items: itemsPayload });
      const placedOrder = response.data;

      // 4. Clean cart and redirect
      clearCart();
      toast.success('Order placed successfully! Preparing your items.');
      navigate(`/orders/${placedOrder.id}`);
    } catch (error) {
      console.error('Checkout failed', error);
      toast.error(error.response?.data?.detail || 'Failed to place order. Please review your stock items.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800">No Items to Checkout</h2>
        <Link to="/products" className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Back button */}
      <Link
        to="/cart"
        className="inline-flex items-center space-x-1 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        <span>Return to Cart</span>
      </Link>

      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Address Form */}
        <section className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <MapPin className="text-emerald-600" size={20} />
              <span>Shipping Information</span>
            </h2>

            {fetchingProfile ? (
              <div className="space-y-4 py-4">
                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-3/4"></div>
                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-1/2"></div>
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse w-full"></div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Receiver Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={16} />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Delivery Shipping Address *
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter full address, including unit numbers, street names, landmarks, and city."
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>

                {/* payment warning */}
                <div className="border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl text-xs flex items-start space-x-2">
                  <CreditCard className="text-emerald-600 mt-0.5" size={16} />
                  <div>
                    <span className="font-bold block text-emerald-800 dark:text-emerald-300">Payment: Cash on Delivery / Pay on Delivery</span>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">For local safety and speed, we support pay-on-delivery. Our driver accepts cards, UPI, or cash at your doorstep.</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Order Items Summary side panel */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base border-b border-gray-200 dark:border-gray-700 pb-3">
              Order Preview
            </h3>

            {/* Cart items list */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex py-3 justify-between items-center text-sm">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-950 dark:text-gray-100 min-w-max">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">${getCartSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5%)</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">${getCartTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                {getCartDeliveryCharge() === 0 ? (
                  <span className="text-green-500 font-semibold">Free</span>
                ) : (
                  <span className="font-semibold text-gray-900 dark:text-gray-200">${getCartDeliveryCharge().toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-end">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-300">Grand Total</span>
              <span className="text-xl font-black text-gray-900 dark:text-gray-50">
                ${getCartGrandTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || fetchingProfile}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 hover-scale text-sm mt-4"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
