import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  Truck, Printer, CheckCircle, XCircle, ArrowLeft, 
  Calendar, User, MapPin, AlertCircle, RefreshCw, FileText
} from 'lucide-react';

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/deliveries/${id}`);
      setDelivery(res.data);
    } catch (err) {
      setError('Failed to fetch delivery details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleValidate = async () => {
    if (!window.confirm('Validate delivery order? This will check stock availability and DECREASE stock.')) {
      return;
    }

    setValidating(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/deliveries/${id}/validate`);
      setSuccess('Delivery order validated! Stock deducted successfully (-qty).');
      fetchDelivery();
    } catch (err) {
      setError(err.response?.data?.error || 'Validation failed. Check stock availability.');
    } finally {
      setValidating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this delivery order?')) return;
    try {
      await api.post(`/deliveries/${id}/cancel`);
      fetchDelivery();
    } catch (err) {
      setError('Failed to cancel delivery order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        <span className="text-sm font-medium text-slate-400">Loading delivery details...</span>
      </div>
    );
  }

  if (error && !delivery) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const statuses = ['Draft', 'Waiting', 'Ready', 'Done'];
  const currentStatusIdx = statuses.indexOf(delivery.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <button
          onClick={() => navigate('/deliveries')}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Delivery Operations</span>
        </button>

        <div className="flex items-center space-x-3">
          {delivery.status !== 'Done' && delivery.status !== 'Canceled' && (
            <button
              onClick={handleValidate}
              disabled={validating}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-950/50 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{validating ? 'Validating Stock & Deducting...' : 'VALIDATE'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Delivery Slip</span>
          </button>

          {delivery.status !== 'Done' && delivery.status !== 'Canceled' && (
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

      {/* Main Document Slip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl print-area">
        
        {/* Status Progression Bar */}
        <div className="mb-8 p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Delivery Order Progression
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {statuses.map((st, idx) => {
              const isPastOrCurrent = currentStatusIdx >= idx && delivery.status !== 'Canceled';
              return (
                <div key={st} className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    delivery.status === st
                      ? 'bg-sky-500 text-white shadow-md'
                      : isPastOrCurrent
                      ? 'bg-sky-950 text-sky-400 border border-sky-800'
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
            {delivery.status === 'Canceled' && (
              <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-800 text-xs font-semibold rounded-lg">
                Canceled
              </span>
            )}
          </div>
        </div>

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 block">
              Outgoing Delivery Slip
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono mt-1">
              {delivery.reference}
            </h1>
          </div>

          <div className="text-right">
            <StatusBadge status={delivery.status} />
            <span className="text-xs text-slate-400 block mt-1">
              Created: {new Date(delivery.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Meta Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Customer / Contact
            </span>
            <span className="text-base font-bold text-white block">
              {delivery.customer_name || 'Generic Customer'}
            </span>
            {delivery.customer_email && (
              <span className="text-xs text-slate-400 block">{delivery.customer_email}</span>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Scheduled Date
            </span>
            <span className="text-base font-bold text-slate-200">
              {new Date(delivery.scheduled_date).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Delivery Address
            </span>
            <span className="text-sm font-medium text-slate-300">
              {delivery.delivery_address || 'Main Delivery Location'}
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Products to Deliver
          </h3>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Unit Price (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {delivery.items && delivery.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono text-sky-300 font-semibold">{item.sku}</td>
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

        {delivery.notes && (
          <div className="mt-6 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Delivery Notes / Instructions
            </span>
            <p className="text-xs text-slate-300 italic">{delivery.notes}</p>
          </div>
        )}

      </div>

    </div>
  );
}
