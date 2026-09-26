import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sliders, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function AdjustmentForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [locationId, setLocationId] = useState('');
  const [productId, setProductId] = useState('');
  const [physicalQty, setPhysicalQty] = useState('');
  const [recordedQty, setRecordedQty] = useState(0);
  const [reason, setReason] = useState('Physical count audit reconciliation');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/locations').then(res => setLocations(res.data)).catch(console.error);
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (locationId && productId) {
      api.get('/stock', { params: { product_id: productId, location_id: locationId } })
        .then(res => {
          if (res.data.length > 0) {
            setRecordedQty(res.data[0].on_hand);
          } else {
            setRecordedQty(0);
          }
        })
        .catch(console.error);
    }
  }, [locationId, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!locationId || !productId || physicalQty === '') {
      return setError('Please fill in location, product and physical quantity');
    }

    setLoading(true);

    try {
      await api.post('/adjustments', {
        location_id: parseInt(locationId, 10),
        product_id: parseInt(productId, 10),
        physical_qty: parseInt(physicalQty, 10),
        reason
      });
      navigate('/adjustments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit inventory adjustment');
    } finally {
      setLoading(false);
    }
  };

  const diff = physicalQty !== '' ? parseInt(physicalQty, 10) - recordedQty : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button onClick={() => navigate('/adjustments')} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Adjustments</span>
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create Inventory Adjustment</h1>
            <p className="text-xs text-slate-400">Reconcile physical stock count with recorded system balance</p>
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
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Target Location</label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Location...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.warehouse_name} / {l.name} ({l.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Select Product</label>
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>[{p.sku}] {p.name} ({p.uom})</option>
                ))}
              </select>
            </div>
          </div>

          {locationId && productId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Current System Recorded Qty</span>
                <span className="text-xl font-bold text-slate-200 mt-1 block">{recordedQty}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Physical Count Qty</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={physicalQty}
                  onChange={(e) => setPhysicalQty(e.target.value)}
                  placeholder="Enter physical count"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block">Stock Difference</span>
                <span className={`text-xl font-bold mt-1 block ${diff < 0 ? 'text-rose-400' : diff > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {diff > 0 ? `+${diff}` : diff}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">Reason / Justification</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for stock adjustment..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => navigate('/adjustments')} className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-semibold rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || physicalQty === ''}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Applying...' : 'Apply Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
