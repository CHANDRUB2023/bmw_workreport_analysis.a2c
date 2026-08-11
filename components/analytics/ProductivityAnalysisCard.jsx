'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Clock } from 'lucide-react';

export default function ProductivityAnalysisCard() {
  const [selectedHours, setSelectedHours] = useState(8);

  // Generate series for hours 1 to 12
  // Min: 1 venue/hr, Avg: 1.75 venues/hr, Max: 2.5 venues/hr
  const series = [];
  for (let h = 1; h <= 12; h++) {
    series.push({
      hour: `${h}h`,
      hoursNum: h,
      minOutput: parseFloat((h * 1.0).toFixed(2)),
      avgOutput: parseFloat((h * 1.75).toFixed(2)),
      maxOutput: parseFloat((h * 2.5).toFixed(2)),
      baseline: parseFloat((h * 2.25).toFixed(2)) // 18 venues / 8h = 2.25/h
    });
  }

  const activeData = series.find(s => s.hoursNum === selectedHours) || series[7];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 6</span>
            <h3 className="text-base font-extrabold text-slate-900">WORKING HOURS VS EXPECTED OUTPUT</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theoretical productivity estimation curves over 1 to 12 working hours
          </p>
        </div>

        {/* Theoretical Label Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>THEORETICAL PRODUCTIVITY ESTIMATE</span>
        </div>
      </div>

      {/* Input Controls & Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="md:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Select Working Hours:</span>
            </label>
            <span className="text-sm font-black text-blue-900 px-2 py-0.5 bg-white border border-blue-200 rounded-md">
              {selectedHours} Hours
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={selectedHours}
            onChange={(e) => setSelectedHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>1 Hour</span>
            <span>4 Hours</span>
            <span>8 Hours (Default)</span>
            <span>12 Hours</span>
          </div>
        </div>

        <div className="md:col-span-6 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white border border-slate-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Min (1.0/h)</span>
            <span className="text-lg font-black text-slate-800">{activeData.minOutput}</span>
            <span className="text-[10px] text-slate-400 block">Venues</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Avg (1.75/h)</span>
            <span className="text-lg font-black text-blue-900">{activeData.avgOutput}</span>
            <span className="text-[10px] text-blue-700 block">Venues</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Max (2.5/h)</span>
            <span className="text-lg font-black text-emerald-900">{activeData.maxOutput}</span>
            <span className="text-[10px] text-emerald-700 block">Venues</span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-xl space-y-1">
                      <div className="font-bold border-b border-slate-700 pb-1">{label} Shift</div>
                      <div className="text-slate-300">Min: <span className="font-bold text-amber-400">{payload[0]?.value} venues</span></div>
                      <div className="text-slate-300">Avg: <span className="font-bold text-blue-400">{payload[1]?.value} venues</span></div>
                      <div className="text-slate-300">Max: <span className="font-bold text-emerald-400">{payload[2]?.value} venues</span></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="minOutput" name="Minimum (1.0/h)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="avgOutput" name="Average (1.75/h)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="maxOutput" name="Maximum (2.5/h)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
