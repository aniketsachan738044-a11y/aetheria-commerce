import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { sanitize } from '../utils/sanitize';
import { formatINR } from '../utils/formatCurrency';
import { Package, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/myorders');
        setOrders(res.data.orders);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{sanitize(user?.name || '')}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Role: <strong className="capitalize">{user?.role}</strong></span>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center space-x-2">
          <Package className="w-5 h-5 text-indigo-600" />
          <span>Order History ({orders.length})</span>
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="h-10 bg-slate-100 rounded mb-2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">No orders yet</h3>
            <p className="text-xs text-slate-500 mt-1">Orders you place will appear here along with simulated payment status.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">Order ID: {order._id}</span>
                    <span className="text-xs text-slate-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Paid (Simulated)
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatINR(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={sanitize(item.name)}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 line-clamp-1">{sanitize(item.name)}</p>
                          <span className="text-xs text-slate-400">Qty: {item.quantity} × {formatINR(item.price)}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">{formatINR(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping address footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <strong>Shipped to:</strong> {sanitize(order.shippingAddress.street)}, {sanitize(order.shippingAddress.city)}, {sanitize(order.shippingAddress.state)} {sanitize(order.shippingAddress.postalCode)}, {sanitize(order.shippingAddress.country)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
