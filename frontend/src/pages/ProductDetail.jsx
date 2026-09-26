import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Package, ArrowLeft, RefreshCw, AlertCircle, Edit, MapPin } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-rose-400 mr-2" />
        <span className="text-sm text-slate-400">Loading product details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
          {error || 'Product not found'}
        </div>
      </div>
    );
  }

  const totalOnHand = product.stock_by_location?.reduce((acc, curr) => acc + parseInt(curr.on_hand, 10), 0) || 0;
  const isLow = totalOnHand <= product.reorder_level && totalOnHand > 0;
  const isOut = totalOnHand === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between no-print">
        <button onClick={() => navigate('/products')} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product Catalog</span>
        </button>

        <button
          onClick={() => navigate(`/products/edit/${id}`)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Product</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase text-rose-400 block font-mono">SKU: {product.sku}</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">{product.name}</h1>
            <span className="text-xs text-slate-400 mt-1 block">Category: {product.category_name || 'Uncategorized'}</span>
          </div>

          <div>
            {isOut ? <StatusBadge status="Out of Stock" /> : isLow ? <StatusBadge status="Low Stock" /> : <StatusBadge status="Available" />}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-800">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block">Unit of Measure</span>
            <span className="text-base font-bold text-white mt-0.5 block">{product.uom}</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block">Per Unit Cost</span>
            <span className="text-base font-bold text-white mt-0.5 block">₹{parseFloat(product.unit_cost).toFixed(2)}</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block">Reorder Threshold</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block">{product.reorder_level} {product.uom}</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block">Total On Hand</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">{totalOnHand} {product.uom}</span>
          </div>
        </div>

        {/* Location Stock Breakdown (As required by spec) */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase text-slate-300 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Inventory Location Breakdown
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Location Name</th>
                  <th className="py-3 px-4">Location Code</th>
                  <th className="py-3 px-4 text-right">On Hand</th>
                  <th className="py-3 px-4 text-right">Free to Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {product.stock_by_location && product.stock_by_location.length > 0 ? (
                  product.stock_by_location.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3.5 px-4 font-medium text-white">{s.warehouse_name}</td>
                      <td className="py-3.5 px-4 text-slate-300">{s.location_name}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{s.location_code}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">{s.on_hand} {product.uom}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-sky-400">{s.free_to_use} {product.uom}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500 italic">No inventory recorded in any specific warehouse location yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
