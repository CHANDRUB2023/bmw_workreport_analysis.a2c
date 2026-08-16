'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import { normalizeTnDistrictName } from '@/lib/formatUtils';

export default function TnVenueMapCard({ districts = [], selectedDistrict, onSelectDistrict }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayerRef = useRef(null);

  // Map districts by normalized lowercase key
  const venueDataMap = useMemo(() => {
    const map = {};
    (districts || []).forEach(d => {
      const norm = normalizeTnDistrictName(d.district).toLowerCase();
      map[norm] = d;
      // also index raw lowercase name
      map[d.district.toLowerCase().trim()] = d;
    });
    return map;
  }, [districts]);

  // Load TN GeoJSON boundary file
  useEffect(() => {
    fetch('/tamil-nadu-districts.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Failed to load TN GeoJSON map for Venue Analytics:', err));
  }, []);

  const getVenueColor = (count) => {
    if (count === null || count === undefined) return '#cbd5e1'; // slate-300
    if (count >= 500) return '#1e40af'; // Blue 800
    if (count >= 300) return '#2563eb'; // Blue 600
    if (count >= 200) return '#3b82f6'; // Blue 500
    if (count >= 100) return '#60a5fa'; // Blue 400
    return '#93c5fd'; // Blue 300
  };

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
      script.onload = () => initLeafletVenueMap(window.L);
      document.head.appendChild(script);
    } else {
      initLeafletVenueMap(L);
    }

    function initLeafletVenueMap(L) {
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

      const selectedKey = selectedDistrict ? normalizeTnDistrictName(selectedDistrict.district).toLowerCase() : '';

      function style(feature) {
        const rawName = feature.properties.dtname || feature.properties.dist || 'District';
        const normName = normalizeTnDistrictName(rawName);
        const normKey = normName.toLowerCase();
        const isSel = selectedKey && normKey === selectedKey;
        const dObj = venueDataMap[normKey] || venueDataMap[rawName.toLowerCase().trim()];

        const count = dObj ? dObj.venueCount : null;
        let fill = getVenueColor(count);

        if (isSel) fill = '#10b981'; // Emerald highlight for selected

        return {
          fillColor: fill,
          weight: isSel ? 3.5 : 1.5,
          opacity: 1,
          color: isSel ? '#064e3b' : '#ffffff',
          fillOpacity: isSel ? 0.95 : 0.8
        };
      }

      function highlightFeature(e) {
        const layer = e.target;
        const rawName = layer.feature.properties.dtname || layer.feature.properties.dist || '';
        const normName = normalizeTnDistrictName(rawName);

        if (!selectedKey || normName.toLowerCase() !== selectedKey) {
          layer.setStyle({
            fillColor: '#f59e0b',
            weight: 2.5,
            color: '#b45309',
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
        const dObj = venueDataMap[normKey] || venueDataMap[rawName.toLowerCase().trim()];

        const venueStr = dObj ? dObj.displayVenue : 'Not Available';
        const dataTypeStr = dObj ? (dObj.isApproximate ? 'Approximate' : 'Exact') : 'N/A';

        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size: 11px; padding: 4px;">
            <b style="font-size: 13px; color: #1e3a8a;">${normName}</b><br/>
            <span style="color: #1e293b; font-weight: bold;">Venue Count: </span>
            <b style="color: #2563eb; font-size: 12px;">${venueStr}</b><br/>
            <span style="color: #64748b;">Data Type: </span>
            <b style="color: ${dObj?.isApproximate ? '#d97706' : '#059669'};">${dataTypeStr}</b>
          </div>`,
          { permanent: false, direction: 'center' }
        );

        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: () => {
            if (onSelectDistrict && dObj) {
              onSelectDistrict(dObj);
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
  }, [geojsonData, selectedDistrict, venueDataMap, onSelectDistrict]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span>TAMIL NADU VENUE COUNT GEOGRAPHIC MAP</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            District-level venue density distribution across Tamil Nadu. Hover/click polygon for details.
          </p>
        </div>

        {selectedDistrict && (
          <button
            onClick={() => onSelectDistrict && onSelectDistrict(null)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET SELECTION
          </button>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-[400px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs"
      />

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-semibold pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Venue Scale:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: '#1e40af' }} /> 500+</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: '#2563eb' }} /> 300–499</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: '#3b82f6' }} /> 200–299</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: '#60a5fa' }} /> 100–199</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-xs inline-block" style={{ backgroundColor: '#93c5fd' }} /> Below 100</span>
        </div>
        <div className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ± indicates approximate values
        </div>
      </div>
    </div>
  );
}
