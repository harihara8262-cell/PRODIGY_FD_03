import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { profileAPI, orderAPI } from '../services/api';
import { User, Phone, MapPin, Mail, ShoppingBag, Edit, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { logout, role } = useStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'orders'
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const profileRes = await profileAPI.getProfile();
        setProfile(profileRes.data);
        if (profileRes.data) {
          setFullName(profileRes.data.full_name || '');
          setPhone(profileRes.data.phone || '');
          setAddress(profileRes.data.address || '');
        }

        const ordersRes = await orderAPI.getOrders();
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.error('Failed to load profile details', error);
        toast.error('Failed to load account details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName) {
      toast.error('Name field cannot be empty');
      return;
    }

    setUpdating(true);
    try {
      const response = await profileAPI.updateProfile({
        full_name: fullName,
        phone,
        address
      });
      setProfile(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile details', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 transition-colors duration-200">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Profile overview card (Left panel) */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
              {fullName ? fullName[0].toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight truncate">{fullName || 'Customer User'}</h3>
            <p className="text-xs text-gray-400 mt-1 truncate">{profile?.email}</p>
            <span className="inline-block mt-3 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-350 text-[10px] uppercase font-bold rounded-full tracking-wider">
              {role}
            </span>
          </div>

          {/* Quick tab switch list */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'profile'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <User size={16} />
              <span>Profile Details</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                activeTab === 'orders'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ShoppingBag size={16} />
              <span>Order History</span>
            </button>
            
            {role === 'admin' && (
              <Link
                to="/admin"
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center space-x-2"
              >
                <ShieldCheck size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center space-x-2 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Dynamic content panel (Right panel) */}
        <section className="md:col-span-3">
          {activeTab === 'profile' ? (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Edit className="text-emerald-600" size={20} />
                <span>Edit Profile Details</span>
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Email (Cannot change)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={profile?.email || ''}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-100/60 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 focus:outline-none text-sm cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
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

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Default Shipping Address
                  </label>
                  <div className="relative">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, Apt #, City, Zip Code"
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                      <MapPin size={16} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-emerald-500/20 hover-scale disabled:opacity-50"
                >
                  {updating ? 'Saving Details...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                <ShoppingBag className="text-emerald-600" size={20} />
                <span>My Past Orders ({orders.length})</span>
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-semibold text-gray-500 dark:text-gray-400">You haven't ordered any items yet.</p>
                  <Link to="/products" className="mt-3 inline-block text-emerald-600 font-bold hover:underline">
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => (
                    <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block">
                          Date: {new Date(order.created_at).toLocaleDateString()} &bull; Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                        </span>
                        <div className="pt-1">
                          <span className={`inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                            order.status === 'Delivered'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                              : order.status === 'Cancelled'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/orders/${order.id}`}
                        className="mt-2 sm:mt-0 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1 self-start sm:self-center"
                      >
                        <span>Track Order</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
