'use client';

import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';

export default function VenueRangeDistributionCard({ distributions = [], totalDistricts = 38 }) {
  const getBadgeColor = (key) => {
    switch (key) {
      case '500+': return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', lightBg: 'bg-blue-50' };
      case '300-499': return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-200', lightBg: 'bg-blue-50' };
      case '200-299': return { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-200', lightBg: 'bg-indigo-50' };
      case '100-199': return { bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-200', lightBg: 'bg-sky-50' };
      default: return { bg: 'bg-slate-400', text: 'text-slate-600', border: 'border-slate-200', lightBg: 'bg-slate-50' };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>VENUE COUNT RANGE DISTRIBUTION</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Categorization of {totalDistricts} Tamil Nadu districts by venue volume brackets.
        </p>
      </div>

      <div className="space-y-4">
        {distributions.map((item) => {
          const colors = getBadgeColor(item.rangeKey);
          return (
            <div key={item.label} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colors.bg}`} />
                  <span className="text-sm font-black text-slate-900">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
                    {item.count} {item.count === 1 ? 'District' : 'Districts'}
                  </span>
                  <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bg} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>

              {/* District Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {item.districts && item.districts.length > 0 ? (
                  item.districts.map((d) => (
                    <span
                      key={d}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${colors.lightBg} ${colors.text} ${colors.border}`}
                    >
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">No districts in this tier</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
