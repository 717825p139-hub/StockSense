import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Boxes, LayoutDashboard, ArrowLeftRight, Package, History, 
  Settings, Warehouse, MapPin, Sparkles, LogOut, ChevronDown, 
  Layers, PackageCheck, Truck, ArrowRightLeft, Sliders
} from 'lucide-react';

export default function Navbar({ onOpenAi }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [opsOpen, setOpsOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30 ring-1 ring-white/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Stock<span className="text-rose-500">Sense</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Inventory System</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            
            <NavLink to="/" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4 text-rose-400" />
              <span>Dashboard</span>
            </NavLink>

            {/* Operations Dropdown */}
            <div className="relative" onMouseLeave={() => setOpsOpen(false)}>
              <button
                onClick={() => setOpsOpen(!opsOpen)}
                onMouseEnter={() => setOpsOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <ArrowLeftRight className="w-4 h-4 text-rose-400" />
                <span>Operations</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
              </button>

              {opsOpen && (
                <div 
                  className="absolute left-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setOpsOpen(true)}
                >
                  <NavLink
                    to="/receipts"
                    onClick={() => setOpsOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80"
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium">Receipts</div>
                      <div className="text-xs text-slate-500">Incoming stock operations</div>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/deliveries"
                    onClick={() => setOpsOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80"
                  >
                    <Truck className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-medium">Delivery Orders</div>
                      <div className="text-xs text-slate-500">Outgoing customer shipments</div>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/transfers"
                    onClick={() => setOpsOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-medium">Internal Transfers</div>
                      <div className="text-xs text-slate-500">Relocate between locations</div>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/adjustments"
                    onClick={() => setOpsOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/80"
                  >
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-medium">Stock Adjustments</div>
                      <div className="text-xs text-slate-500">Reconcile physical counts</div>
                    </div>
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to="/products" className={navLinkClass}>
              <Package className="w-4 h-4 text-rose-400" />
              <span>Products</span>
            </NavLink>

            <NavLink to="/stock" className={navLinkClass}>
              <Layers className="w-4 h-4 text-rose-400" />
              <span>Stock</span>
            </NavLink>

            <NavLink to="/move-history" className={navLinkClass}>
              <History className="w-4 h-4 text-rose-400" />
              <span>Move History</span>
            </NavLink>

            <NavLink to="/warehouses" className={navLinkClass}>
              <Warehouse className="w-4 h-4 text-rose-400" />
              <span>Warehouses</span>
            </NavLink>

            <NavLink to="/locations" className={navLinkClass}>
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Locations</span>
            </NavLink>

            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="w-4 h-4 text-rose-400" />
              <span>Settings</span>
            </NavLink>

          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            
            {/* AI Assistant Button */}
            <button
              onClick={onOpenAi}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500/60 transition-all text-xs font-semibold shadow-sm"
              title="Open Gemini Stock Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-slate-200">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.role || 'Manager'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
