import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { sanitize } from '../utils/sanitize';
import { formatINR } from '../utils/formatCurrency';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal >= 999 ? 0 : 99; // Free shipping in India on orders >= ₹999
  const estimatedGst = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + estimatedGst;

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

        {/* Order Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 h-fit shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Price Details</h2>

          <div className="space-y-3 text-sm text-slate-600 border-b border-slate-100 pb-5">
            <div className="flex justify-between">
              <span>Bag Subtotal</span>
              <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center">
                <span>Delivery Charges</span>
                {shipping === 0 && <Truck className="w-3.5 h-3.5 ml-1 text-emerald-600" />}
              </span>
              <span className="font-semibold text-slate-800">
                {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE (Above ₹999)</span> : formatINR(shipping)}
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
            onClick={() => navigate('/checkout')}
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
  );
}
