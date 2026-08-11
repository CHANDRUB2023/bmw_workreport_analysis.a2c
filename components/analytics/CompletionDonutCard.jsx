'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle2, Clock, Hourglass } from 'lucide-react';

export default function CompletionDonutCard({
  tnCompleted = 8,
  tnProgress = 0,
  tnPending = 30,
  tnTotal = 38
}) {
  const completed = Math.max(0, tnCompleted);
  const progress = Math.max(0, tnProgress);
  const pending = Math.max(0, tnTotal - completed - progress);
  const percentage = parseFloat(((completed / tnTotal) * 100).toFixed(1));

  const data = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'In Progress', value: progress, color: '#f59e0b' },
    { name: 'Pending', value: pending, color: '#94a3b8' }
  ].filter(d => d.value > 0);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">DONUT</span>
          <span>DISTRICT COMPLETION DONUT</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic breakdown of completed, in-progress, and pending work items
        </p>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2 rounded-lg text-xs font-bold shadow-md">
                      {d.name}: {d.value} Districts ({((d.value / tnTotal) * 100).toFixed(1)}%)
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {completed} / {tnTotal}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Districts
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="text-center bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <span className="text-xs text-slate-500 block font-medium">Overall District Completion</span>
          <span className="text-xl font-black text-emerald-600">{percentage}% Completed</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
            <div className="font-extrabold text-emerald-900">{completed}</div>
            <div className="text-[9px] font-bold text-emerald-700 uppercase">Completed</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
            <div className="font-extrabold text-amber-900">{progress}</div>
            <div className="text-[9px] font-bold text-amber-700 uppercase">In Progress</div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-lg p-2 text-center">
            <div className="font-extrabold text-slate-800">{pending}</div>
            <div className="text-[9px] font-bold text-slate-600 uppercase">Pending</div>
          </div>
        </div>
      </div>
    </section>
  );
}
