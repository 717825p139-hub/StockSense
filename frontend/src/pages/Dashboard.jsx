import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  PackageCheck, Truck, AlertTriangle, Clock, Calendar, 
  Layers, ArrowRight, RefreshCw, AlertCircle, TrendingUp, Package
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-700" />
          <span className="text-sm font-medium">Loading inventory intelligence dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error || 'Error loading dashboard metrics'}</span>
          </div>
          <button onClick={fetchDashboard} className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { receipts, deliveries, stock, recent_movements } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Inventory Operations Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time stock movement tracking and pending operations schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* TOP OPERATIONAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECEIPT CARD */}
        <div 
          onClick={() => navigate('/receipts')}
          className="group relative bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xs overflow-hidden hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">RECEIPT OPERATIONS</h3>
                <span className="text-xs text-slate-500 font-medium">Incoming stock from vendors</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active Module
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {receipts.to_receive}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                To Receive
              </div>
            </div>

            <div>
              <div className={`text-3xl font-extrabold tracking-tight ${receipts.late > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {receipts.late}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 mt-1 flex items-center gap-1">
                {receipts.late > 0 && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span>Late Operations</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
            <span>View Receipt Operations List</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* DELIVERY CARD */}
        <div 
          onClick={() => navigate('/deliveries')}
          className="group relative bg-white border border-slate-200 hover:border-sky-500 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xs overflow-hidden hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">DELIVERY OPERATIONS</h3>
                <span className="text-xs text-slate-500 font-medium">Outgoing customer shipments</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Active Module
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {deliveries.to_deliver}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                To Deliver
              </div>
            </div>

            <div>
              <div className={`text-3xl font-extrabold tracking-tight ${deliveries.late > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {deliveries.late}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-600 mt-1 flex items-center gap-1">
                {deliveries.late > 0 && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span>Late Operations</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-700 group-hover:text-sky-800">
            <span>View Delivery Operations List</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* OPERATIONAL SUMMARY & STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule & Operational Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            Today's Scheduled Operations
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Scheduled Receipts</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{receipts.scheduled_today}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Scheduled Deliveries</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{deliveries.scheduled_today}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Waiting for Stock</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{deliveries.waiting_for_stock}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">Low Stock Alert</span>
              <span className="text-2xl font-extrabold text-orange-700 mt-1 block">{stock.low_stock_count}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => navigate('/receipts')}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Receipts (/receipts)</span>
            </button>

            <button
              onClick={() => navigate('/deliveries')}
              className="px-3.5 py-2 bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Deliveries (/deliveries)</span>
            </button>

            <button
              onClick={() => navigate('/transfers')}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              Internal Transfers
            </button>

            <button
              onClick={() => navigate('/adjustments')}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all"
            >
              Stock Adjustments
            </button>
          </div>
        </div>

        {/* Stock Summary Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                Stock Summary
              </h3>
              <button 
                onClick={() => navigate('/stock')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                View Stock
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Total Products</span>
                <span className="text-sm font-bold text-slate-900">{stock.total_products}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Total Units On Hand</span>
                <span className="text-sm font-bold text-emerald-700">{stock.total_on_hand}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Low Stock Products</span>
                <span className="text-sm font-bold text-orange-700">{stock.low_stock_count}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Low Stock Items
            </h4>
            {stock.low_stock_list && stock.low_stock_list.length > 0 ? (
              <div className="space-y-2">
                {stock.low_stock_list.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-900 font-medium truncate max-w-[140px]">{item.name}</span>
                    <span className="text-orange-700 font-bold">{item.on_hand} / {item.reorder_level} {item.uom}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No low stock warnings.</p>
            )}
          </div>
        </div>

      </div>

      {/* RECENT MOVEMENTS LOG PREVIEW */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            Recent Stock Movements
          </h3>
          <button
            onClick={() => navigate('/move-history')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>Full Move History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recent_movements && recent_movements.length > 0 ? (
                recent_movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{m.reference}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{m.product_name} ({m.sku})</td>
                    <td className="py-3 px-4 text-slate-500">{m.from_location_name || 'Vendor / External'}</td>
                    <td className="py-3 px-4 text-slate-500">{m.to_location_name || 'Customer / Out'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.quantity} {m.uom}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(m.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500 italic">No movements recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
