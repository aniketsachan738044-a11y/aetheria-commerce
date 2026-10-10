import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatINR } from '../utils/formatCurrency';
import { ShieldCheck, CheckCircle2, Lock, Smartphone } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: 'Plot No. 42, Hitech City Main Road, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500081',
    country: 'India',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(null);

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/orders', {
        shippingAddress: address,
      });
      await refreshCart();
      setOrderComplete(res.data.order);
    } catch (err) {
      setError(err.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Payment Confirmed (Simulated UPI)
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2">Order Successfully Placed!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your order has been recorded and marked as paid. Order ID:
          <span className="font-mono text-slate-800 font-semibold block mt-1">{orderComplete._id}</span>
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">UPI Ref / Txn ID:</span>
            <span className="font-mono font-medium text-slate-700">{orderComplete.paymentResult.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-bold text-slate-900">{formatINR(orderComplete.totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Delivery Status:</span>
            <span className="font-semibold text-emerald-600">Dispatched via BlueDart / Delhivery (Simulated)</span>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-sm transition-all"
          >
            Track in Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold px-6 py-3 rounded-2xl transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Checkout & Delivery Details</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <span>Delivery Address (India)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Flat / House No. / Building / Street</label>
                <input
                  type="text"
                  name="street"
                  required
                  value={address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Town</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code (6 Digits)</label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={address.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={address.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Notice */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex items-start space-x-4">
            <Smartphone className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Simulated Indian Payment Gateway (UPI / NetBanking / Cards)</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                Orders are processed instantly in test mode. No real rupee transactions or debit cards are debited.
                Completing will deduct live inventory stock and generate your simulated Indian order invoice.
              </p>
            </div>
          </div>
        </div>

        {/* Order Review & Pay Action */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Order Summary ({items.length} items)</h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-xs text-slate-600">
                <span className="line-clamp-1 pr-2">
                  {item.quantity}x {item.product?.name}
                </span>
                <span className="font-bold text-slate-800">{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-800">
                {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-800">{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-2xl text-indigo-600">{formatINR(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Confirming UPI Payment...' : 'Pay & Complete Order (Simulated)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
