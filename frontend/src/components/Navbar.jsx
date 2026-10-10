import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearch }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/?keyword=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              Æ
            </span>
            <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:inline">
              Aetheria<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-slate-50 transition-all duration-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-indigo-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user?.name}</span>
                </Link>

                {isAdmin && (
                  <span className="hidden lg:inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Admin
                  </span>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-50"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
