import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, ArrowRightLeft, RefreshCw, ArrowRight } from 'lucide-react';

export default function TransfersList() {
  const [transfers, setTransfers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transfers', { params: { search } });
      setTransfers(res.data);
    } catch (err) {
      console.error('Fetch transfers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-amber-400" />
            Internal Transfers
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Relocate stock between warehouses and internal racks
          </p>
        </div>

        <button
          onClick={() => navigate('/transfers/new')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW TRANSFER</span>
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
            placeholder="Search reference (WH/INT/...) or location..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Loading internal transfers...</span>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No transfers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">From Location</th>
                  <th className="py-3.5 px-5">To Location</th>
                  <th className="py-3.5 px-5">Total Qty</th>
                  <th className="py-3.5 px-5">Responsible</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {transfers.map((t) => (
                  <tr 
                    key={t.id}
                    onClick={() => navigate(`/transfers/${t.id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-amber-400 group-hover:underline">{t.reference}</td>
                    <td className="py-4 px-5 text-white font-medium">{t.from_warehouse_name} / {t.from_location_name}</td>
                    <td className="py-4 px-5 text-white font-medium">{t.to_warehouse_name} / {t.to_location_name}</td>
                    <td className="py-4 px-5 text-slate-300">{t.total_quantity} unit(s)</td>
                    <td className="py-4 px-5 text-slate-400">{t.responsible_name || 'Admin'}</td>
                    <td className="py-4 px-5"><StatusBadge status={t.status} /></td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
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
