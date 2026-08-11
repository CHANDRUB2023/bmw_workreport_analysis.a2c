'use client';

import React from 'react';

export default function ScenarioHeatmapCard({ individualHourlyRate = 0.5625 }) {
  const membersList = [1, 2, 3, 4, 5, 6, 8, 10];
  const hoursList = [2, 4, 5, 6, 8];

  // Calculate max possible output for color scaling
  const maxVal = 10 * 8 * individualHourlyRate; // 45 venues

  const getBgStyle = (val) => {
    const ratio = Math.min(1, val / maxVal);
    // Light blue to deep indigo
    if (ratio < 0.15) return 'bg-blue-50 text-slate-700';
    if (ratio < 0.3) return 'bg-blue-100 text-blue-900 font-bold';
    if (ratio < 0.5) return 'bg-blue-200 text-blue-950 font-bold';
    if (ratio < 0.75) return 'bg-blue-600 text-white font-extrabold';
    return 'bg-blue-900 text-white font-black';
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 11</span>
          <span>SCENARIO HEATMAP (TEAM SIZE × WORKING HOURS)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Expected daily venue output matrix across team size and shift duration combinations
        </p>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
              <th className="p-2.5 text-left border-r border-slate-200">Team Size</th>
              {hoursList.map(h => (
                <th key={h} className="p-2.5">{h} Hours / Shift</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {membersList.map(m => (
              <tr key={m}>
                <td className="p-2.5 font-bold text-slate-900 bg-slate-50 border-r border-slate-200 text-left">
                  {m} {m === 1 ? 'Member' : 'Members'}
                </td>
                {hoursList.map(h => {
                  const output = parseFloat((m * h * individualHourlyRate).toFixed(1));
                  const bgClass = getBgStyle(output);
                  return (
                    <td
                      key={h}
                      className={`p-3 transition-colors relative group border-r border-slate-100 ${bgClass}`}
                    >
                      <span className="text-sm tracking-tight">{output}</span>
                      <span className="text-[10px] opacity-75 block">venues</span>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-44 bg-slate-900 text-white text-[11px] p-2 rounded. shadow-xl pointer-events-none text-center">
                        <div className="font-bold">{m} Members × {h} Hours</div>
                        <div className="text-blue-300 font-extrabold">{output} Expected Venues</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
