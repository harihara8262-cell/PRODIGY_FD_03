import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { Check, Clock, Package, Truck, Compass, CheckCircle2, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { TableSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Packed', label: 'Packed', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out For Delivery', label: 'Out For Delivery', icon: Compass },
  { key: 'Delivered', label: 'Delivered', icon: Check },
];

export default function OrderHistory() {
  const { id } = useParams(); // URL parameter for single order tracking
  const [orders, setOrders] = useState([]);
  const [singleOrder, setSingleOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrderData() {
      setLoading(true);
      try {
        if (id) {
          // Track specific order
          const response = await orderAPI.getOrderDetails(id);
          setSingleOrder(response.data);
        } else {
          // List all user orders
          const response = await orderAPI.getOrders();
          setOrders(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load order history details', error);
        toast.error('Failed to load order information.');
      } finally {
        setLoading(false);
      }
    }
    loadOrderData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  // --- VIEW 1: SINGLE ORDER TRACKING TIMELINE ---
  if (id && singleOrder) {
    const currentStatus = singleOrder.status;
    const isCancelled = currentStatus === 'Cancelled';
    
    // Find index of current status in the pipeline
    const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === currentStatus);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 transition-colors duration-200">
        <div className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6">
          <Link to="/profile">My Profile</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 dark:text-gray-100 font-semibold">Track Order #{singleOrder.id.slice(0, 8)}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-gray-950 dark:text-gray-50">
                Order #{singleOrder.id.slice(0, 8)}
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Placed on {new Date(singleOrder.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <span className="text-xs text-gray-400 block">Grand Total</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₹{parseFloat(singleOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Timeline UI */}
          {isCancelled ? (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/60 p-4 rounded-2xl flex items-center space-x-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={18} />
              <span className="font-semibold">This order was Cancelled. If this was a mistake, please reach support.</span>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Real-time Order Timeline</h3>
              
              {/* Desktop Timeline */}
              <div className="hidden md:flex justify-between items-center relative pr-4">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                ></div>

                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
                      <div className={`p-3 rounded-full border-2 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                      } ${isActive ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/40 animate-pulse' : ''}`}>
                        <Icon size={16} />
                      </div>
                      <span className={`text-[10px] font-bold mt-2.5 block ${
                        isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden space-y-5 pl-2 relative border-l border-gray-200 dark:border-gray-700 ml-4 py-2">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center space-x-3.5 relative">
                      {/* Left indicator dot */}
                      <div className={`absolute -left-[23px] p-1.5 rounded-full border ${
                        isCompleted 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                      } ${isActive ? 'ring-4 ring-emerald-100 dark:ring-emerald-950/30' : ''}`}>
                        <Icon size={12} />
                      </div>
                      <span className={`text-xs font-bold ${
                        isCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'
                      }`}>
                        {step.label} {isActive && '(Current status)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items Purchased details */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Items Ordered</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {singleOrder.items?.map((item) => (
                <div key={item.id} className="flex py-3.5 justify-between items-center text-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-gray-800 dark:text-gray-200 truncate">
                      {item.product?.name || 'Local Grocery Item'}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Qty: {item.quantity} &times; ₹{parseFloat(item.price_at_purchase).toFixed(2)}
                    </span>
                  </div>
                  <span className="font-extrabold text-gray-900 dark:text-gray-100">
                    ₹{(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: MULTIPLE ORDERS LIST ---
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 transition-colors duration-200">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8">
          <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-1 mb-4 sm:mb-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  ORDER ID: #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 block font-medium">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2 pt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered' 
                      ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-450' 
                      : order.status === 'Cancelled'
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-450'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
                >
                  <span>Track Status</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
