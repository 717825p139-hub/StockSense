import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Filter, RefreshCw, PackageCheck, Eye, ArrowRight } from 'lucide-react';

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/receipts', {
        params: { search, status: statusFilter }
      });
      setReceipts(res.data);
    } catch (err) {
      console.error('Fetch receipts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [search, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
            Receipt Operations
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Incoming stock orders from suppliers and vendors
          </p>
        </div>

        <button
          onClick={() => navigate('/receipts/new')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW RECEIPT</span>
        </button>
      </div>

      {/* Controls & Search Bar (Reference Wireframe Match) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference (WH/IN/...) or contact/supplier..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/80"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

      </div>

      {/* Table (Default List View) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Loading receipts list...</span>
          </div>
        ) : receipts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">
            No receipts found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">Receive From (Contact)</th>
                  <th className="py-3.5 px-5">Scheduled Date</th>
                  <th className="py-3.5 px-5">Total Items</th>
                  <th className="py-3.5 px-5">Responsible</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {receipts.map((r) => (
                  <tr 
                    key={r.id} 
                    onClick={() => navigate(`/receipts/${r.id}`)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-emerald-400 group-hover:underline">
                      {r.reference}
                    </td>
                    <td className="py-4 px-5 font-medium text-white">
                      {r.supplier_name || 'Generic Vendor'}
                    </td>
                    <td className="py-4 px-5 text-slate-300">
                      {new Date(r.scheduled_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-slate-300">
                      {r.total_quantity} unit(s)
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      {r.responsible_name || 'System Admin'}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
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
