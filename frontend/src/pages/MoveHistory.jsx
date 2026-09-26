import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, Search, Filter, RefreshCw } from 'lucide-react';

export default function MoveHistory() {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMoveHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/move-history', {
        params: { search, movement_type: movementType }
      });
      setMovements(res.data);
    } catch (err) {
      console.error('Fetch move history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoveHistory();
  }, [search, movementType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-rose-400" />
            Stock Move History
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete audit trail of every stock movement between From → To locations
          </p>
        </div>
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
            placeholder="Search reference, SKU or product..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Type:</span>
          </div>
          <select
            value={movementType}
            onChange={(e) => setMovementType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-rose-500/80"
          >
            <option value="">All Movement Types</option>
            <option value="Receipt">Receipt (+Stock)</option>
            <option value="Delivery">Delivery (-Stock)</option>
            <option value="Internal Transfer">Internal Transfer</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
            <span>Loading move history...</span>
          </div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No movement history records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">From Location</th>
                  <th className="py-3.5 px-5">To Location</th>
                  <th className="py-3.5 px-5 text-right">Quantity</th>
                  <th className="py-3.5 px-5">Type / Status</th>
                  <th className="py-3.5 px-5">Responsible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-rose-300">{m.reference}</td>
                    <td className="py-4 px-5 text-slate-400 text-xs">{new Date(m.created_at).toLocaleString()}</td>
                    <td className="py-4 px-5 font-medium text-white">
                      <div>{m.product_name}</div>
                      <div className="text-xs font-mono text-slate-400">SKU: {m.sku}</div>
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">
                      {m.from_location_name ? `${m.from_warehouse_name} / ${m.from_location_name} (${m.from_location_code})` : 'Vendor / External'}
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">
                      {m.to_location_name ? `${m.to_warehouse_name} / ${m.to_location_name} (${m.to_location_code})` : 'Customer / External'}
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-white">
                      {m.quantity} {m.uom}
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400 text-xs">{m.responsible_name || 'System Admin'}</td>
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
