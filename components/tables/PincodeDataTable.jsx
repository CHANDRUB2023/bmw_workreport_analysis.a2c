'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RotateCcw, Download, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { exportRecordsToCSV, exportRecordsToExcel } from '@/lib/exportUtils';

export default function PincodeDataTable() {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('pincode');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch available states on mount
  useEffect(() => {
    fetch('/api/pincode?action=states')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setStatesList(resData.states || []);
      })
      .catch((err) => console.error('Failed to load states:', err));
  }, []);

  // Fetch available districts when selectedState changes
  useEffect(() => {
    if (!selectedState) {
      setDistrictsList([]);
      setSelectedDistrict('');
      return;
    }

    fetch(`/api/pincode?action=districts&state=${encodeURIComponent(selectedState)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setDistrictsList(resData.districts || []);
      })
      .catch((err) => console.error('Failed to load districts:', err));
  }, [selectedState]);

  // Fetch paginated dataset search results
  const fetchData = () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      action: 'search',
      query,
      state: selectedState,
      district: selectedDistrict,
      page: page.toString(),
      pageSize: pageSize.toString()
    });

    fetch(`/api/pincode?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || 'Failed to query pincode records');
        }
      })
      .catch((err) => {
        console.error('Error querying pincode records:', err);
        setError(err.message || 'Dataset processing error');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [query, selectedState, selectedDistrict, page, pageSize]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!data?.records) return [];
    return [...data.records].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 4</span>
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              MASTER DATASET EXPLORER & TABLE
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Query across 165,627 verified All-India postal records with real-time state, district & pincode filtering.
          </p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRecordsToCSV(sortedRecords)}
            disabled={!data || sortedRecords.length === 0}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            CSV EXPORT
          </button>
          <button
            onClick={() => exportRecordsToExcel(sortedRecords)}
            disabled={!data || sortedRecords.length === 0}
            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            EXCEL EXPORT
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        {/* Search input */}
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by PIN, Office, Area, District..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* State filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="">All States / UTs ({statesList.length})</option>
            {statesList.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setPage(1);
            }}
            disabled={!selectedState}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 disabled:opacity-50"
          >
            <option value="">All Districts ({districtsList.length})</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        <div className="sm:col-span-2">
          <button
            onClick={handleResetFilters}
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('pincode')}>
                Pincode {sortField === 'pincode' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('officename')}>
                Post Office Name {sortField === 'officename' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="p-3">Type</th>
              <th className="p-3">Delivery</th>
              <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('district')}>
                District {sortField === 'district' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="p-3 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('statename')}>
                State / UT {sortField === 'statename' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Filtering records...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-rose-600 font-bold">
                  {error}
                </td>
              </tr>
            )}

            {!isLoading && !error && sortedRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No matching records found. Try adjusting your search query or filters.
                </td>
              </tr>
            )}

            {!isLoading && !error && sortedRecords.map((r, idx) => (
              <tr key={`${r.pincode}-${r.officename}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 font-mono font-extrabold text-blue-800">{r.pincode}</td>
                <td className="p-3 font-bold text-slate-900">{r.officename}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    {r.officetype || 'PO'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    r.delivery === 'Delivery' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.delivery}
                  </span>
                </td>
                <td className="p-3">{r.district}</td>
                <td className="p-3 font-semibold text-slate-700">{r.statename}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
          <div>
            Showing <span className="font-bold text-slate-900">{data.records?.length || 0}</span> of{' '}
            <span className="font-bold text-slate-900">{data.total?.toLocaleString() || 0}</span> total matching records
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 font-bold text-slate-800"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800 px-2">
                Page {data.page} of {data.totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages || 1, p + 1))}
                disabled={page >= (data.totalPages || 1)}
                className="p-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
