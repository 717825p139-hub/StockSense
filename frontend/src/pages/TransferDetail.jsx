import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowRightLeft, CheckCircle, ArrowLeft, RefreshCw, AlertCircle, Printer, FileText } from 'lucide-react';

export default function TransferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTransfer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/transfers/${id}`);
      setTransfer(res.data);
    } catch (err) {
      setError('Failed to fetch transfer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfer();
  }, [id]);

  const handleValidate = async () => {
    if (!window.confirm('Validate internal transfer? Stock will be relocated between locations.')) return;
    setValidating(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/transfers/${id}/validate`);
      setSuccess('Internal transfer validated and completed successfully!');
      fetchTransfer();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to validate transfer');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mr-2" />
        <span className="text-sm text-slate-400">Loading transfer details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <button onClick={() => navigate('/transfers')} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Internal Transfers</span>
        </button>

        <div className="flex items-center space-x-3">
          {transfer.status !== 'Done' && (
            <button
              onClick={handleValidate}
              disabled={validating}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-950/50 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{validating ? 'Validating...' : 'VALIDATE TRANSFER'}</span>
            </button>
          )}

          <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700">
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Transfer Slip</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print-area">
        <div className="flex justify-between items-start pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">Internal Stock Transfer</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono mt-1">{transfer.reference}</h1>
          </div>
          <StatusBadge status={transfer.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-800">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">From Location (Source)</span>
            <span className="text-base font-bold text-rose-400">{transfer.from_warehouse_name} / {transfer.from_location_name}</span>
            <span className="text-xs text-slate-500 block font-mono">[{transfer.from_location_code}]</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">To Location (Destination)</span>
            <span className="text-base font-bold text-emerald-400">{transfer.to_warehouse_name} / {transfer.to_location_name}</span>
            <span className="text-xs text-slate-500 block font-mono">[{transfer.to_location_code}]</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Transferred Items
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {transfer.items && transfer.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">{item.sku}</td>
                    <td className="py-3.5 px-4 text-white font-medium">{item.product_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{item.uom}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
