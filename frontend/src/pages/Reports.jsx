import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart3, Download, Printer, RefreshCw, FileText } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '/reports/inventory';
      if (activeTab === 'low-stock') endpoint = '/reports/low-stock';
      if (activeTab === 'movements') endpoint = '/reports/movements';

      const res = await api.get(endpoint);
      setData(res.data);
    } catch (err) {
      console.error('Fetch report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const exportToCsv = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${val !== null && val !== undefined ? val : ''}"`).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Exportable inventory valuation, low stock alerts, and audit ledger reports
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCsv}
            disabled={loading || data.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2.5 px-4 font-semibold text-xs transition-all border-b-2 ${
            activeTab === 'inventory'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Inventory Valuation Report
        </button>

        <button
          onClick={() => setActiveTab('low-stock')}
          className={`py-2.5 px-4 font-semibold text-xs transition-all border-b-2 ${
            activeTab === 'low-stock'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Low Stock Alert Report
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`py-2.5 px-4 font-semibold text-xs transition-all border-b-2 ${
            activeTab === 'movements'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Stock Movement Ledger Report
        </button>
      </div>

      {/* Report Content Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs print-area">
        
        <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              StockSense Intelligence Report
            </span>
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')} Summary
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Generated: {new Date().toLocaleString()}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
            <span>Generating report metrics...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No report rows found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold uppercase text-slate-600">
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="py-3 px-4 capitalize">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {Object.values(row).map((val, vIdx) => (
                      <td key={vIdx} className="py-3 px-4 text-slate-800 font-medium">
                        {val !== null && val !== undefined ? String(val) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
