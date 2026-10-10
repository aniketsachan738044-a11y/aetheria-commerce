import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { sanitize } from '../utils/sanitize';
import { formatINR } from '../utils/formatCurrency';
import api from '../services/api';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Tag,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const SUGGESTED_COUPONS = [
  { code: 'WELCOME10', label: '10% OFF (Above ₹500)' },
  { code: 'AETHERIA500', label: 'Flat ₹500 OFF (Above ₹2,499)' },
  { code: 'FESTIVE20', label: '20% Festive Savings (Above ₹1,500)' },
  { code: 'FREESHIP', label: 'Free Delivery' },
];

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;

  // Calculate delivery & discounts
  let shipping = subtotal >= 999 ? 0 : 99;
  let discount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.type === 'shipping') {
      shipping = 0;
      discount = 99;
    } else {
      discount = appliedCoupon.discount || 0;
    }
  }

  const taxableBase = Math.max(0, subtotal - discount);
  const estimatedGst = Math.round(taxableBase * 0.18);
  const total = taxableBase + shipping + estimatedGst;

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal,
      });

      if (res.data?.data) {
        setAppliedCoupon(res.data.data);
        setCouponCode('');
      }
    } catch (err) {
      // Local fallback calculation if offline
      if (code === 'WELCOME10' && subtotal >= 500) {
        setAppliedCoupon({
          code: 'WELCOME10',
          discount: Math.min(Math.round(subtotal * 0.1), 1000),
          type: 'percentage',
        });
        setCouponCode('');
      } else if (code === 'AETHERIA500' && subtotal >= 2499) {
        setAppliedCoupon({ code: 'AETHERIA500', discount: 500, type: 'flat' });
        setCouponCode('');
      } else if (code === 'FESTIVE20' && subtotal >= 1500) {
        setAppliedCoupon({
          code: 'FESTIVE20',
          discount: Math.min(Math.round(subtotal * 0.2), 2000),
          type: 'percentage',
        });
        setCouponCode('');
      } else if (code === 'FREESHIP') {
        setAppliedCoupon({ code: 'FREESHIP', discount: 99, type: 'shipping' });
        setCouponCode('');
      } else {
        setCouponError(
          err.response?.data?.message || err.message || 'Invalid or unapplicable coupon code.'
        );
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
        <p className="text-slate-500 text-sm">Loading your cart items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 text-sm mb-6">Looks like you haven't added any products to your bag yet.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Shopping Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-600">{items.length} unique items</span>
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-red-500 hover:text-red-700"
            >
              Clear Bag
            </button>
          </div>

          {items.map((item) => {
            const product = item.product || {};
            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm"
              >
                <img
                  src={product.image}
                  alt={sanitize(product.name || 'Product')}
                  className="w-24 h-24 object-cover rounded-xl bg-slate-100"
                />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    to={`/products/${product._id}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                  >
                    {sanitize(product.name || 'Product')}
                  </Link>
                  <div className="text-xs text-slate-400 mt-1 capitalize">{product.category}</div>
                  <div className="text-sm font-bold text-slate-900 mt-2">
                    {formatINR(item.price)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(product._id, Number(e.target.value))}
                    className="rounded-lg border border-slate-300 py-1.5 px-3 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[...Array(Math.min(product.stock || 10, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupons */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <span>Have a Promo Coupon?</span>
            </h3>

            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-800 text-xs flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    {appliedCoupon.code} Applied
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Saved {formatINR(discount)} on this order
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <p className="text-xs text-red-600 flex items-center">
                    <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}

                {/* Available Quick Chips */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Available Offers:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_COUPONS.map((sc) => (
                      <button
                        key={sc.code}
                        onClick={() => handleApplyCoupon(sc.code)}
                        className="text-[10px] font-bold border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg transition-colors"
                      >
                        {sc.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Price Details</h2>

            <div className="space-y-3 text-sm text-slate-600 border-b border-slate-100 pb-5">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="flex items-center">
                  <span>Delivery Charges</span>
                  {shipping === 0 && <Truck className="w-3.5 h-3.5 ml-1 text-emerald-600" />}
                </span>
                <span className="font-semibold text-slate-800">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatINR(shipping)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-slate-800">{formatINR(estimatedGst)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-base font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-2xl text-indigo-600">{formatINR(total)}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Buy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Secure checkout powered by simulated UPI & NetBanking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
