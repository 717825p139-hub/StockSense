import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Warehouse, Plus, RefreshCw, MapPin, AlertCircle, Save } from 'lucide-react';

export default function WarehousesList() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      console.error('Fetch warehouses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/warehouses', { name, code, address });
      setShowModal(false);
      setName('');
      setCode('');
      setAddress('');
      fetchWarehouses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create warehouse');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-rose-400" />
            Warehouses Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Physical facilities and storage hub management
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD WAREHOUSE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
            <span>Loading warehouses...</span>
          </div>
        ) : warehouses.map((wh) => (
          <div key={wh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">CODE: {wh.code}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{wh.name}</h3>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                <Warehouse className="w-5 h-5 text-rose-400" />
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 shrink-0 text-slate-500" />
              <span>{wh.address || 'No physical address configured'}</span>
            </p>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Internal Locations:</span>
              <span className="font-bold text-emerald-400">{wh.location_count} location(s)</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Warehouse</h3>
            {error && <div className="mb-4 p-3 bg-rose-950 border border-rose-800 rounded-xl text-rose-300 text-xs">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Warehouse Name</label>
                <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Main Warehouse" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Short Code</label>
                <input type="text" required value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. WH" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Address</label>
                <textarea value={address} onChange={e=>setAddress(e.target.value)} placeholder="Physical address..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl">Save Warehouse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
