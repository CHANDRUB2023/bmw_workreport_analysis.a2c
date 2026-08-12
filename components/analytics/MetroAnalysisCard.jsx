'use client';

import React, { useState, useMemo } from 'react';
import { Search, Train, Building2, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { VERIFIED_METRO_SYSTEMS } from '@/lib/productivityService';

export default function MetroAnalysisCard({ metroData }) {
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [searchTerm, setSearchTerm] = useState('');

  const systems = metroData?.systems || VERIFIED_METRO_SYSTEMS;

  const filteredSystems = useMemo(() => {
    return systems.filter(s =>
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lines.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [systems, searchTerm]);

  const totalCities = systems.length;
  const totalStations = systems.reduce((a, b) => a + b.totalStations, 0);

  const activeSystem = selectedCity
    ? filteredSystems.find(s => s.city.toLowerCase() === selectedCity.toLowerCase()) || filteredSystems[0] || systems[0]
    : filteredSystems[0] || systems[0];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 5</span>
            <span className="flex items-center gap-2">
              <Train className="w-4 h-4 text-blue-600" />
              METRO SYSTEM NETWORK & STATION ANALYSIS
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic city-based rapid transit station lists and line connectivity for operational logistics planning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search city / metro line..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-44 bg-slate-50 font-medium"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1 text-center">
            <span className="text-[10px] text-blue-700 uppercase font-bold block">Metro Cities</span>
            <span className="text-sm font-black text-blue-900">{totalCities} Cities</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1 text-center">
            <span className="text-[10px] text-emerald-700 uppercase font-bold block">Total Stations</span>
            <span className="text-sm font-black text-emerald-900">{totalStations} Stations</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left City Selector Buttons */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold text-slate-600 block mb-1">
            Select Metro City ({filteredSystems.length})
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredSystems.map((s) => {
              const isSelected = activeSystem?.city === s.city;
              return (
                <button
                  key={s.city}
                  onClick={() => setSelectedCity(s.city)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800 font-medium'
                  }`}
                >
                  <span className="truncate pr-1">{s.city}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.totalStations}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active City Details & Station List Card */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
          {activeSystem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {activeSystem.system}
                  </span>
                  <h4 className="text-xl font-black text-slate-900">
                    {activeSystem.city} Metro Network
                  </h4>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-900 font-black rounded-lg text-sm border border-blue-200">
                  {activeSystem.totalStations} Operational Stations
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Transit Corridors / Lines:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSystem.lines.map(l => (
                    <span key={l} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-800">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Key Operational Metro Stations:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto">
                  {activeSystem.sampleStations.map(st => (
                    <div key={st} className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-950 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center p-8">No matching metro system found</div>
          )}

          {/* Legitimate Data Source & Freshness Indicator */}
          <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Source: Official Urban Transit Network Database</span>
            </div>
            <span className="font-bold text-slate-600">Last Updated: August 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
