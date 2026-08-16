'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import { Flag } from 'lucide-react';

export default function UtVenueBarChart({ unionTerritories = [] }) {
  if (!unionTerritories || unionTerritories.length === 0) {
    return null;
  }

  const sortedUt = [...unionTerritories].sort((a, b) => (b.venueCount || 0) - (a.venueCount || 0));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs space-y-1 border border-slate-700">
          <div className="font-extrabold text-sm border-b border-slate-700 pb-1">
            {data.state}
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-slate-300">UT Venue Count:</span>
            <span className="font-extrabold text-purple-400">{data.displayVenue}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Data Type:</span>
            <span className={`font-bold ${data.isApproximate ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.isApproximate ? 'Approximate (±)' : 'Exact'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Flag className="w-5 h-5 text-purple-600" />
          <span>UNION TERRITORY VENUE DISTRIBUTION</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Venue counts for Union Territories parsed directly from Excel source.
        </p>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedUt}
            margin={{ top: 10, right: 60, left: 160, bottom: 10 }}
            barCategoryGap={6}
          >
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis
              type="category"
              dataKey="state"
              tick={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              width={160}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="venueCount" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {sortedUt.map((entry, index) => (
                <Cell key={`ut-cell-${index}`} fill="#8b5cf6" stroke="#6d28d9" strokeWidth={1} />
              ))}
              <LabelList
                dataKey="displayVenue"
                position="right"
                style={{ fontSize: '11px', fontWeight: 'bold', fill: '#4c1d95' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
