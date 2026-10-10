import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatCurrency';
import { sanitize } from '../utils/sanitize';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = React.useState(null);

  const handleMoveToCart = async (product) => {
    try {
      setMovingId(product._id);
      await addToCart(product._id, 1);
      await removeFromWishlist(product._id);
    } catch (err) {
      alert(err.message || 'Failed to add item to bag.');
    } finally {
      setMovingId(null);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Heart className="w-10 h-10 fill-pink-100" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Save your favorite computing hardware, audio monitors, and minimalist lifestyle goods here to easily purchase them later.
        </p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
            <span>Saved Wishlist</span>
            <span className="text-sm font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review saved products and transfer them to your cart whenever ready.</p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>Continue Browsing</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const isMoving = movingId === product._id;
          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-slate-100 overflow-hidden group">
                <img
                  src={product.image}
                  alt={sanitize(product.name)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-800 capitalize shadow-sm">
                  {sanitize(product.category)}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs mb-1.5 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating || 4.8}</span>
                    <span className="text-slate-400">({product.numReviews || 0})</span>
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                      {sanitize(product.name)}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sanitize(product.description)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900">
                      {formatINR(product.price)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock <= 0 || isMoving}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isMoving ? 'Moving...' : 'Move to Bag'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
