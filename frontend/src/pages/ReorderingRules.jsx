import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sliders, Plus, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ReorderingRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [minQty, setMinQty] = useState('10');
  const [maxQty, setMaxQty] = useState('100');
  const [error, setError] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reorder-rules');
      setRules(res.data);
    } catch (err) {
      console.error('Fetch reorder rules error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data)).catch(console.error);
    api.get('/warehouses').then(res => setWarehouses(res.data)).catch(console.error);
    fetchRules();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reorder-rules', {
        product_id: parseInt(productId, 10),
        warehouse_id: parseInt(warehouseId, 10),
        minimum_quantity: parseInt(minQty, 10),
        maximum_quantity: parseInt(maxQty, 10)
      });
      setShowModal(false);
      setProductId('');
      setWarehouseId('');
      fetchRules();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save reorder rule');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-700" />
            Automated Reordering Rules
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure minimum safety thresholds and maximum stock replenishment quantities
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>CONFIGURE RULE</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
            <span>Loading reordering rules...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No reorder rules configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Warehouse Facility</th>
                  <th className="py-3.5 px-5 text-right">Min Threshold</th>
                  <th className="py-3.5 px-5 text-right">Max Replenishment</th>
                  <th className="py-3.5 px-5 text-right">Current On Hand</th>
                  <th className="py-3.5 px-5 text-right">Suggested Order Qty</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rules.map((r) => {
                  const onHand = parseInt(r.current_on_hand, 10);
                  const min = parseInt(r.minimum_quantity, 10);
                  const isLow = onHand <= min;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{r.product_name}</div>
                        <div className="text-xs font-mono text-emerald-700">SKU: {r.sku}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-700 font-medium">{r.warehouse_name} ({r.warehouse_code})</td>
                      <td className="py-4 px-5 text-right font-semibold text-slate-600">{r.minimum_quantity} {r.uom}</td>
                      <td className="py-4 px-5 text-right font-semibold text-slate-600">{r.maximum_quantity} {r.uom}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-slate-900">{onHand} {r.uom}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-emerald-700">
                        {r.suggested_reorder_qty > 0 ? `+${r.suggested_reorder_qty} ${r.uom}` : '0'}
                      </td>
                      <td className="py-4 px-5">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            REORDER NEEDED
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            STOCK OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Configure Reorder Rule</h3>
            {error && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Product</label>
                <select required value={productId} onChange={e=>setProductId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Warehouse</label>
                <select required value={warehouseId} onChange={e=>setWarehouseId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                  <option value="">Select Warehouse...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Min Threshold</label>
                  <input type="number" required min="0" value={minQty} onChange={e=>setMinQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-semibold mb-1">Max Capacity</label>
                  <input type="number" required min="1" value={maxQty} onChange={e=>setMaxQty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
