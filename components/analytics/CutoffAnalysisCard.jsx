'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

export default function CutoffAnalysisCard() {
  const [customHours, setCustomHours] = useState(5);

  const cutoffPresets = [2, 5, 8];
  const allCutoffs = Array.from(new Set([...cutoffPresets, customHours])).sort((a, b) => a - b);

  // Minimum: 1.0 venue/hr, Avg: 1.75 venues/hr, Max: 2.5 venues/hr
  const data = allCutoffs.map(h => ({
    cutoff: `${h} Hours`,
    hours: h,
    Minimum: parseFloat((h * 1.0).toFixed(2)),
    Average: parseFloat((h * 1.75).toFixed(2)),
    Maximum: parseFloat((h * 2.5).toFixed(2))
  }));

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 7</span>
            <span>CUT-OFF ANALYSIS</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grouped bar chart comparing minimum, average, and maximum output at specific cut-offs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Custom Cut-off:</span>
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={customHours}
            onChange={(e) => setCustomHours(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
            className="w-16 px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-bold text-blue-900 bg-slate-50 text-center"
          />
          <span className="text-xs text-slate-500 font-semibold">Hours</span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="cutoff" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1">{label} Shift Cut-off</div>
                      <div className="text-amber-400 font-bold">Min: {payload[0]?.value} venues</div>
                      <div className="text-blue-400 font-bold">Avg: {payload[1]?.value} venues</div>
                      <div className="text-emerald-400 font-bold">Max: {payload[2]?.value} venues</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Minimum" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Average" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Maximum" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
