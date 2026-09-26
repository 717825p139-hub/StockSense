import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MapPin, Plus, RefreshCw, Warehouse } from 'lucide-react';

export default function LocationsList() {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations');
      setLocations(res.data);
    } catch (err) {
      console.error('Fetch locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/warehouses').then(res => setWarehouses(res.data)).catch(console.error);
    fetchLocations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/locations', { warehouse_id: parseInt(warehouseId, 10), name, code });
      setShowModal(false);
      setName('');
      setCode('');
      setWarehouseId('');
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create location');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rose-400" />
            Inventory Locations
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage racks, storage areas, and production zones
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD LOCATION</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
            <span>Loading locations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Location Code</th>
                  <th className="py-3.5 px-5">Location Name</th>
                  <th className="py-3.5 px-5">Warehouse</th>
                  <th className="py-3.5 px-5 text-right">Total Units On Hand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-rose-400">{loc.code}</td>
                    <td className="py-4 px-5 font-medium text-white">{loc.name}</td>
                    <td className="py-4 px-5 text-slate-300">{loc.warehouse_name} ({loc.warehouse_code})</td>
                    <td className="py-4 px-5 text-right font-extrabold text-emerald-400">{loc.total_on_hand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add New Location</h3>
            {error && <div className="mb-4 p-3 bg-rose-950 border border-rose-800 rounded-xl text-rose-300 text-xs">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Parent Warehouse</label>
                <select required value={warehouseId} onChange={e=>setWarehouseId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="">Select Warehouse...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Location Name</label>
                <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Rack A" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-semibold mb-1">Location Short Code</label>
                <input type="text" required value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. WH/STOCK1" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl">Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
