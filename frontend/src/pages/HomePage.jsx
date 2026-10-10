import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { fallbackProducts } from '../data/fallbackProducts';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Audio', 'Bags', 'Lifestyle'];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'default');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');

  const keyword = searchParams.get('keyword') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 8 };
      if (keyword) params.keyword = keyword;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (sortBy && sortBy !== 'default') params.sortBy = sortBy;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStock = 'true';

      const res = await api.get('/products', { params });
      if (res.data?.data?.products && res.data.data.products.length > 0) {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      } else if (res.data?.products && res.data.products.length > 0) {
        setProducts(res.data.products);
        setPagination(res.data.pagination);
      } else {
        throw new Error('Empty API response');
      }
    } catch {
      // Graceful offline & cloud fallback: filter & sort local static catalog
      let filtered = [...fallbackProducts];
      if (selectedCategory && selectedCategory !== 'All') {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
      if (keyword) {
        const lowerKey = keyword.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerKey) ||
            p.description.toLowerCase().includes(lowerKey)
        );
      }
      if (maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      }
      if (inStockOnly) {
        filtered = filtered.filter((p) => p.stock > 0);
      }

      // Sort
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'newest') {
        filtered.reverse();
      }

      const limit = 8;
      const total = filtered.length;
      const pages = Math.ceil(total / limit) || 1;
      const paginated = filtered.slice((currentPage - 1) * limit, currentPage * limit);

      setProducts(paginated);
      setPagination({ total, page: currentPage, pages, limit });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, selectedCategory, currentPage, sortBy, maxPrice, inStockOnly]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === 'All' || val === 'default' || val === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, val.toString());
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    updateParam('category', cat);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateParam('sortBy', sort);
  };

  const handlePriceChange = (price) => {
    setMaxPrice(price);
    updateParam('maxPrice', price);
  };

  const handleStockToggle = (checked) => {
    setInStockOnly(checked);
    updateParam('inStock', checked ? 'true' : false);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSortBy('default');
    setMaxPrice('');
    setInStockOnly(false);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters =
    selectedCategory !== 'All' || sortBy !== 'default' || maxPrice !== '' || inStockOnly || keyword;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 mb-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 inline-flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Festive Showcase • Pan-India Free Delivery</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Curated gear engineered for modern India.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-indigo-100 max-w-xl leading-relaxed">
            Discover top-tier computing, acoustic audio gear, ergonomic workspace accessories, and luxury Ayurvedic lifestyle essentials with zero import hassle.
          </p>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 hidden sm:inline shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Bar: Sort, Price Filter & In-Stock */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-xl border border-slate-300 py-1.5 px-3 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Featured / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-700">Max Price:</span>
            <select
              value={maxPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="rounded-xl border border-slate-300 py-1.5 px-3 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any Price</option>
              <option value="5000">Under ₹5,000</option>
              <option value="25000">Under ₹25,000</option>
              <option value="50000">Under ₹50,000</option>
              <option value="100000">Under ₹1,00,000</option>
              <option value="150000">Under ₹1,50,000</option>
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => handleStockToggle(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
            />
            <span>In Stock Only</span>
          </label>
        </div>

        <div className="flex items-center justify-between md:justify-end space-x-4 text-xs">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-red-500 hover:text-red-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <div className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{products.length}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.total}</span> items
          </div>
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
          <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
          <p className="text-slate-500 text-sm mt-1">Try relaxing your price filters or selected category.</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
          >
            Clear all filters
          </button>
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
