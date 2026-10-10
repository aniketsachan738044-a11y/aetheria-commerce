import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public Catalog Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* User Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="border-t border-slate-200 bg-white py-8 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
                <p>© {new Date().getFullYear()} Aetheria Commerce. Curated High-Performance Gear & Modern Lifestyle Essentials.</p>
                <p className="mt-1 text-slate-400">Security hardened with Bcrypt, JWT, Helmet, Rate-Limiting and DOMPurify.</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
