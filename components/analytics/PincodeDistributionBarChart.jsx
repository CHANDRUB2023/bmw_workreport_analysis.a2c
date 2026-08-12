'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Search, ArrowUpDown } from 'lucide-react';

export default function PincodeDistributionBarChart({ districtsData = [] }) {
  const [topLimit, setTopLimit] = useState(10); // 5, 10, 20, 'ALL'
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const processedData = useMemo(() => {
    let filtered = districtsData.filter(d =>
      d.district.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => sortAsc ? a.pincodeCount - b.pincodeCount : b.pincodeCount - a.pincodeCount);

    if (topLimit !== 'ALL') {
      filtered = filtered.slice(0, Number(topLimit));
    }

    return filtered;
  }, [districtsData, topLimit, search, sortAsc]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 9</span>
            <span>DISTRICT-WISE PINCODE DISTRIBUTION</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Unique 6-digit postal code count per district extracted from master CSV
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Top N Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[5, 10, 20, 'ALL'].map((limit) => (
              <button
                key={String(limit)}
                onClick={() => setTopLimit(limit)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  topLimit === limit
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {limit === 'ALL' ? 'All' : `Top ${limit}`}
              </button>
            ))}
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortAsc ? 'Ascending' : 'Descending'}</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search district/state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 bg-slate-50"
            />
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        {processedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={processedData}
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="district"
                tick={{ fontSize: 11, fontWeight: 600 }}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                        <div className="font-bold">{data.district}</div>
                        <div className="text-slate-300">{data.state}</div>
                        <div className="text-blue-300 font-extrabold">{data.pincodeCount} Unique Pincodes</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pincodeCount" radius={[0, 4, 4, 0]}>
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#1e40af' : index < 3 ? '#2563eb' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No matching district data found
          </div>
        )}
      </div>
    </section>
  );
}
