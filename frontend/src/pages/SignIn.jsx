import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ShieldCheck, ArrowRight, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase, isMockAuth } from '../services/supabase';
import toast from 'react-hot-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useStore((state) => state.setUser);
  
  // Phone states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Send OTP verification SMS code
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number (e.g. +15551234567)');
      return;
    }

    setLoading(true);

    try {
      if (isMockAuth) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success('[Mock OTP] Verification code 123456 sent!');
        setOtpSent(true);
      } else {
        // Supabase sends SMS OTP code
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone,
        });

        if (error) throw error;

        toast.success('Verification code sent to your phone!');
        setOtpSent(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP code. Ensure E.164 format (+CountryCodePhone).');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP code and authenticate
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);

    try {
      if (isMockAuth) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        if (otp === '123456') {
          // Check if phone number contains "9999" (e.g. for testing admin role)
          const isAdminPhone = phone.includes('9999');
          const mockUser = {
            id: isAdminPhone ? '11111111-1111-1111-1111-111111111111' : '44444444-4444-4444-4444-444444444444',
            email: `${phone.replace('+', '')}@phone.placeholder.com`,
            phone: phone,
            user_metadata: {
              full_name: isAdminPhone ? 'Admin Phone User' : 'OTP Customer User',
              phone: phone,
              role: isAdminPhone ? 'admin' : 'customer'
            }
          };
          const mockToken = isAdminPhone ? 'mock-jwt-admin-token-value' : 'mock-jwt-phone-token-value';
          
          setUser(mockUser, mockToken);
          toast.success(`Logged in as ${isAdminPhone ? 'Admin' : 'Customer'}`);
          navigate(isAdminPhone ? '/admin' : from, { replace: true });
        } else {
          toast.error('Invalid verification code. Enter 123456.');
        }
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms',
        });

        if (error) throw error;

        if (data?.user && data?.session) {
          const userToken = data.session.access_token;
          setUser(data.user, userToken);
          
          const isUserAdmin = data.user.email?.toLowerCase().includes('admin') || 
                             data.user.user_metadata?.role === 'admin';
          
          toast.success('Mobile verification successful!');
          navigate(isUserAdmin ? '/admin' : from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Incorrect verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl transition-all">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign In with Mobile
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your mobile number to receive a one-time verification code
          </p>
        </div>

        {/* Demo Credentials alert in Mock Mode */}
        {isMockAuth && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-4 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="font-bold block mb-1">Mock OTP Mode Active:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Customer OTP: enter any number, use OTP <code className="bg-white/60 dark:bg-black/30 px-1 py-0.2 rounded font-bold">123456</code></li>
              <li>Admin OTP: enter number containing <code className="bg-white/60 dark:bg-black/30 px-1 py-0.2 rounded font-bold">9999</code>, use OTP <code className="bg-white/60 dark:bg-black/30 px-1 py-0.2 rounded font-bold">123456</code></li>
            </ul>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <div className="space-y-4">
            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Phone Number (E.164 Format)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +15551234567"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone size={18} />
                </div>
              </div>
            </div>

            {/* OTP input */}
            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm tracking-widest text-center font-bold"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-emerald-500/20 disabled:opacity-50 hover-scale"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : otpSent ? (
              <>
                <span>Verify OTP & Sign In</span>
                <LogIn size={18} />
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {otpSent && (
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors py-1"
            >
              Change Phone Number
            </button>
          )}
        </form>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          * If you don't have an account, one will be created automatically.
        </p>
      </div>
    </div>
  );
}
