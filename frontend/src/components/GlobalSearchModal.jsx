import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Package, PackageCheck, Truck, ArrowRightLeft, Warehouse, X, Command } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], receipts: [], deliveries: [], transfers: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else openSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openSearch = () => {
    // Parent handles state
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], receipts: [], deliveries: [], transfers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, recRes, delRes, trRes] = await Promise.all([
          api.get('/products', { params: { search: query } }),
          api.get('/receipts', { params: { search: query } }),
          api.get('/deliveries', { params: { search: query } }),
          api.get('/transfers', { params: { search: query } })
        ]);

        setResults({
          products: prodRes.data.slice(0, 4),
          receipts: recRes.data.slice(0, 4),
          deliveries: delRes.data.slice(0, 4),
          transfers: trRes.data.slice(0, 4)
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  const hasResults = results.products.length > 0 || results.receipts.length > 0 || results.deliveries.length > 0 || results.transfers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global search by SKU, product, receipt, delivery, transfer, or contact..."
            className="w-full bg-transparent text-slate-900 text-sm placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center space-x-1 shrink-0">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200 rounded border border-slate-300">ESC</kbd>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Results Container */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-500">Searching inventory platform...</div>
          )}

          {!loading && !query.trim() && (
            <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center">
              <Command className="w-8 h-8 text-slate-300 mb-2" />
              <span>Type SKU, product name, operation reference, or contact name to search</span>
            </div>
          )}

          {!loading && query.trim() && !hasResults && (
            <div className="p-6 text-center text-xs text-slate-500 italic">
              No matching products or operations found for "{query}".
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Products ({results.products.length})
              </div>
              <div className="space-y-1">
                {results.products.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/products/${p.id}`)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs font-mono text-emerald-700">SKU: {p.sku} • {p.category_name || 'General'}</div>
                    </div>
                    <div className="text-xs font-bold text-slate-700">{p.total_on_hand || 0} {p.uom}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts */}
          {results.receipts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                Receipt Operations ({results.receipts.length})
              </div>
              <div className="space-y-1">
                {results.receipts.map(r => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect(`/receipts/${r.id}`)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-bold font-mono text-emerald-700">{r.reference}</div>
                      <div className="text-xs text-slate-500">From: {r.supplier_name || 'Vendor'}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliveries */}
          {results.deliveries.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                Delivery Orders ({results.deliveries.length})
              </div>
              <div className="space-y-1">
                {results.deliveries.map(d => (
                  <div
                    key={d.id}
                    onClick={() => handleSelect(`/deliveries/${d.id}`)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-bold font-mono text-sky-700">{d.reference}</div>
                      <div className="text-xs text-slate-500">To: {d.customer_name || 'Customer'}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Transfers */}
          {results.transfers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                Internal Transfers ({results.transfers.length})
              </div>
              <div className="space-y-1">
                {results.transfers.map(t => (
                  <div
                    key={t.id}
                    onClick={() => handleSelect(`/transfers/${t.id}`)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div>
                      <div className="text-sm font-bold font-mono text-amber-700">{t.reference}</div>
                      <div className="text-xs text-slate-500">{t.from_location_name} → {t.to_location_name}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
