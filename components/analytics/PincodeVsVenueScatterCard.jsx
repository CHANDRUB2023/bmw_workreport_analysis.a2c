'use client';

import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ZAxis } from 'recharts';
import { ScatterChart as ScatterIcon } from 'lucide-react';

export default function PincodeVsVenueScatterCard({ districts = [] }) {
  if (!districts || districts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center text-xs text-slate-400">
        Insufficient source data for pincode scatter analysis.
      </div>
    );
  }

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
            <span className="text-slate-300">Unique Pincodes (X):</span>
            <span className="font-bold text-blue-400">{data.pincodeCount} PINs</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">Venue Count (Y):</span>
            <span className="font-extrabold text-emerald-400">{data.displayVenue}</span>
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
          <ScatterIcon className="w-5 h-5 text-blue-600" />
          <span>UNIQUE PINCODE COUNT VS VENUE COUNT</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Correlation between district unique pincode coverage and venue availability. Derived from Excel source.
        </p>
      </div>

      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="pincodeCount"
              name="Unique Pincodes"
              unit=" PINs"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Unique Pincodes per District', position: 'insideBottom', offset: -10, style: { fontSize: '11px', fontWeight: 'bold', fill: '#475569' } }}
            />
            <YAxis
              type="number"
              dataKey="venueCount"
              name="Venue Count"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={{ value: 'Venue Count', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fontWeight: 'bold', fill: '#475569' } }}
            />
            <ZAxis type="number" range={[60, 240]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Districts" data={districts}>
              {districts.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isApproximate ? '#3b82f6' : '#1d4ed8'}
                  stroke={entry.isApproximate ? '#93c5fd' : '#1e3a8a'}
                  strokeWidth={1.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-blue-900">
            <span className="w-3 h-3 rounded-full bg-blue-800 inline-block" /> Exact Districts
          </span>
          <span className="flex items-center gap-1.5 font-bold text-blue-600">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Approximate Districts (±)
          </span>
        </div>
        <span>{districts.length} Points Plotted</span>
      </div>
    </div>
  );
}
