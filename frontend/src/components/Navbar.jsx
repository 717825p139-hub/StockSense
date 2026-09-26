import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, Bell, Sparkles, User, LogOut } from 'lucide-react';

export default function Navbar({ onToggleSidebar, onOpenSearch, onOpenNotifications }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Mobile Menu Button + Search Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium rounded-xl transition-all w-48 sm:w-72 justify-between"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">Search platform...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white rounded border border-slate-200">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            
            {/* AI Copilot Quick Button */}
            <button
              onClick={() => navigate('/copilot')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Notifications Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white"></span>
            </button>

            {/* User Profile Pill */}
            {user && (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                <div 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name?.[0] || 'A'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden md:inline">
                    {user.name}
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
