import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Package, Layers, Tag, Sliders, PackageCheck, 
  Truck, ArrowRightLeft, History, Warehouse, MapPin, BarChart3, 
  Sparkles, Settings, ShieldCheck, User, LogOut, X, ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 z-40 w-64 bg-white border-r border-slate-200 h-full flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          
          {/* Logo Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm text-white font-bold">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Stock<span className="text-emerald-700">Sense</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                  Inventory Intelligence
                </div>
              </div>
            </div>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 md:hidden rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Grouped by Sections */}
          <nav className="p-3 space-y-5 flex-1">
            
            {/* Overview */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Overview
              </div>
              <NavLink to="/" onClick={onClose} className={navClass}>
                <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                <span>Dashboard</span>
              </NavLink>
            </div>

            {/* Inventory */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Inventory
              </div>
              <div className="space-y-0.5">
                <NavLink to="/products" onClick={onClose} className={navClass}>
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Products</span>
                </NavLink>

                <NavLink to="/stock" onClick={onClose} className={navClass}>
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Stock Balances</span>
                </NavLink>

                <NavLink to="/categories" onClick={onClose} className={navClass}>
                  <Tag className="w-4 h-4 text-slate-500" />
                  <span>Categories</span>
                </NavLink>

                <NavLink to="/reordering" onClick={onClose} className={navClass}>
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span>Reordering Rules</span>
                </NavLink>
              </div>
            </div>

            {/* Operations */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Operations
              </div>
              <div className="space-y-0.5">
                <NavLink to="/receipts" onClick={onClose} className={navClass}>
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  <span>Receipts</span>
                </NavLink>

                <NavLink to="/deliveries" onClick={onClose} className={navClass}>
                  <Truck className="w-4 h-4 text-sky-600" />
                  <span>Delivery Orders</span>
                </NavLink>

                <NavLink to="/transfers" onClick={onClose} className={navClass}>
                  <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                  <span>Internal Transfers</span>
                </NavLink>

                <NavLink to="/adjustments" onClick={onClose} className={navClass}>
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Stock Adjustments</span>
                </NavLink>

                <NavLink to="/move-history" onClick={onClose} className={navClass}>
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Move History</span>
                </NavLink>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Facilities
              </div>
              <div className="space-y-0.5">
                <NavLink to="/warehouses" onClick={onClose} className={navClass}>
                  <Warehouse className="w-4 h-4 text-slate-500" />
                  <span>Warehouses</span>
                </NavLink>

                <NavLink to="/locations" onClick={onClose} className={navClass}>
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Locations</span>
                </NavLink>
              </div>
            </div>

            {/* Intelligence & Analytics */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Intelligence
              </div>
              <div className="space-y-0.5">
                <NavLink to="/reports" onClick={onClose} className={navClass}>
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  <span>Reports & Export</span>
                </NavLink>

                <NavLink to="/copilot" onClick={onClose} className={navClass}>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Inventory Copilot</span>
                </NavLink>
              </div>
            </div>

            {/* System */}
            <div>
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                System
              </div>
              <div className="space-y-0.5">
                <NavLink to="/settings" onClick={onClose} className={navClass}>
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </NavLink>

                <NavLink to="/audit-logs" onClick={onClose} className={navClass}>
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span>Audit Logs</span>
                </NavLink>
              </div>
            </div>

          </nav>

          {/* User Profile Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Admin'}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user?.role || 'Manager'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
