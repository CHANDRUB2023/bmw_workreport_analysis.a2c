'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingDown } from 'lucide-react';

export default function PendingWorkBurndownCard() {
  const [remainingWork, setRemainingWork] = useState(90);
  const [members, setMembers] = useState(4);
  const [hours, setHours] = useState(8);
  const rate = 0.5625;

  const dailyOutput = members * hours * rate; // 18 venues/day
  const totalDays = Math.ceil(remainingWork / Math.max(dailyOutput, 0.1));

  const series = [];
  let remaining = remainingWork;

  for (let day = 0; day <= Math.min(totalDays + 2, 20); day++) {
    series.push({
      day: `Day ${day}`,
      dayNum: day,
      Remaining: Math.max(0, parseFloat(remaining.toFixed(1)))
    });
    remaining -= dailyOutput;
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 12</span>
            <span>PENDING WORK BURNDOWN FORECAST</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Day-by-day remaining workload trajectory until zero completion
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Output</span>
            <span className="text-sm font-extrabold text-blue-900">{dailyOutput.toFixed(1)} venues/day</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span>Target: {totalDays} Working Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Target Workload (Venues)</label>
          <input
            type="number" min="10" max="500" value={remainingWork}
            onChange={(e) => setRemainingWork(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-2.5 py-1 border border-slate-300 rounded-md font-bold bg-white"
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Assigned Team Members</label>
          <input
            type="number" min="1" max="30" value={members}
            onChange={(e) => setMembers(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-2.5 py-1 border border-slate-300 rounded-md font-bold bg-white"
          />
        </div>
        <div>
          <label className="font-bold text-slate-700 block mb-1">Working Hours / Day</label>
          <input
            type="number" min="1" max="16" value={hours}
            onChange={(e) => setHours(Math.max(1, Number(e.target.value) || 1))}
            className="w-full px-2.5 py-1 border border-slate-300 rounded-md font-bold bg-white"
          />
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl font-semibold">
                      <div className="border-b border-slate-700 pb-1 mb-1">{label}</div>
                      <div className="text-emerald-400 font-extrabold">{payload[0]?.value} Remaining Venues</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="Remaining" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
