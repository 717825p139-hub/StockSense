import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Filter, RefreshCw, Package, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { search, category_id: categoryId } });
      setProducts(res.data);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-400" />
            Product Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage inventory items, SKUs, reorder thresholds, and categories
          </p>
        </div>

        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PRODUCT</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or product name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500/80"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
            <span>Loading product list...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">UOM</th>
                  <th className="py-3.5 px-5 text-right">Unit Cost (₹)</th>
                  <th className="py-3.5 px-5 text-right">Reorder Level</th>
                  <th className="py-3.5 px-5 text-right">Total On Hand</th>
                  <th className="py-3.5 px-5">Stock Alert</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {products.map((p) => {
                  const onHand = parseInt(p.total_on_hand, 10);
                  const isLow = onHand <= p.reorder_level && onHand > 0;
                  const isOut = onHand === 0;
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-rose-400 group-hover:underline">{p.sku}</td>
                      <td className="py-4 px-5 font-medium text-white">{p.name}</td>
                      <td className="py-4 px-5 text-slate-400">{p.category_name || 'Uncategorized'}</td>
                      <td className="py-4 px-5 text-slate-400">{p.uom}</td>
                      <td className="py-4 px-5 text-right font-medium text-slate-300">₹{parseFloat(p.unit_cost).toFixed(2)}</td>
                      <td className="py-4 px-5 text-right font-medium text-slate-400">{p.reorder_level}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-white">{onHand}</td>
                      <td className="py-4 px-5">
                        {isOut ? (
                          <StatusBadge status="Out of Stock" />
                        ) : isLow ? (
                          <StatusBadge status="Low Stock" />
                        ) : (
                          <StatusBadge status="Available" />
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 group-hover:text-rose-300">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
