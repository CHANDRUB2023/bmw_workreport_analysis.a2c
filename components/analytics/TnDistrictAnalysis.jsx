'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, MapPin, Building, ShieldCheck, RotateCcw, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { COMPLETED_TN_DISTRICTS, normalizeTnDistrictName } from '@/lib/formatUtils';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

const STORAGE_KEY = 'a2c_tn_district_status_v1';

export default function TnDistrictAnalysis({ tnDistricts = [], onStatusChange }) {
  const [selectedTnDistrict, setSelectedTnDistrict] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, PROGRESS, PENDING
  const [geojsonData, setGeojsonData] = useState(null);
  
  // Persistent district status map
  const [districtStatuses, setDistrictStatuses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {}
    }
    // Default initial status
    const initial = {};
    (COMPLETED_TN_DISTRICTS || []).forEach(d => {
      initial[d.toLowerCase()] = { completed: true, progress: false };
    });
    return initial;
  });

  // Save status changes to localStorage & notify parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(districtStatuses));
      } catch (err) {}
    }

    // Calculate aggregated statistics
    let compCount = 0;
    let progCount = 0;
    const totalDistricts = Math.max(tnDistricts.length, 38);

    Object.values(districtStatuses).forEach(st => {
      if (st?.completed) compCount += 1;
      else if (st?.progress) progCount += 1;
    });

    const pendCount = Math.max(0, totalDistricts - compCount - progCount);
    const compPct = parseFloat(((compCount / totalDistricts) * 100).toFixed(1));

    if (onStatusChange) {
      onStatusChange({
        completedCount: compCount,
        progressCount: progCount,
        pendingCount: pendCount,
        totalDistricts,
        completionPct: compPct,
        statusMap: districtStatuses
      });
    }
  }, [districtStatuses, tnDistricts, onStatusChange]);

  const toggleDistrictCompleted = (districtName) => {
    const key = normalizeTnDistrictName(districtName).toLowerCase();
    setDistrictStatuses(prev => {
      const current = prev[key] || { completed: false, progress: false };
      const nextCompleted = !current.completed;
      return {
        ...prev,
        [key]: { completed: nextCompleted, progress: nextCompleted ? false : current.progress }
      };
    });
  };

  const toggleDistrictProgress = (districtName) => {
    const key = normalizeTnDistrictName(districtName).toLowerCase();
    setDistrictStatuses(prev => {
      const current = prev[key] || { completed: false, progress: false };
      const nextProgress = !current.progress;
      return {
        ...prev,
        [key]: { completed: nextProgress ? false : current.completed, progress: nextProgress }
      };
    });
  };

  const resetAllStatuses = () => {
    const initial = {};
    (COMPLETED_TN_DISTRICTS || []).forEach(d => {
      initial[d.toLowerCase()] = { completed: true, progress: false };
    });
    setDistrictStatuses(initial);
  };

  // Load TN GeoJSON boundary file
  useEffect(() => {
    fetch('/tamil-nadu-districts.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Failed to load TN GeoJSON map:', err));
  }, []);

  const tnDataMap = React.useMemo(() => {
    const map = {};
    (tnDistricts || []).forEach(d => {
      map[normalizeTnDistrictName(d.district).toLowerCase()] = d;
    });
    return map;
  }, [tnDistricts]);

  const totalTnPincodes = React.useMemo(() => {
    return (tnDistricts || []).reduce((sum, d) => sum + (d.pincodeCount || 0), 0) || 1000;
  }, [tnDistricts]);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayerRef = useRef(null);

  // Protected Leaflet Map Setup
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
        const normKey = normName.toLowerCase();
        const isSel = normSel && normKey === normSel;
        const stObj = districtStatuses[normKey] || {};

        let fill = '#cbd5e1'; // Slate (Pending)
        if (stObj.completed) fill = '#059669'; // Emerald (Completed)
        else if (stObj.progress) fill = '#d97706'; // Amber (Progress)
        if (isSel) fill = '#1d4ed8'; // Blue (Selected)

        return {
          fillColor: fill,
          weight: isSel ? 3 : 1.5,
          opacity: 1,
          color: isSel ? '#1e3a8a' : '#ffffff',
          fillOpacity: isSel ? 0.95 : (stObj.completed ? 0.85 : 0.7)
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
        const normKey = normName.toLowerCase();
        const stObj = districtStatuses[normKey] || {};
        const dObj = tnDataMap[normKey];
        const pinStr = dObj ? `${dObj.pincodeCount} Pincodes` : '';
        const statusStr = stObj.completed ? 'COMPLETED' : (stObj.progress ? 'IN PROGRESS' : 'PENDING');

        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <b style="font-size: 12px; color: #1e3a8a;">${normName}</b><br/>
            <span style="color: ${stObj.completed ? '#059669' : (stObj.progress ? '#d97706' : '#64748b')}; font-weight: bold;">Status: ${statusStr}</span><br/>
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
  }, [geojsonData, selectedTnDistrict, tnDataMap, districtStatuses]);

  const filteredDistricts = tnDistricts.filter(d => {
    const key = normalizeTnDistrictName(d.district).toLowerCase();
    const stObj = districtStatuses[key] || {};
    if (filter === 'COMPLETED') return stObj.completed;
    if (filter === 'PROGRESS') return stObj.progress;
    if (filter === 'PENDING') return !stObj.completed && !stObj.progress;
    return true;
  });

  const activeDetail = selectedTnDistrict || (tnDistricts.length > 0 ? tnDistricts[0] : null);
  const activeKey = activeDetail ? normalizeTnDistrictName(activeDetail.district).toLowerCase() : '';
  const activeStatusObj = districtStatuses[activeKey] || {};

  const districtPct = activeDetail && totalTnPincodes > 0
    ? ((activeDetail.pincodeCount / totalTnPincodes) * 100).toFixed(2)
    : '0.00';

  // Stats for counter summary
  const completedCount = Object.values(districtStatuses).filter(s => s?.completed).length;
  const progressCount = Object.values(districtStatuses).filter(s => s?.progress).length;
  const pendingCount = Math.max(0, 38 - completedCount - progressCount);

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/90 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-black bg-amber-100 text-amber-800 rounded-md">SEC 03</span>
            <span>TAMIL NADU DISTRICT OPERATIONS & STATUS MAP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic polygons across 38 districts. Click polygon or use manual status checkboxes below to update analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTnDistrict && (
            <button
              onClick={() => setSelectedTnDistrict(null)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET MAP
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['ALL', 'COMPLETED', 'PROGRESS', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
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

      {/* Dynamic Status Summary Report Banner */}
      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-2xs">
        <div className="bg-white border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase block">Completed Work</span>
            <span className="text-lg font-black text-emerald-900">
              <AnimatedCounter value={completedCount} suffix=" Districts" />
            </span>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase block">In Progress</span>
            <span className="text-lg font-black text-amber-900">
              <AnimatedCounter value={progressCount} suffix=" Districts" />
            </span>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending Work</span>
            <span className="text-lg font-black text-slate-800">
              <AnimatedCounter value={pendingCount} suffix=" Districts" />
            </span>
          </div>
          <Building className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Completion Rate</span>
            <span className="text-lg font-black text-blue-900">
              <AnimatedCounter value={((completedCount / 38) * 100).toFixed(1)} suffix="%" />
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: GeoJSON Polygon Map (Protected) */}
        <div className="lg:col-span-7 space-y-2">
          <div
            ref={mapContainerRef}
            className="w-full h-[460px] rounded-2xl border border-slate-200/90 bg-slate-50 overflow-hidden shadow-2xs leaflet-container-isolated"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"/> Completed ({completedCount})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"/> In Progress ({progressCount})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"/> Pending ({pendingCount})</span>
            </div>
            <button
              onClick={resetAllStatuses}
              className="text-slate-400 hover:text-rose-600 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset statuses to default"
            >
              <RefreshCw className="w-3 h-3" /> Reset Checkboxes
            </button>
          </div>
        </div>

        {/* Right: District Interactive Control Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            {activeDetail ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      District Interactive Control
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-0.5">
                      {activeDetail.district}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                    activeStatusObj.completed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : activeStatusObj.progress
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {activeStatusObj.completed ? 'COMPLETED' : activeStatusObj.progress ? 'IN PROGRESS' : 'PENDING'}
                  </span>
                </div>

                {/* Manually Controllable Status Checkboxes */}
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-1">
                    Manual Work Item Status Checkboxes (Persistent)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() => toggleDistrictCompleted(activeDetail.district)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        activeStatusObj.completed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {activeStatusObj.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>Completed</span>
                    </label>

                    <label
                      onClick={() => toggleDistrictProgress(activeDetail.district)}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        activeStatusObj.progress
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {activeStatusObj.progress ? (
                        <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>In Progress</span>
                    </label>
                  </div>
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

          {/* Quick District Grid with Interactive Status Indicators */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 block">
              Quick District Select & Status ({filteredDistricts.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
              {filteredDistricts.map((d) => {
                const key = normalizeTnDistrictName(d.district).toLowerCase();
                const stObj = districtStatuses[key] || {};
                const isSelected = activeDetail?.district === d.district;

                return (
                  <button
                    key={d.district}
                    onClick={() => setSelectedTnDistrict(d)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : stObj.completed
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100 font-medium'
                        : stObj.progress
                        ? 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100 font-medium'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate pr-1">{d.district}</span>
                    <span className={`text-[10px] font-bold ${
                      isSelected ? 'text-blue-100' : stObj.completed ? 'text-emerald-700' : stObj.progress ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {stObj.completed ? '✓' : stObj.progress ? '⏳' : d.pincodeCount}
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
