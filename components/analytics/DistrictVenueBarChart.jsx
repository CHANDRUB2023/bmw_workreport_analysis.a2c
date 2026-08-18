'use client';

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { BarChart3, Filter, ArrowUpDown } from 'lucide-react';

export default function DistrictVenueBarChart({ districts = [] }) {
  const [limit, setLimit] = useState('ALL'); // '5', '10', '20', 'ALL'
  const [sortOrder, setSortOrder] = useState('DESC'); // 'DESC', 'ASC', 'ALPHA'

  const processedData = useMemo(() => {
    let list = [...districts];

    if (sortOrder === 'DESC') {
      list.sort((a, b) => (b.venueCount || 0) - (a.venueCount || 0));
    } else if (sortOrder === 'ASC') {
      list.sort((a, b) => (a.venueCount || 0) - (b.venueCount || 0));
    } else if (sortOrder === 'ALPHA') {
      list.sort((a, b) => a.district.localeCompare(b.district));
    }

    if (limit === '5') list = list.slice(0, 5);
    else if (limit === '10') list = list.slice(0, 10);
    else if (limit === '20') list = list.slice(0, 20);

    return list;
  }, [districts, limit, sortOrder]);

  const chartHeight = Math.max(160, processedData.length * 30);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 border border-slate-700">
          <div className="font-extrabold text-sm border-b border-slate-700 pb-1 flex items-center justify-between gap-3">
            <span>{data.district}</span>
            <span className="text-slate-400 text-[10px]">Rank #{data.rank}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-slate-300">Venue Count:</span>
            <span className="font-extrabold text-blue-400">{data.displayVenue}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Data Accuracy:</span>
            <span className={`font-bold ${data.isApproximate ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.isApproximate ? 'Approximate (±)' : 'Exact'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Unique Pincodes:</span>
            <span className="font-bold text-slate-200">{data.pincodeCount} PINs</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>DISTRICT-WISE VENUE COUNT</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative venue volume across districts. Includes exact numbers and approximate (±) source figures.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Top N Limit Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-1 uppercase flex items-center gap-0.5">
              <Filter className="w-3 h-3" /> View:
            </span>
            {[
              { id: '5', label: 'Top 5' },
              { id: '10', label: 'Top 10' },
              { id: '20', label: 'Top 20' },
              { id: 'ALL', label: `All (${districts.length})` }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setLimit(opt.id)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  limit === opt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort Order Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-1 uppercase flex items-center gap-0.5">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            {[
              { id: 'DESC', label: 'Highest → Lowest' },
              { id: 'ASC', label: 'Lowest → Highest' },
              { id: 'ALPHA', label: 'A → Z' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortOrder(opt.id)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  sortOrder === opt.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${chartHeight}px` }} className="w-full transition-all duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={processedData}
            margin={{ top: 10, right: 60, left: 90, bottom: 10 }}
            barCategoryGap={4}
          >
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis
              type="category"
              dataKey="district"
              tick={{ fontSize: 11, fontWeight: 700, fill: '#1e293b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="venueCount" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isApproximate ? '#3b82f6' : '#1d4ed8'}
                  stroke={entry.isApproximate ? '#93c5fd' : '#1e3a8a'}
                  strokeWidth={entry.isApproximate ? 1 : 1.5}
                />
              ))}
              <LabelList
                dataKey="displayVenue"
                position="right"
                style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1e293b' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-blue-900">
            <span className="w-3 h-3 rounded bg-blue-800 inline-block" /> Exact Values ({districts.filter(d => !d.isApproximate).length})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-blue-600">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Approximate Values ± ({districts.filter(d => d.isApproximate).length})
          </span>
        </div>
        <span>Displaying {processedData.length} of {districts.length} Districts</span>
      </div>
    </div>
  );
}
