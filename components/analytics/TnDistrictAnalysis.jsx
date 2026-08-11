'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, MapPin, Building, ShieldCheck, RotateCcw, Percent } from 'lucide-react';
import { isDistrictCompleted, normalizeTnDistrictName } from '@/lib/formatUtils';

export default function TnDistrictAnalysis({ tnDistricts = [] }) {
  const [selectedTnDistrict, setSelectedTnDistrict] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PENDING
  const [geojsonData, setGeojsonData] = useState(null);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayerRef = useRef(null);

  // Load TN GeoJSON boundary file
  useEffect(() => {
    fetch('/tamil-nadu-districts.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Failed to load TN GeoJSON map:', err));
  }, []);

  // Map of district names to data objects
  const tnDataMap = React.useMemo(() => {
    const map = {};
    (tnDistricts || []).forEach(d => {
      map[normalizeTnDistrictName(d.district).toLowerCase()] = d;
    });
    return map;
  }, [tnDistricts]);

  // Total TN Pincodes sum for percentage calculation
  const totalTnPincodes = React.useMemo(() => {
    return (tnDistricts || []).reduce((sum, d) => sum + (d.pincodeCount || 0), 0) || 1000;
  }, [tnDistricts]);

  // Leaflet Map Setup
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
        }).setView([11.1271, 78.6569], 7);
      }

      const map = leafletMapRef.current;

      if (leafletLayerRef.current) {
        map.removeLayer(leafletLayerRef.current);
      }

      const normSel = selectedTnDistrict ? selectedTnDistrict.district.toLowerCase().trim() : '';

      function style(feature) {
        const rawName = feature.properties.dtname || feature.properties.dist || 'District';
        const normName = normalizeTnDistrictName(rawName);
        const isSel = normSel && normName.toLowerCase() === normSel;
        const isComp = isDistrictCompleted(normName);

        let fill = '#cbd5e1'; // Light Gray (Pending)
        if (isComp) fill = '#059669'; // Emerald Green (Completed)
        if (isSel) fill = '#1d4ed8'; // Professional Blue (Selected)

        return {
          fillColor: fill,
          weight: isSel ? 3 : 1.5,
          opacity: 1,
          color: isSel ? '#1e3a8a' : '#ffffff',
          fillOpacity: isSel ? 0.95 : (isComp ? 0.85 : 0.65)
        };
      }

      function highlightFeature(e) {
        const layer = e.target;
        const rawName = layer.feature.properties.dtname || layer.feature.properties.dist || '';
        const normName = normalizeTnDistrictName(rawName);

        if (!normSel || normName.toLowerCase() !== normSel) {
          layer.setStyle({
            fillColor: '#2563eb',
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
        const rawName = feature.properties.dtname || feature.properties.dist || 'District';
        const normName = normalizeTnDistrictName(rawName);
        const isComp = isDistrictCompleted(normName);
        const dObj = tnDataMap[normName.toLowerCase()];
        const pinStr = dObj ? `${dObj.pincodeCount} Pincodes` : '';
        const statusStr = isComp ? 'COMPLETED' : 'PENDING';

        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <b style="font-size: 12px; color: #1e3a8a;">${normName}</b><br/>
            <span style="color: ${isComp ? '#059669' : '#d97706'}; font-weight: bold;">Status: ${statusStr}</span><br/>
            <b style="color: #2563eb;">${pinStr}</b>
          </div>`,
          { permanent: false, direction: 'center' }
        );

        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: () => {
            if (dObj) {
              setSelectedTnDistrict(dObj);
            } else {
              setSelectedTnDistrict({
                district: normName,
                state: 'TAMIL NADU',
                status: isComp ? 'COMPLETED' : 'PENDING',
                pincodeCount: 0,
                recordCount: 0
              });
            }
          }
        });
      }

      leafletLayerRef.current = L.geoJson(geojsonData, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);

      try {
        map.fitBounds(leafletLayerRef.current.getBounds(), { padding: [10, 10] });
      } catch (err) {}
    }
  }, [geojsonData, selectedTnDistrict, tnDataMap]);

  const filteredDistricts = tnDistricts.filter(d => {
    if (filter === 'COMPLETED') return d.status === 'COMPLETED';
    if (filter === 'PENDING') return d.status === 'PENDING';
    return true;
  });

  const activeDetail = selectedTnDistrict || (tnDistricts.length > 0 ? tnDistricts[0] : null);
  const districtPct = activeDetail && totalTnPincodes > 0
    ? ((activeDetail.pincodeCount / totalTnPincodes) * 100).toFixed(2)
    : '0.00';

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">SEC 3</span>
            <span>INTERACTIVE TAMIL NADU DISTRICT MAP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic polygons across all 38 districts. Click any polygon to inspect district details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTnDistrict && (
            <button
              onClick={() => setSelectedTnDistrict(null)}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET DISTRICT MAP
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {['ALL', 'COMPLETED', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 font-bold rounded-md transition-all ${
                  filter === f
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: GeoJSON Leaflet Polygon Map */}
        <div className="lg:col-span-7 space-y-2">
          <div
            ref={mapContainerRef}
            className="w-full h-[450px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"/> Completed (8)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"/> Pending (30)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"/> Selected</span>
            </div>
            <span>38 Districts Total</span>
          </div>
        </div>

        {/* Right: Selected District Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {activeDetail ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tamil Nadu District Details
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-0.5">
                      {activeDetail.district}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                    activeDetail.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {activeDetail.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">State</span>
                    <span className="text-xs font-bold text-slate-800">TAMIL NADU</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Unique Pincodes</span>
                    <span className="text-sm font-extrabold text-blue-900">{activeDetail.pincodeCount} PINs</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">% of TN Pincodes</span>
                    <span className="text-xs font-extrabold text-slate-800">{districtPct}%</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Post Offices</span>
                    <span className="text-xs font-bold text-slate-800">{activeDetail.recordCount} Records</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 text-center p-6">Select a district polygon on the map</div>
            )}
          </div>

          {/* District Buttons Grid */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 block">
              Quick District Select ({filteredDistricts.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
              {filteredDistricts.map((d) => {
                const isCompleted = d.status === 'COMPLETED';
                const isSelected = activeDetail?.district === d.district;

                return (
                  <button
                    key={d.district}
                    onClick={() => setSelectedTnDistrict(d)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100 font-medium'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate pr-1">{d.district}</span>
                    <span className={`text-[10px] font-bold ${
                      isSelected ? 'text-blue-100' : isCompleted ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      {d.pincodeCount}
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
