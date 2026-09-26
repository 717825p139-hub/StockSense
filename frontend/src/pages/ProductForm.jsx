import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Package, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uom, setUom] = useState('pcs');
  const [unitCost, setUnitCost] = useState('0.00');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data)).catch(console.error);

    if (isEdit) {
      api.get(`/products/${id}`).then(res => {
        const p = res.data;
        setSku(p.sku);
        setName(p.name);
        setCategoryId(p.category_id || '');
        setUom(p.uom || 'pcs');
        setUnitCost(p.unit_cost || '0.00');
        setReorderLevel(p.reorder_level || '10');
      }).catch(console.error);
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        sku: sku.trim(),
        name: name.trim(),
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        uom,
        unit_cost: parseFloat(unitCost),
        reorder_level: parseInt(reorderLevel, 10)
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button onClick={() => navigate('/products')} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Catalog</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
            <p className="text-xs text-slate-400">Manage item master data, SKU and reorder thresholds</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">SKU / Item Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. STEEL001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Steel Rod"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">Select Category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Unit of Measure (UOM)</label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="pcs">pcs (Pieces)</option>
                <option value="kg">kg (Kilograms)</option>
                <option value="packs">packs (Packs)</option>
                <option value="meters">meters</option>
                <option value="liters">liters</option>
                <option value="boxes">boxes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Unit Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Reorder Threshold Level</label>
            <input
              type="number"
              min="0"
              required
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Triggers LOW STOCK alert when total on-hand drops to or below this quantity.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => navigate('/products')} className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
