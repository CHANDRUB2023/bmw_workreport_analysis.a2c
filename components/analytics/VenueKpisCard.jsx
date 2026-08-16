'use client';

import React from 'react';
import { Building2, MapPin, Trophy, CheckCircle, AlertCircle } from 'lucide-react';

export default function VenueKpisCard({ summary }) {
  const totalDistricts = summary?.totalDistricts ?? 0;
  const estimatedTotalVenues = summary?.estimatedTotalVenues ?? 0;
  const highestDistrict = summary?.highestVenueDistrict;
  const exactCount = summary?.exactCount ?? 0;
  const approximateCount = summary?.approximateCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: TOTAL DISTRICTS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            TOTAL DISTRICTS
          </span>
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {totalDistricts}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            Tamil Nadu Districts Analyzed
          </div>
        </div>
      </div>

      {/* KPI 2: ESTIMATED TOTAL VENUES */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            ESTIMATED TOTAL VENUES
          </span>
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
            {estimatedTotalVenues.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
            <span>Aggregated District Venues</span>
            <span className="text-amber-600 font-bold">(Includes ±)</span>
          </div>
        </div>
      </div>

      {/* KPI 3: HIGHEST VENUE DISTRICT */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            HIGHEST VENUE DISTRICT
          </span>
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {highestDistrict?.district || 'N/A'}
          </div>
          <div className="text-xs font-semibold text-blue-700 mt-1 flex items-center gap-1.5">
            <span className="font-extrabold">{highestDistrict?.displayVenue || '0'}</span>
            <span className="text-slate-300">•</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
              {highestDistrict?.isApproximate ? 'Approximate' : 'Exact'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: VENUE DATA TYPE */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            VENUE DATA TYPE
          </span>
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Exact:
            </span>
            <span className="text-slate-900 font-extrabold">{exactCount} Districts</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Approximate:
            </span>
            <span className="text-slate-900 font-extrabold">{approximateCount} Districts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
