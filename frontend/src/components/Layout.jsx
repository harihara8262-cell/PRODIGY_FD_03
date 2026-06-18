import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { useStore } from '../store/useStore';
import { Toaster } from 'react-hot-toast';
import { Phone, MapPin, Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function Layout({ children }) {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  useEffect(() => {
    // Sync Tailwind HTML class with persisted Zustand theme state
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Premium Toast Container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '16px',
            fontSize: '14px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Navbar />

      <main className="flex-grow">
        {children}
      </main>

      {/* Trust Badges */}
      <section className="bg-emerald-50 dark:bg-gray-950 border-t border-b border-emerald-100 dark:border-gray-900 py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
              <div className="p-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-950 dark:text-gray-200">Free & Fast Delivery</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Free delivery for all orders above ₹500</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
              <div className="p-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-950 dark:text-gray-200">Secure Payments</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">100% secure payment gateway</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
              <div className="p-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-950 dark:text-gray-200">Easy Returns</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">7-day hassle-free replacement policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                LocalCart
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Your neighborhood grocery and essential goods delivery. Connecting you directly with local warehouses for ultra-fast, fresh deliveries.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="/products" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Shop Catalog</a>
                </li>
                <li>
                  <a href="/cart" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">My Shopping Cart</a>
                </li>
                <li>
                  <a href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Profile Details</a>
                </li>
              </ul>
            </div>

            {/* Help / Policy */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-4">Customer Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <span className="text-gray-600 dark:text-gray-400">FAQs & Help Center</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-400">Terms of Service</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-400">Privacy Policy</span>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-4">Get in Touch</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="text-emerald-600" />
                <span>123 Local Street, Cityville, NY</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={16} className="text-emerald-600" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail size={16} className="text-emerald-600" />
                <span>support@localcart.com</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-900 text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} LocalCart Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
