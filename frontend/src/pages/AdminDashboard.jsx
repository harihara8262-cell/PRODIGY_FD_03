import React, { useEffect, useState } from 'react';
import { adminAPI, productAPI, orderAPI } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { 
  DollarSign, Package, ShoppingBag, Users, AlertTriangle, 
  TrendingUp, Plus, Edit2, Trash2, Check, X, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_PIPELINE = ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'inventory', 'orders'
  
  // Dashboard metrics states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Inventory states
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  
  // Modals / Product Forms
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Fruits & Vegetables');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Initial stats fetch
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard statistics', error);
      toast.error('Could not fetch analytics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchProducts = async (pageVal = 1) => {
    setLoadingProducts(true);
    try {
      const response = await productAPI.getProducts({ page: pageVal, size: 8 });
      setProducts(response.data.items || []);
      setProductPage(response.data.page);
      setProductTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to load inventory products', error);
      toast.error('Could not fetch products catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await orderAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders', error);
      toast.error('Could not fetch orders list.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') fetchStats();
    if (activeTab === 'inventory') fetchProducts(productPage);
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Fruits & Vegetables');
    setStock('');
    setImageUrl('');
    setFeatured(false);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setCategory(p.category);
    setStock(p.stock);
    setImageUrl(p.image_url || '');
    setFeatured(p.featured || false);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || stock === '') {
      toast.error('Please enter Name, Price, and Stock.');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock, 10),
      image_url: imageUrl || null,
      featured
    };

    try {
      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Product created successfully');
      }
      setShowProductModal(false);
      fetchProducts(productPage);
    } catch (error) {
      toast.error('Failed to save product details.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts(productPage);
      } catch (err) {
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="text-emerald-600" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyze metrics, track user transactions, and manage local warehousing inventory.
          </p>
        </div>

        {/* Tab switch Buttons */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-max mt-4 md:mt-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'analytics' ? 'bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'inventory' ? 'bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Catalog Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Manage Orders
          </button>
        </div>
      </div>

      {/* --- TAB 1: ANALYTICS OVERVIEW --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {loadingStats ? (
            <TableSkeleton rows={4} />
          ) : !stats ? (
            <div className="text-center py-12 text-gray-400">Error loading metrics statistics.</div>
          ) : (
            <>
              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Total Sales */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Total Volume</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-50">${stats.cards.totalSales.toFixed(2)}</span>
                  </div>
                </div>

                {/* Net Revenue */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Net Revenue</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-50">${stats.cards.revenue.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Total Orders</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-50">{stats.cards.ordersCount}</span>
                  </div>
                </div>

                {/* Total Products */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Package size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Warehoused Items</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-50">{stats.cards.productsCount}</span>
                  </div>
                </div>

                {/* Customers count */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-medium">Customers Joined</span>
                    <span className="text-lg font-black text-gray-900 dark:text-gray-50">{stats.cards.customersCount}</span>
                  </div>
                </div>
              </div>

              {/* Charts area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SVG Sales Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">7-Day Sales Overview ($)</h3>
                  
                  {stats.salesOverview.length === 0 ? (
                    <div className="h-60 flex items-center justify-center text-xs text-gray-400">No sales trend data yet</div>
                  ) : (
                    <div className="relative">
                      {/* Responsive HTML/SVG chart */}
                      <svg className="w-full h-60" viewBox="0 0 500 200">
                        {/* Draw horizontal gridlines */}
                        <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-700" />
                        <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-700" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-gray-700" />
                        <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" className="dark:stroke-gray-700" />
                        
                        {/* Map coordinates */}
                        {(() => {
                          const maxVal = Math.max(...stats.salesOverview.map(d => d.sales), 50);
                          const coords = stats.salesOverview.map((d, idx) => {
                            const x = 50 + (idx * 65);
                            const y = 170 - ((d.sales / maxVal) * 140);
                            return { x, y, sales: d.sales, date: d.date };
                          });

                          // Generate polyline points
                          const pointsStr = coords.map(c => `${c.x},${c.y}`).join(' ');
                          const areaPointsStr = `50,170 ${pointsStr} ${coords[coords.length - 1].x},170`;

                          return (
                            <>
                              {/* Area Fill */}
                              <polygon points={areaPointsStr} fill="url(#emerald-gradient)" opacity="0.15" />
                              
                              {/* Trend Line */}
                              <polyline points={pointsStr} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                              
                              {/* Data Dots & Labels */}
                              {coords.map((c, idx) => (
                                <g key={idx} className="group">
                                  <circle cx={c.x} cy={c.y} r="5.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                                  <text x={c.x} y={c.y - 12} fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">
                                    {c.sales > 0 ? `$${c.sales}` : ''}
                                  </text>
                                  <text x={c.x} y="188" fill="#94a3b8" fontSize="8" fontWeight="semibold" textAnchor="middle">
                                    {c.date}
                                  </text>
                                </g>
                              ))}
                              
                              <defs>
                                <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}
                </div>

                {/* SVG Best-Sellers Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Top Products (Revenue)</h3>
                  
                  {stats.topProducts.length === 0 ? (
                    <div className="h-60 flex items-center justify-center text-xs text-gray-400">No sales transactions processed yet</div>
                  ) : (
                    <div className="space-y-4">
                      {stats.topProducts.map((p, idx) => {
                        const maxRev = Math.max(...stats.topProducts.map(t => t.revenue), 10);
                        const pct = (p.revenue / maxRev) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                              <span>{p.name}</span>
                              <span>${p.revenue.toFixed(2)} ({p.quantity} sold)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Lower lists: Recent Orders and Low Stock */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders table */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Recent Orders</h3>
                  
                  {stats.recentOrders.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">No orders placed yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400">
                            <th className="pb-2">Customer</th>
                            <th className="pb-2">Date</th>
                            <th className="pb-2">Total</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                          {stats.recentOrders.map((ord) => (
                            <tr key={ord.id} className="text-gray-700 dark:text-gray-300">
                              <td className="py-2.5">
                                <p className="font-bold">{ord.customer_name}</p>
                                <span className="text-[10px] text-gray-400 block">{ord.customer_email}</span>
                              </td>
                              <td className="py-2.5">{new Date(ord.created_at).toLocaleDateString()}</td>
                              <td className="py-2.5 font-bold">${ord.total_amount.toFixed(2)}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  ord.status === 'Delivered' ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Low Stock items alert */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Inventory Stock Warnings</h3>
                  
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {stats.lowStockProducts.map((p) => {
                      const isOutOfStock = p.stock === 0;
                      return (
                        <div key={p.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-300">{p.name}</p>
                            <span className="text-[10px] text-gray-400">{p.category} &bull; ${p.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <AlertTriangle size={14} className={isOutOfStock ? 'text-red-500' : 'text-amber-500'} />
                            <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-500' : 'text-amber-600'}`}>
                              {p.stock} units left
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- TAB 2: CATALOG INVENTORY GRID (CRUD) --- */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">Product Warehouses Catalog</h3>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover-scale"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>

          {loadingProducts ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 text-xs font-bold">
                      <th className="p-4">Product Info</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        {/* Image + Title */}
                        <td className="p-4 flex items-center space-x-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=80'}
                            alt={p.name}
                            className="h-10 w-10 object-cover rounded-xl bg-gray-100 dark:bg-gray-900"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-xs">{p.name}</p>
                            <span className="text-[10px] text-gray-400 block truncate max-w-xs">{p.description || 'No description'}</span>
                          </div>
                        </td>
                        
                        <td className="p-4 text-xs font-semibold">{p.category}</td>
                        <td className="p-4 font-bold">${parseFloat(p.price).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          {p.featured ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px] font-bold rounded-full">Yes</span>
                          ) : (
                            <span className="text-gray-400 text-xs">No</span>
                          )}
                        </td>
                        
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl"
                              title="Edit product details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-red-550 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Catalog Pagination */}
              {productTotalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                  <button
                    onClick={() => fetchProducts(productPage - 1)}
                    disabled={productPage === 1}
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400">Page {productPage} of {productTotalPages}</span>
                  <button
                    onClick={() => fetchProducts(productPage + 1)}
                    disabled={productPage === productTotalPages}
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: ORDER STATUS ADMINISTRATION --- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">Active & Historical Customer Orders</h3>

          {loadingOrders ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 text-xs font-bold">
                      <th className="p-4">Order Details</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items count</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        {/* ID + Date */}
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-gray-50">#{ord.id.slice(0, 8)}</p>
                          <span className="text-[10px] text-gray-400 block">{new Date(ord.created_at).toLocaleString()}</span>
                        </td>
                        
                        {/* User email */}
                        <td className="p-4">
                          <p className="font-semibold">{ord.user?.full_name || 'Customer'}</p>
                          <span className="text-[10px] text-gray-400 block">{ord.user?.email}</span>
                        </td>

                        {/* Items counts */}
                        <td className="p-4 font-medium">{ord.items?.length || 0} items</td>

                        {/* Price amount */}
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-450">${parseFloat(ord.total_amount).toFixed(2)}</td>

                        {/* Change state pipeline */}
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-semibold focus:outline-none"
                          >
                            {STATUS_PIPELINE.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT DIALOG MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl p-6 space-y-4 animate-scale">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">
                {editingProduct ? 'Edit Product Details' : 'Add New Catalog Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Strawberries"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  >
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block uppercase tracking-wider mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 4.99"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block uppercase tracking-wider mb-1">Stock level *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Product Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Freshly harvested berries, locally farmed."
                    rows={2.5}
                    className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl"
                  />
                </div>

                {/* Featured flag */}
                <div className="sm:col-span-2 flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="featured" className="text-gray-700 dark:text-gray-300 cursor-pointer">
                    Promote as Featured Product on landing page
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover-scale"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
