import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  PackageCheck, Printer, CheckCircle, XCircle, ArrowLeft, 
  Calendar, User, Building2, AlertCircle, RefreshCw, FileText
} from 'lucide-react';

export default function ReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/receipts/${id}`);
      setReceipt(res.data);
    } catch (err) {
      setError('Failed to fetch receipt details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const handleValidate = async () => {
    if (!window.confirm('Are you sure you want to validate this receipt? This will INCREASE system inventory stock.')) {
      return;
    }

    setValidating(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/receipts/${id}/validate`);
      setSuccess('Receipt validated successfully! Inventory stock has been updated (+qty).');
      fetchReceipt();
    } catch (err) {
      setError(err.response?.data?.error || 'Validation failed. Transaction rolled back.');
    } finally {
      setValidating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this receipt?')) return;
    try {
      await api.post(`/receipts/${id}/cancel`);
      fetchReceipt();
    } catch (err) {
      setError('Failed to cancel receipt');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
        <span className="text-sm font-medium text-slate-400">Loading receipt details...</span>
      </div>
    );
  }

  if (error && !receipt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const statuses = ['Draft', 'Ready', 'Done'];
  const currentStatusIdx = statuses.indexOf(receipt.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Action Bar (Hide in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <button
          onClick={() => navigate('/receipts')}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Receipt Operations</span>
        </button>

        <div className="flex items-center space-x-3">
          {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
            <button
              onClick={handleValidate}
              disabled={validating}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{validating ? 'Validating & Updating Stock...' : 'VALIDATE'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Receipt</span>
          </button>

          {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-semibold text-sm rounded-xl border border-rose-800/80 transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-sm flex items-center space-x-2 no-print">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm flex items-center space-x-2 no-print">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Document Panel (Printable Area) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print-area">
        
        {/* Status Progression Bar (Excalidraw Match) */}
        <div className="mb-8 p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Receipt Status Flow
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {statuses.map((st, idx) => {
              const isPastOrCurrent = currentStatusIdx >= idx && receipt.status !== 'Canceled';
              return (
                <div key={st} className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    receipt.status === st
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isPastOrCurrent
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {st}
                  </div>
                  {idx < statuses.length - 1 && (
                    <span className="text-slate-600 font-bold">→</span>
                  )}
                </div>
              );
            })}
            {receipt.status === 'Canceled' && (
              <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 text-xs font-semibold rounded-lg">
                Canceled
              </span>
            )}
          </div>
        </div>

        {/* Document Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
              Incoming Inventory Receipt
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono mt-1">
              {receipt.reference}
            </h1>
          </div>

          <div className="text-right">
            <StatusBadge status={receipt.status} />
            <span className="text-xs text-slate-400 block mt-1">
              Created: {new Date(receipt.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Primary Meta Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Receive From (Supplier)
            </span>
            <span className="text-base font-bold text-white block">
              {receipt.supplier_name || 'Generic Vendor'}
            </span>
            {receipt.supplier_email && (
              <span className="text-xs text-slate-400 block">{receipt.supplier_email}</span>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Scheduled Date
            </span>
            <span className="text-base font-bold text-slate-200">
              {new Date(receipt.scheduled_date).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Responsible User
            </span>
            <span className="text-base font-bold text-slate-200">
              {receipt.responsible_name || 'Inventory Manager'}
            </span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Products to Receive
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {receipt.items && receipt.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-emerald-300 font-semibold">{item.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-white">{item.product_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{item.uom}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300">₹{parseFloat(item.unit_cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {receipt.notes && (
          <div className="mt-6 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Internal Notes / Remarks
            </span>
            <p className="text-xs text-slate-300 italic">{receipt.notes}</p>
          </div>
        )}

      </div>

    </div>
  );
}
