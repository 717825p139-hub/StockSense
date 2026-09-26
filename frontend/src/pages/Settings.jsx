import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Warehouse, MapPin, Shield, Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-rose-400" />
          System Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage warehouse configurations, system parameters, and user profile
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-lg font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Role:</span>
              <span className="font-semibold text-rose-400">{user?.role || 'Inventory Manager'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Access Level:</span>
              <span className="font-semibold text-emerald-400">Full System Admin</span>
            </div>
          </div>
        </div>

        {/* Quick Config Links */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            Inventory & Warehouse Operations Config
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/warehouses')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400">Warehouses</h4>
                  <p className="text-xs text-slate-400">Manage facility hubs and short codes</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate('/locations')}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-rose-400">Locations</h4>
                  <p className="text-xs text-slate-400">Configure storage racks and zones</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Low Stock & System Notifications
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-rose-500" />
                <span>Enable automatic Low Stock alerts on Dashboard & Stock page</span>
              </label>

              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-rose-500" />
                <span>Require double validation confirmation for stock deductions</span>
              </label>

              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-rose-500" />
                <span>Enforce atomic database transaction isolation for all stock ledger changes</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-all"
            >
              Save Preferences
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
