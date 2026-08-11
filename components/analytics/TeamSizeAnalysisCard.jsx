'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Clock } from 'lucide-react';

export default function TeamSizeAnalysisCard() {
  const [workingHours, setWorkingHours] = useState(8);

  const teamSizes = [1, 2, 3, 4, 5, 6, 8, 10];
  const indBaselineRate = 0.5625; // 18 / 32

  const data = teamSizes.map(members => {
    // Expected Output = Members * Hours * Productivity Rate
    const output = members * workingHours * indBaselineRate;
    const minOutput = members * workingHours * (1.0 / 4);
    const maxOutput = members * workingHours * (2.5 / 4);

    return {
      teamLabel: `${members} M`,
      members,
      Minimum: parseFloat(minOutput.toFixed(2)),
      Baseline: parseFloat(output.toFixed(2)),
      Maximum: parseFloat(maxOutput.toFixed(2))
    };
  });

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 8</span>
            <span>TEAM SIZE VS EXPECTED OUTPUT</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Theoretical daily output scaling across workforce sizes (1 to 10 team members)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Shift Hours:</span>
          </label>
          <select
            value={workingHours}
            onChange={(e) => setWorkingHours(Number(e.target.value))}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-bold text-blue-900 bg-slate-50"
          >
            {[2, 4, 5, 6, 8, 10, 12].map(h => (
              <option key={h} value={h}>{h} Hours</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="teamLabel" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1">{label} Team ({workingHours}h Shift)</div>
                      <div className="text-amber-400">Min: {payload[0]?.value} venues</div>
                      <div className="text-blue-400 font-extrabold">Baseline: {payload[1]?.value} venues</div>
                      <div className="text-emerald-400">Max: {payload[2]?.value} venues</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Minimum" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Baseline" fill="#1e40af" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Maximum" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
