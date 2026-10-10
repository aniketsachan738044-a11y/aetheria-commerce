import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Audio', 'Bags', 'Lifestyle'];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  const keyword = searchParams.get('keyword') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 8 };
      if (keyword) params.keyword = keyword;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, selectedCategory, currentPage]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
            Festive Season & Tech Showcase • Pan-India Free Delivery
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Curated gear engineered for modern India.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-indigo-100 max-w-xl leading-relaxed">
            Discover top-tier computing, acoustic audio gear, ergonomic workspace accessories, and luxury Ayurvedic lifestyle essentials with zero import hassle.
          </p>
        </div>
      </div>

      {/* Filter Chips & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{products.length}</span> of{' '}
          <span className="font-bold text-slate-800">{pagination.total}</span> items
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="aspect-square bg-slate-200 rounded-xl mb-4" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-6 bg-slate-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your category filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.pages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {[...Array(pagination.pages)].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.pages}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
