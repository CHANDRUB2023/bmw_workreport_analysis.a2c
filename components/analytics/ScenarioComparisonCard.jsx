'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScenarioComparisonCard() {
  const [scenarios, setScenarios] = useState([
    { name: 'Current Baseline', members: 4, hours: 8, remaining: 90 },
    { name: 'Scenario A (Reduced Shift)', members: 4, hours: 5, remaining: 90 },
    { name: 'Scenario B (Expanded Team 5h)', members: 6, hours: 5, remaining: 90 },
    { name: 'Scenario C (Expanded Team 8h)', members: 6, hours: 8, remaining: 90 },
    { name: 'Scenario D (Max Operations)', members: 8, hours: 8, remaining: 90 }
  ]);

  const indRate = 0.5625;

  const data = scenarios.map(s => {
    const dailyCap = s.members * s.hours * indRate;
    const days = s.remaining > 0 ? parseFloat((s.remaining / Math.max(dailyCap, 0.1)).toFixed(1)) : 0;
    return {
      ...s,
      dailyCapacity: parseFloat(dailyCap.toFixed(1)),
      estimatedDays: days
    };
  });

  const handleUpdate = (idx, field, val) => {
    const updated = [...scenarios];
    updated[idx] = { ...updated[idx], [field]: Math.max(1, Number(val) || 1) };
    setScenarios(updated);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 10</span>
          <span>WORKFORCE SCENARIO COMPARISON</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Side-by-side scenario matrix comparing team size, hours, daily output, and completion timeframe
        </p>
      </div>

      {/* Editable Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
            <tr>
              <th className="p-2.5">Scenario Name</th>
              <th className="p-2.5">Members</th>
              <th className="p-2.5">Shift Hours</th>
              <th className="p-2.5">Daily Capacity</th>
              <th className="p-2.5">Remaining Work</th>
              <th className="p-2.5">Est. Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {data.map((row, idx) => (
              <tr key={row.name} className="hover:bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900">{row.name}</td>
                <td className="p-2.5">
                  <input
                    type="number" min="1" max="50" value={row.members}
                    onChange={(e) => handleUpdate(idx, 'members', e.target.value)}
                    className="w-14 px-2 py-1 border border-slate-300 rounded-md font-bold text-slate-800 bg-white"
                  />
                </td>
                <td className="p-2.5">
                  <input
                    type="number" min="1" max="24" value={row.hours}
                    onChange={(e) => handleUpdate(idx, 'hours', e.target.value)}
                    className="w-14 px-2 py-1 border border-slate-300 rounded-md font-bold text-slate-800 bg-white"
                  />
                </td>
                <td className="p-2.5 font-extrabold text-blue-900">{row.dailyCapacity} venues/d</td>
                <td className="p-2.5">
                  <input
                    type="number" min="10" max="1000" value={row.remaining}
                    onChange={(e) => handleUpdate(idx, 'remaining', e.target.value)}
                    className="w-16 px-2 py-1 border border-slate-300 rounded-md font-bold text-slate-800 bg-white"
                  />
                </td>
                <td className="p-2.5 font-black text-emerald-600">{row.estimatedDays} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison Grouped Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1">{label}</div>
                      <div className="text-blue-400">Daily Capacity: {payload[0]?.value} venues/day</div>
                      <div className="text-emerald-400 font-bold">Completion Time: {payload[1]?.value} Days</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="dailyCapacity" name="Daily Capacity (Venues)" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="estimatedDays" name="Estimated Completion (Days)" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
