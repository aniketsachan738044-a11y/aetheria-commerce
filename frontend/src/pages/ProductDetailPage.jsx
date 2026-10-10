import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { sanitize } from '../utils/sanitize';
import { formatINR } from '../utils/formatCurrency';
import { Star, ShieldCheck, Truck, RotateCcw, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        setError(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6">{error || 'The requested product does not exist.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-indigo-600 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to results</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery / Image View */}
        <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-sm overflow-hidden">
          <img
            src={product.image}
            alt={sanitize(product.name)}
            className="w-full aspect-square object-contain rounded-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
              {sanitize(product.category)}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {sanitize(product.name)}
            </h1>

            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-sm font-bold text-slate-800">{product.rating}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500">{product.numReviews} Verified Reviews</span>
            </div>

            <div className="mt-6 pb-6 border-b border-slate-200">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatINR(product.price)}
              </span>
              <span className="ml-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                In Stock ({product.stock} units available)
              </span>
              <div className="text-xs text-slate-500 mt-1 font-medium">Inclusive of all Indian taxes (GST)</div>
            </div>

            <div className="py-6 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Product Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {sanitize(product.description)}
              </p>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="py-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-semibold text-slate-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={product.stock <= 0}
                  className="rounded-xl border border-slate-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || adding}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
                </button>
              </div>

              {addedSuccess && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold animate-fade-in">
                  ✓ Item successfully added to your cart!
                </div>
              )}
            </div>

            {/* Feature Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>Pan-India Express Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>100% Genuine with Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
