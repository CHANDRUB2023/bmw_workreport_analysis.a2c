'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Table as TableIcon, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function DistrictVenueTableCard({ districts = [], onSelectDistrict }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'EXACT', 'APPROX', 'COMPLETED'
  const [sortField, setSortField] = useState('rank'); // 'rank', 'district', 'venueCount', 'pincodeCount', 'status'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'

  const dynamicKeys = useMemo(() => {
    const keysSet = new Set();
    districts.forEach(d => {
      if (d.additionalFields) {
        Object.keys(d.additionalFields).forEach(k => keysSet.add(k));
      }
    });
    return Array.from(keysSet);
  }, [districts]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'district' || field === 'status' ? 'asc' : (field === 'rank' ? 'asc' : 'desc'));
    }
  };

  const processedDistricts = useMemo(() => {
    let list = [...districts];

    // Filter by type or status
    if (filterType === 'EXACT') {
      list = list.filter(d => !d.isApproximate);
    } else if (filterType === 'APPROX') {
      list = list.filter(d => d.isApproximate);
    } else if (filterType === 'COMPLETED') {
      list = list.filter(d => d.status === 'COMPLETED');
    }

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(d => {
        const matchesDistrict = d.district.toLowerCase().includes(q);
        const matchesDynamic = d.additionalFields && Object.values(d.additionalFields).some(val => String(val).toLowerCase().includes(q));
        return matchesDistrict || matchesDynamic;
      });
    }

    // Sort
    list.sort((a, b) => {
      let aVal = a[sortField] ?? a.additionalFields?.[sortField];
      let bVal = b[sortField] ?? b.additionalFields?.[sortField];

      if (typeof aVal === 'string') {
        const comp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comp : -comp;
      }

      aVal = aVal || 0;
      bVal = bVal || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [districts, filterType, searchTerm, sortField, sortDirection]);

  const totalColumnsCount = 6 + dynamicKeys.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-blue-600" />
            <span>DISTRICT VENUE MASTER DATA TABLE</span>
            {dynamicKeys.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-blue-100 text-blue-800 rounded-full">
                +{dynamicKeys.length} Dynamic Field{dynamicKeys.length > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full tabular list of Tamil Nadu district venue volumes, status, and precision types.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search district or field..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type / Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'EXACT', label: 'Exact' },
              { id: 'APPROX', label: 'Approximate ±' },
              { id: 'COMPLETED', label: 'Completed' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[480px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 z-10">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Rank</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('district')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>District Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('venueCount')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Venue Count</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3">
                <span>Data Type</span>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('pincodeCount')}
                className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Unique Pincodes</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* Dynamic Headers */}
              {dynamicKeys.map(k => (
                <th
                  key={k}
                  onClick={() => handleSort(k)}
                  className="px-4 py-3 cursor-pointer hover:bg-blue-100 bg-blue-50/50 text-blue-900 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{k}</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {processedDistricts.length > 0 ? (
              processedDistricts.map((d) => (
                <tr
                  key={d.district}
                  onClick={() => onSelectDistrict && onSelectDistrict(d)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-2.5 font-bold text-slate-500">
                    #{d.rank}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">
                    {d.district}
                  </td>
                  <td className="px-4 py-2.5 font-extrabold text-blue-900">
                    {d.displayVenue}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.isApproximate ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-700" /> Approximate (±)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-700" /> Exact
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {d.status === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-700" /> COMPLETED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {d.status || 'PENDING'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 font-bold">
                    {d.pincodeCount} PINs
                  </td>

                  {/* Dynamic Cell Values */}
                  {dynamicKeys.map(k => (
                    <td key={k} className="px-4 py-2.5 font-bold text-slate-800 bg-blue-50/20">
                      {d.additionalFields?.[k] !== undefined && d.additionalFields?.[k] !== null
                        ? String(d.additionalFields[k])
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={totalColumnsCount} className="text-center text-slate-400 py-8">
                  No matching district records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
        <span>Showing {processedDistricts.length} of {districts.length} District Records</span>
        <span className="text-[11px] text-slate-400">Click any row to select district details</span>
      </div>
    </div>
  );
}
