'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building, Info, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { normalizeStateName } from '@/lib/formatUtils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function IndiaGeoAnalysis({ statesData = [], selectedState, onSelectState }) {
  const [search, setSearch] = useState('');
  const [geojsonData, setGeojsonData] = useState(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayerRef = useRef(null);

  // Load local GeoJSON map data
  useEffect(() => {
    fetch('/india-states.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Failed to load India GeoJSON map:', err));
  }, []);

  // Map state data lookup table for hover/tooltip
  const statesMapObj = React.useMemo(() => {
    const map = {};
    (statesData || []).forEach(s => {
      map[s.stateName.toUpperCase()] = s;
    });
    return map;
  }, [statesData]);

  // Leaflet Map Initialization & Rendering
  useEffect(() => {
    if (!geojsonData || typeof window === 'undefined') return;

    const L = window.L;
    if (!L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initLeafletMap(window.L);
      document.head.appendChild(script);
    } else {
      initLeafletMap(L);
    }

    function initLeafletMap(L) {
      if (!mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          attributionControl: false
        }).setView([22.5937, 78.9629], 4);
      }

      const map = leafletMapRef.current;

      if (leafletLayerRef.current) {
        map.removeLayer(leafletLayerRef.current);
      }

      const normSel = selectedState ? normalizeStateName(selectedState) : '';

      function style(feature) {
        const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || '';
        const normName = normalizeStateName(rawName);
        const isSel = normSel && normName === normSel;

        return {
          fillColor: isSel ? '#1d4ed8' : '#cbd5e1',
          weight: isSel ? 3 : 1.5,
          opacity: 1,
          color: isSel ? '#1e3a8a' : '#ffffff',
          fillOpacity: isSel ? 0.95 : 0.7
        };
      }

      function highlightFeature(e) {
        const layer = e.target;
        const rawName = layer.feature.properties.NAME_1 || layer.feature.properties.ST_NM || '';
        const normName = normalizeStateName(rawName);
        if (!normSel || normName !== normSel) {
          layer.setStyle({
            fillColor: '#3b82f6',
            weight: 2.5,
            color: '#1d4ed8',
            fillOpacity: 0.9
          });
        }
      }

      function resetHighlight(e) {
        if (leafletLayerRef.current) {
          leafletLayerRef.current.resetStyle(e.target);
        }
      }

      function onEachFeature(feature, layer) {
        const rawName = feature.properties.NAME_1 || feature.properties.ST_NM || 'State';
        const normName = normalizeStateName(rawName);
        const sInfo = statesMapObj[normName] || null;

        const distCount = sInfo ? `${sInfo.districtCount} Districts` : 'State Boundary';
        const pinCount = sInfo ? `${sInfo.pincodeCount.toLocaleString()} Pincodes` : '';

        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <b style="font-size: 12px; color: #1e3a8a;">${rawName}</b><br/>
            <span style="color: #475569;">${distCount}</span><br/>
            <b style="color: #2563eb;">${pinCount}</b>
          </div>`,
          { permanent: false, direction: 'center' }
        );

        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: () => {
            onSelectState(normName);
          }
        });
      }

      leafletLayerRef.current = L.geoJson(geojsonData, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);
    }
  }, [geojsonData, selectedState, onSelectState, statesMapObj]);

  const filteredStates = statesData.filter(s =>
    s.stateName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedData = statesData.find(
    s => s.stateName.toUpperCase() === (selectedState || '').toUpperCase()
  ) || null;

  // Aggregate All-India summary if no state selected
  const allIndiaSummary = {
    totalStates: statesData.length || 37,
    totalDistricts: statesData.reduce((acc, s) => acc + s.districtCount, 0) || 755,
    totalPincodes: statesData.reduce((acc, s) => acc + s.pincodeCount, 0) || 19586
  };

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/90 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-black bg-blue-100 text-blue-800 rounded-md">SEC 02</span>
            <span>INTERACTIVE INDIA GEOGRAPHIC MAP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real GeoJSON polygon boundaries. Click any state to inspect pincode density & details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedState && (
            <button
              onClick={() => onSelectState(null)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET MAP
            </button>
          )}

          <input
            type="text"
            placeholder="Search state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-36 sm:w-44 bg-slate-50 transition-all focus:bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Polygon Map */}
        <div className="lg:col-span-7 space-y-2">
          <div
            ref={mapContainerRef}
            className="w-full h-[450px] rounded-2xl border border-slate-200/90 bg-slate-50 overflow-hidden shadow-2xs leaflet-container-isolated"
          />
          <div className="text-[11px] text-slate-500 text-center font-medium">
            Hover over any state to preview statistics • Click boundary polygon to select state
          </div>
        </div>

        {/* Right: State Selector & Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* State Details Card */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {selectedData ? 'State Details Panel' : 'All-India Overview'}
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedData ? selectedData.stateName : 'India (All 37 States / UTs)'}
                </h4>
              </div>

              {selectedData?.isTamilNadu && (
                <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-lg shadow-2xs">
                  Target State
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total Districts</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  <AnimatedCounter value={selectedData ? selectedData.districtCount : allIndiaSummary.totalDistricts} />
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Unique PINs</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  <AnimatedCounter value={selectedData ? selectedData.pincodeCount : allIndiaSummary.totalPincodes} />
                </div>
              </div>
            </div>

            {selectedData?.isTamilNadu ? (
              <div className="bg-white border border-amber-200 rounded-xl p-3 space-y-2 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-1">
                  Tamil Nadu Operational Breakdown
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed: 8 Districts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Pending: 30 Districts</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 bg-white border border-slate-200/80 rounded-xl p-2.5 flex items-start gap-2 shadow-2xs">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  {selectedData
                    ? `Exact dataset records loaded for ${selectedData.stateName}. Map boundaries mapped via GeoJSON.`
                    : 'Click any state on the map or list below to select and view state statistics.'}
                </span>
              </div>
            )}
          </div>

          {/* Quick State Grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 block">
              Quick State List ({filteredStates.length})
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[170px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredStates.map((st) => {
                const isSelected = (selectedState || '').toUpperCase() === st.stateName.toUpperCase();
                return (
                  <button
                    key={st.stateName}
                    onClick={() => onSelectState(st.stateName)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'bg-slate-50/80 text-slate-800 border-slate-200/80 hover:bg-slate-100 font-medium hover:translate-x-0.5'
                    }`}
                  >
                    <span className="truncate pr-1">{st.stateName}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {st.districtCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
