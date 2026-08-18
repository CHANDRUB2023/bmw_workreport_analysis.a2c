'use client';

import React from 'react';
import { Building2, MapPin, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function VenueKpisCard({ summary }) {
  const totalDistricts = summary?.totalDistricts ?? 0;
  const estimatedTotalVenues = summary?.estimatedTotalVenues ?? 0;
  const highestDistrict = summary?.highestVenueDistrict;
  const exactCount = summary?.exactCount ?? 0;
  const approximateCount = summary?.approximateCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: TOTAL DISTRICTS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-lg hover:border-blue-300/80 transition-all duration-300 flex flex-col justify-between group cursor-pointer premium-card-hover animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            TOTAL DISTRICTS
          </span>
          <div className="p-2 rounded-xl bg-blue-100/90 text-blue-700 border border-blue-200/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            <AnimatedCounter value={totalDistricts} />
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            Tamil Nadu Districts Analyzed
          </div>
        </div>
      </div>

      {/* KPI 2: ESTIMATED TOTAL VENUES */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 flex flex-col justify-between group cursor-pointer premium-card-hover animate-fade-in" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            ESTIMATED TOTAL VENUES
          </span>
          <div className="p-2 rounded-xl bg-emerald-100/90 text-emerald-700 border border-emerald-200/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
            <AnimatedCounter value={estimatedTotalVenues} />
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
            <span>Aggregated District Venues</span>
            <span className="text-amber-600 font-bold">(Includes ±)</span>
          </div>
        </div>
      </div>

      {/* KPI 3: HIGHEST VENUE DISTRICT */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-lg hover:border-amber-300/80 transition-all duration-300 flex flex-col justify-between group cursor-pointer premium-card-hover animate-fade-in" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            HIGHEST VENUE DISTRICT
          </span>
          <div className="p-2 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
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
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200/60">
              {highestDistrict?.isApproximate ? 'Approximate' : 'Exact'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: VENUE DATA TYPE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-lg hover:border-purple-300/80 transition-all duration-300 flex flex-col justify-between group cursor-pointer premium-card-hover animate-fade-in" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            VENUE DATA TYPE
          </span>
          <div className="p-2 rounded-xl bg-purple-100/90 text-purple-700 border border-purple-200/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Exact:
            </span>
            <span className="text-slate-900 font-extrabold">
              <AnimatedCounter value={exactCount} suffix=" Districts" />
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Approximate:
            </span>
            <span className="text-slate-900 font-extrabold">
              <AnimatedCounter value={approximateCount} suffix=" Districts" />
            </span>
          </div>

          {/* Progress Bar for Exact Ratio */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mt-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-progress-grow"
              style={{ '--target-width': `${totalDistricts > 0 ? Math.round((exactCount / totalDistricts) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
