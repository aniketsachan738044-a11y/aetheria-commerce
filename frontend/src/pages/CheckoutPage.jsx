import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatINR } from '../utils/formatCurrency';
import InvoiceModal from '../components/InvoiceModal';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  Printer,
  FileText,
  Tag,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [couponCode, setCouponCode] = useState(location.state?.appliedCoupon || '');
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;

  // Calculate pricing with coupon discount
  let discount = 0;
  let shipping = subtotal >= 999 ? 0 : 99;

  if (couponCode === 'WELCOME10' && subtotal >= 500) {
    discount = Math.min(Math.round(subtotal * 0.1), 1000);
  } else if (couponCode === 'AETHERIA500' && subtotal >= 2499) {
    discount = 500;
  } else if (couponCode === 'FESTIVE20' && subtotal >= 1500) {
    discount = Math.min(Math.round(subtotal * 0.2), 2000);
  } else if (couponCode === 'FREESHIP') {
    shipping = 0;
    discount = 99;
  }

  const taxableBase = Math.max(0, subtotal - discount);
  const gst = Math.round(taxableBase * 0.18);
  const total = taxableBase + shipping + gst;

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
        couponCode: couponCode || undefined,
      });
      await refreshCart();
      setOrderComplete(res.data.data ? res.data.data.order : res.data.order);
    } catch (err) {
      setError(err.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Payment Confirmed ({paymentMethod} Mode)
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2">Order Successfully Placed!</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your order has been recorded and marked as paid. Order ID:
          <span className="font-mono text-slate-800 font-semibold block mt-1">{orderComplete._id}</span>
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 mb-8 text-left text-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Txn / Payment Ref:</span>
            <span className="font-mono font-medium text-slate-700">
              {orderComplete.paymentResult?.id || 'SIM_TXN'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tracking AWB:</span>
            <span className="font-mono font-bold text-slate-900">
              {orderComplete.trackingNumber || 'DEL-88392193'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Paid:</span>
            <span className="font-bold text-indigo-600 text-base">
              {formatINR(orderComplete.totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fulfillment Status:</span>
            <span className="font-semibold text-emerald-600">Dispatched via BlueDart / Delhivery</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all text-xs"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Download GST Invoice</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all text-xs"
          >
            Track in Orders
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold px-5 py-3 rounded-2xl transition-all text-xs"
          >
            Continue Shopping
          </button>
        </div>

        {showInvoiceModal && (
          <InvoiceModal order={orderComplete} onClose={() => setShowInvoiceModal(false)} />
        )}
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
        {/* Shipping Form & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <span>Delivery Address (Pan-India)</span>
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Select Payment Method (India)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">UPI Instant Pay</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">GPay, PhonePe, Paytm QR</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Card'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">Debit / Credit Card</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">RuPay, Visa, Mastercard</p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NetBanking')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'NetBanking'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-xs text-slate-900">NetBanking</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">HDFC, SBI, ICICI & 50+ Banks</p>
              </button>
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

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({couponCode})</span>
                <span>- {formatINR(discount)}</span>
              </div>
            )}

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
            <span>
              {submitting
                ? 'Confirming Payment...'
                : `Pay ${formatINR(total)} via ${paymentMethod} (Simulated)`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
