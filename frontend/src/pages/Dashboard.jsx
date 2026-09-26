import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  PackageCheck, Truck, AlertTriangle, Clock, Calendar, 
  Layers, ArrowRight, TrendingUp, RefreshCw, AlertCircle
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
        <div className="flex items-center space-x-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-sm font-medium">Loading inventory dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error || 'Error loading dashboard data'}</span>
          </div>
          <button onClick={fetchDashboard} className="px-3 py-1 bg-rose-900 hover:bg-rose-800 rounded-lg text-xs font-semibold">
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Inventory Operations Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time stock movement tracking and pending operations schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* TOP OPERATIONAL CARDS (MATCHING EXCALIDRAW WIREFRAME DESIGN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RECEIPT CARD */}
        <div 
          onClick={() => navigate('/receipts')}
          className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xl overflow-hidden hover:shadow-emerald-950/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">RECEIPT OPERATIONS</h3>
                <span className="text-xs text-slate-400 font-medium">Incoming stock from vendors</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              Active Module
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-4">
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {receipts.to_receive}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                To Receive
              </div>
            </div>

            <div>
              <div className={`text-3xl font-extrabold tracking-tight ${receipts.late > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {receipts.late}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400/90 mt-1 flex items-center gap-1">
                {receipts.late > 0 && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                <span>Late Operations</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
            <span>View Receipt Operations List</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* DELIVERY CARD */}
        <div 
          onClick={() => navigate('/deliveries')}
          className="group relative bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer shadow-xl overflow-hidden hover:shadow-sky-950/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-all"></div>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">DELIVERY OPERATIONS</h3>
                <span className="text-xs text-slate-400 font-medium">Outgoing customer shipments</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/80">
              Active Module
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-slate-800/80 py-4">
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {deliveries.to_deliver}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                To Deliver
              </div>
            </div>

            <div>
              <div className={`text-3xl font-extrabold tracking-tight ${deliveries.late > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {deliveries.late}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400/90 mt-1 flex items-center gap-1">
                {deliveries.late > 0 && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                <span>Late Operations</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300">
            <span>View Delivery Operations List</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* ADDITIONAL OPERATIONAL SUMMARY & STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule & Operational Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-rose-400" />
            Today's Scheduled Operations
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Scheduled Receipts</span>
              <span className="text-2xl font-bold text-white mt-1 block">{receipts.scheduled_today}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Scheduled Deliveries</span>
              <span className="text-2xl font-bold text-white mt-1 block">{deliveries.scheduled_today}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Waiting for Stock</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">{deliveries.waiting_for_stock}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block">Low Stock Alert</span>
              <span className="text-2xl font-bold text-orange-400 mt-1 block">{stock.low_stock_count}</span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/receipts')}
              className="px-4 py-2 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Go to Receipts (/receipts)</span>
            </button>

            <button
              onClick={() => navigate('/deliveries')}
              className="px-4 py-2 bg-sky-950/60 text-sky-400 border border-sky-800/60 hover:bg-sky-900/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Go to Deliveries (/deliveries)</span>
            </button>

            <button
              onClick={() => navigate('/transfers')}
              className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Internal Transfers</span>
            </button>

            <button
              onClick={() => navigate('/adjustments')}
              className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Stock Adjustments</span>
            </button>
          </div>
        </div>

        {/* Stock Overview Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" />
                Stock Summary
              </h3>
              <button 
                onClick={() => navigate('/stock')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                View Stock
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400">Total Products</span>
                <span className="text-sm font-bold text-white">{stock.total_products}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400">Total Units On Hand</span>
                <span className="text-sm font-bold text-emerald-400">{stock.total_on_hand}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs text-slate-400">Low Stock Products</span>
                <span className="text-sm font-bold text-orange-400">{stock.low_stock_count}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Low Stock Items
            </h4>
            {stock.low_stock_list && stock.low_stock_list.length > 0 ? (
              <div className="space-y-2">
                {stock.low_stock_list.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-200 font-medium truncate max-w-[150px]">{item.name}</span>
                    <span className="text-orange-400 font-semibold">{item.on_hand} / {item.reorder_level} {item.uom}</span>
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            Recent Stock Movements
          </h3>
          <button
            onClick={() => navigate('/move-history')}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <span>Full Move History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {recent_movements && recent_movements.length > 0 ? (
                recent_movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-rose-300">{m.reference}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{m.product_name} ({m.sku})</td>
                    <td className="py-3 px-4 text-slate-400">{m.from_location_name || 'Vendor / External'}</td>
                    <td className="py-3 px-4 text-slate-400">{m.to_location_name || 'Customer / Out'}</td>
                    <td className="py-3 px-4 font-bold text-white">{m.quantity} {m.uom}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(m.created_at).toLocaleString()}</td>
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
