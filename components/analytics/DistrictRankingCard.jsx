'use client';

import React, { useState } from 'react';
import { Trophy, Building, MapPin } from 'lucide-react';

export default function DistrictRankingCard({ topDistrictsData = [] }) {
  const [topLimit, setTopLimit] = useState(10); // 5, 10, 20

  const visibleDistricts = topDistrictsData.slice(0, topLimit);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 15</span>
            <span>TOP DISTRICTS BY PINCODE COUNT</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked list of districts ordered descending by verified unique 6-digit pincode density
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {[5, 10, 20].map((limit) => (
            <button
              key={limit}
              onClick={() => setTopLimit(limit)}
              className={`px-3 py-1 font-bold rounded-md transition-all ${
                topLimit === limit
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top {limit}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
            <tr>
              <th className="p-3 w-16 text-center">Rank</th>
              <th className="p-3">District Name</th>
              <th className="p-3">State / Union Territory</th>
              <th className="p-3 text-right">Unique Pincode Count</th>
              <th className="p-3 text-right">Post Offices</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {visibleDistricts.map((d, idx) => (
              <tr key={`${d.district}-${d.state}`} className="hover:bg-slate-50">
                <td className="p-3 text-center font-black text-slate-500">
                  {idx === 0 ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[11px]">#1</span>
                  ) : idx === 1 ? (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md font-bold text-[11px]">#2</span>
                  ) : idx === 2 ? (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded-md font-bold text-[11px]">#3</span>
                  ) : (
                    `#${idx + 1}`
                  )}
                </td>
                <td className="p-3 font-bold text-slate-900">{d.district}</td>
                <td className="p-3 text-slate-600 font-semibold">{d.state}</td>
                <td className="p-3 text-right font-black text-blue-900">{d.pincodeCount} PINs</td>
                <td className="p-3 text-right text-slate-500">{d.recordCount} Records</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
