import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Layers, Search, RefreshCw, Sliders, ArrowRight } from 'lucide-react';

export default function StockList() {
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock');
      setStock(res.data);
    } catch (err) {
      console.error('Fetch stock error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = stock.filter(item => 
    item.product_name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
    item.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-400" />
            Inventory Stock Balances
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time physical stock counts (On Hand vs Free to Use) per warehouse location
          </p>
        </div>

        <button
          onClick={() => navigate('/adjustments/new')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-700 transition-all self-start sm:self-auto"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>INVENTORY ADJUSTMENT</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU or location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
            <span>Loading inventory stock...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No stock records found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">Warehouse / Location</th>
                  <th className="py-3.5 px-5 text-right">Per Unit Cost</th>
                  <th className="py-3.5 px-5 text-right">On Hand</th>
                  <th className="py-3.5 px-5 text-right">Free to Use</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filtered.map((item) => {
                  const onHand = parseInt(item.on_hand, 10);
                  const isLow = onHand <= item.reorder_level && onHand > 0;
                  const isOut = onHand === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-white">{item.product_name}</div>
                        <div className="text-xs font-mono text-rose-400">SKU: {item.sku}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-slate-200 font-medium">{item.warehouse_name}</div>
                        <div className="text-xs text-slate-400">{item.location_name} ({item.location_code})</div>
                      </td>
                      <td className="py-4 px-5 text-right font-medium text-slate-300">₹{parseFloat(item.unit_cost).toFixed(2)}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-emerald-400">{item.on_hand} {item.uom}</td>
                      <td className="py-4 px-5 text-right font-extrabold text-sky-400">{item.free_to_use} {item.uom}</td>
                      <td className="py-4 px-5">
                        {isOut ? <StatusBadge status="Out of Stock" /> : isLow ? <StatusBadge status="Low Stock" /> : <StatusBadge status="Available" />}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => navigate('/adjustments/new')}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center justify-end space-x-1"
                        >
                          <span>Adjust</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
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
