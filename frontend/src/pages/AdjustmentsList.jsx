import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Plus, Sliders, RefreshCw } from 'lucide-react';

export default function AdjustmentsList() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/adjustments');
      setAdjustments(res.data);
    } catch (err) {
      console.error('Fetch adjustments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-400" />
            Stock Adjustments
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Physical inventory count reconciliation and audit log
          </p>
        </div>

        <button
          onClick={() => navigate('/adjustments/new')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW ADJUSTMENT</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
            <span>Loading inventory adjustments...</span>
          </div>
        ) : adjustments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No adjustments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-5 text-right">Recorded Qty</th>
                  <th className="py-3.5 px-5 text-right">Physical Count</th>
                  <th className="py-3.5 px-5 text-right">Difference</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {adjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-purple-400">{a.reference}</td>
                    <td className="py-4 px-5 font-medium text-white">{a.product_name} ({a.sku})</td>
                    <td className="py-4 px-5 text-slate-300">{a.warehouse_name} / {a.location_name}</td>
                    <td className="py-4 px-5 text-right font-medium text-slate-300">{a.recorded_qty} {a.uom}</td>
                    <td className="py-4 px-5 text-right font-bold text-white">{a.physical_qty} {a.uom}</td>
                    <td className={`py-4 px-5 text-right font-bold ${a.difference < 0 ? 'text-rose-400' : a.difference > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {a.difference > 0 ? `+${a.difference}` : a.difference} {a.uom}
                    </td>
                    <td className="py-4 px-5 text-slate-400 italic text-xs max-w-xs truncate">{a.reason}</td>
                    <td className="py-4 px-5 text-slate-500 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
