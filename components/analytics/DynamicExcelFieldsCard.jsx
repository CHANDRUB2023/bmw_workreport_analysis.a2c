'use client';

import React from 'react';
import { Sparkles, Hash, Calendar, Type, CheckSquare, Layers } from 'lucide-react';

export default function DynamicExcelFieldsCard({ dynamicColumns = [] }) {
  if (!dynamicColumns || dynamicColumns.length === 0) {
    return null;
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Number':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <Hash className="w-3 h-3 text-blue-600" /> Numeric
          </span>
        );
      case 'Date':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-600" /> Date
          </span>
        );
      case 'Boolean':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-emerald-600" /> Boolean
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
            <Type className="w-3 h-3 text-slate-600" /> Text / Category
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm space-y-4 animate-fade-in border border-blue-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-800/80 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>DYNAMIC EXCEL DATASET FIELDS DETECTED</span>
            <span className="px-2 py-0.5 text-xs font-black bg-amber-400 text-slate-950 rounded-full">
              {dynamicColumns.length} New Field{dynamicColumns.length > 1 ? 's' : ''}
            </span>
          </h3>
          <p className="text-xs text-blue-200/90 mt-0.5">
            Automatically identified runtime schema fields from <span className="font-semibold text-white">TN Districts Pincodes.xlsx</span>.
          </p>
        </div>
      </div>

      {/* Grid of Dynamic Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {dynamicColumns.map((col) => (
          <div
            key={col.name}
            className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-black text-white truncate" title={col.name}>
                  {col.name}
                </h4>
                {getTypeBadge(col.type)}
              </div>

              <div className="mt-2 text-xs text-blue-200 flex items-center gap-2 font-medium">
                <Layers className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span>{col.uniqueCount} unique value{col.uniqueCount > 1 ? 's' : ''} across districts</span>
              </div>
            </div>

            {/* Sample values / stats */}
            {col.type === 'Number' && col.numberStats ? (
              <div className="bg-slate-950/40 rounded-lg p-2 text-[11px] grid grid-cols-2 gap-1 font-mono text-slate-200 border border-white/10">
                <div>Min: <b className="text-blue-300">{col.numberStats.min}</b></div>
                <div>Max: <b className="text-blue-300">{col.numberStats.max}</b></div>
                <div>Avg: <b className="text-blue-300">{col.numberStats.avg}</b></div>
                <div>Sum: <b className="text-blue-300">{col.numberStats.sum}</b></div>
              </div>
            ) : col.sampleValues && col.sampleValues.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {col.sampleValues.map((sample, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/15 text-blue-100 border border-white/10 truncate max-w-[120px]"
                    title={String(sample)}
                  >
                    {String(sample)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
