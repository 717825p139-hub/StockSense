import React from 'react';

export default function StatusBadge({ status }) {
  let colorClass = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status?.toLowerCase()) {
    case 'done':
    case 'available':
      colorClass = 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      break;
    case 'ready':
      colorClass = 'bg-sky-950/70 text-sky-400 border-sky-800/60';
      break;
    case 'waiting':
      colorClass = 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      break;
    case 'draft':
      colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
      break;
    case 'canceled':
    case 'out of stock':
      colorClass = 'bg-rose-950/70 text-rose-400 border-rose-800/60';
      break;
    case 'low stock':
      colorClass = 'bg-orange-950/70 text-orange-400 border-orange-800/60';
      break;
    default:
      colorClass = 'bg-slate-800 text-slate-300 border-slate-700';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
}
