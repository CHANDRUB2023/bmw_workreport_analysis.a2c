'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VenueKpisCard from './VenueKpisCard';
import TnVenueMapCard from './TnVenueMapCard';
import DistrictVenueBarChart from './DistrictVenueBarChart';
import VenueRangeDistributionCard from './VenueRangeDistributionCard';
import UtVenueBarChart from './UtVenueBarChart';
import DistrictDrilldownCard from './DistrictDrilldownCard';
import DynamicExcelFieldsCard from './DynamicExcelFieldsCard';
import DistrictVenueTableCard from './DistrictVenueTableCard';
import VenueUploadModal from './VenueUploadModal';
import { Building2, AlertTriangle, RefreshCw, UploadCloud } from 'lucide-react';

export default function VenueAnalyticsSection({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchVenueData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = forceRefresh ? '/api/venue-analytics?refresh=true' : '/api/venue-analytics';
      const res = await fetch(url);
      const result = await res.json();

      if (result && result.success) {
        setData(result);
        if (result.districts && result.districts.length > 0) {
          setSelectedDistrict(result.districts[0]);
        }
      } else {
        setError(result.error || 'Failed to load Venue Analytics dataset.');
      }
    } catch (err) {
      console.error('[VenueAnalyticsSection] Fetch error:', err);
      setError('Network error while requesting Venue Analytics dataset.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData, refreshTrigger]);

  if (isLoading && !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-full animate-bounce">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Loading Section 08 — Venue Analytics...</h3>
        <p className="text-xs text-slate-500">Processing TN Districts Pincodes.xlsx dataset...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-3">
        <div className="inline-flex p-2.5 bg-rose-100 text-rose-700 rounded-full">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-rose-900">Venue Analytics Unavailable</h3>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchVenueData(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading Dataset</span>
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
              SEC 08
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-900 uppercase">VENUE ANALYTICS (BOOK MY VENUE - BMW)</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Independent venue intelligence derived from <span className="font-semibold text-slate-700">TN Districts Pincodes.xlsx</span>. 100% isolated pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Upload / Replace Venue Dataset Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Upload new Excel workbook for Section 10 Venue Analytics"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload / Replace Venue Dataset</span>
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => fetchVenueData(true)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            title="Reload Venue Analytics Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* SEC 10 KPI CARDS */}
          <VenueKpisCard summary={data.summary} />

          {/* DYNAMIC EXCEL ADDITIONAL FIELDS (If present in workbook) */}
          <DynamicExcelFieldsCard dynamicColumns={data.dynamicColumns} excelSheets={data.excelSheets} />

          {/* MAP & DRILLDOWN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <TnVenueMapCard
                districts={data.districts || []}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
              />
            </div>
            <div className="lg:col-span-5">
              <DistrictDrilldownCard
                districts={data.rankings || []}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
              />
            </div>
          </div>

          {/* DISTRICT-WISE VENUE BAR CHART */}
          <DistrictVenueBarChart districts={data.districts || []} />

          {/* VENUE RANGE DISTRIBUTION CARD */}
          <VenueRangeDistributionCard distributions={data.distributions || []} />

          {/* UNION TERRITORY BAR CHART */}
          <UtVenueBarChart unionTerritories={data.unionTerritories || []} />

          {/* DISTRICT VENUE MASTER DATA TABLE */}
          <DistrictVenueTableCard
            districts={data.rankings || []}
            onSelectDistrict={setSelectedDistrict}
          />
        </div>
      )}

      {/* Upload Modal */}
      <VenueUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccessRefresh={() => fetchVenueData(true)}
      />
    </section>
  );
}
