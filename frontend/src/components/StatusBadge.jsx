import React from 'react';

export default function StatusBadge({ status }) {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status?.toString().toLowerCase()) {
    case 'done':
    case 'available':
    case 'healthy':
    case 'ready':
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'waiting':
    case 'picked':
    case 'packed':
      colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'draft':
    case 'pending':
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'canceled':
    case 'out of stock':
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'low stock':
      colorClass = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    default:
      colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status}
    </span>
  );
}
