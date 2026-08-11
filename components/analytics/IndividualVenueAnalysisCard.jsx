'use client';

import React, { useState } from 'react';
import { Building2, CheckCircle2, Clock, MapPin, Search, Tag, Filter } from 'lucide-react';

const SAMPLE_INDIVIDUAL_VENUES = [
  { id: 'V-641001', name: 'Coimbatore Main PO Venue', district: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', type: 'Head Post Office', status: 'Completed', progressPct: 100, lastVerified: 'Today, 14:30' },
  { id: 'V-682001', name: 'Ernakulam South Operational Hub', district: 'Ernakulam', state: 'Kerala', pincode: '682001', type: 'Sub Post Office', status: 'Completed', progressPct: 100, lastVerified: 'Yesterday' },
  { id: 'V-600001', name: 'Chennai GPO Central Terminal', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001', type: 'General Post Office', status: 'Completed', progressPct: 100, lastVerified: 'Today, 09:15' },
  { id: 'V-625001', name: 'Madurai Collectorate Complex', district: 'Madurai', state: 'Tamil Nadu', pincode: '625001', type: 'Sub Office', status: 'In Progress', progressPct: 75, lastVerified: 'In Progress' },
  { id: 'V-636001', name: 'Salem Head Post Office Venue', district: 'Salem', state: 'Tamil Nadu', pincode: '636001', type: 'Head Post Office', status: 'Completed', progressPct: 100, lastVerified: 'Today, 11:00' },
  { id: 'V-620001', name: 'Tiruchirappalli Town Terminal', district: 'Tiruchirappalli', state: 'Tamil Nadu', pincode: '620001', type: 'Branch Office', status: 'Completed', progressPct: 100, lastVerified: '2 days ago' },
  { id: 'V-638001', name: 'Erode Main Sorting Center', district: 'Erode', state: 'Tamil Nadu', pincode: '638001', type: 'Sub Office', status: 'In Progress', progressPct: 60, lastVerified: 'In Progress' },
  { id: 'V-603001', name: 'Chengalpattu District Terminal', district: 'Chengalpattu', state: 'Tamil Nadu', pincode: '603001', type: 'Sub Office', status: 'In Progress', progressPct: 40, lastVerified: 'Scheduled' }
];

export default function IndividualVenueAnalysisCard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredVenues = SAMPLE_INDIVIDUAL_VENUES.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.pincode.includes(searchTerm);
    if (statusFilter === 'COMPLETED') return matchesSearch && v.status === 'Completed';
    if (statusFilter === 'PROGRESS') return matchesSearch && v.status === 'In Progress';
    return matchesSearch;
  });

  const completedVenues = SAMPLE_INDIVIDUAL_VENUES.filter(v => v.status === 'Completed').length;
  const inProgressVenues = SAMPLE_INDIVIDUAL_VENUES.filter(v => v.status === 'In Progress').length;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 4</span>
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              INDIVIDUAL VENUE ANALYSIS
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Venue-level operational audit, verification status, and completion progress metrics across active centers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {['ALL', 'COMPLETED', 'PROGRESS'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                  statusFilter === f
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tracked Venues</span>
            <span className="text-lg font-black text-slate-900">{SAMPLE_INDIVIDUAL_VENUES.length} Venues</span>
          </div>
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>

        <div className="bg-slate-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Verified Completed</span>
            <span className="text-lg font-black text-emerald-900">{completedVenues} Venues</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-slate-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase block">Verification In Progress</span>
            <span className="text-lg font-black text-amber-900">{inProgressVenues} Venues</span>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter venues by name, district, or pincode..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
        />
      </div>

      {/* Individual Venues Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3">Venue Code</th>
              <th className="p-3">Venue Name</th>
              <th className="p-3">District / State</th>
              <th className="p-3">Pincode</th>
              <th className="p-3">Type</th>
              <th className="p-3">Completion Status</th>
              <th className="p-3 text-right">Audit Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {filteredVenues.map(v => (
              <tr key={v.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 font-mono font-extrabold text-blue-800">{v.id}</td>
                <td className="p-3 font-bold text-slate-900">{v.name}</td>
                <td className="p-3 text-slate-600">{v.district}, {v.state}</td>
                <td className="p-3 font-mono font-bold text-slate-900">{v.pincode}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    {v.type}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border ${
                    v.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${v.status === 'Completed' ? 'bg-emerald-600' : 'bg-amber-500'}`}
                        style={{ width: `${v.progressPct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold">{v.progressPct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
