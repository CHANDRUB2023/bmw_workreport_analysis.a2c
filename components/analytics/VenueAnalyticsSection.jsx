'use client';

import React, { useState, useEffect, useCallback } from 'react';
import VenueKpisCard from './VenueKpisCard';
import TnVenueMapCard from './TnVenueMapCard';
import DistrictVenueBarChart from './DistrictVenueBarChart';
import VenueRangeDistributionCard from './VenueRangeDistributionCard';
import PincodeVsVenueScatterCard from './PincodeVsVenueScatterCard';
import UtVenueBarChart from './UtVenueBarChart';
import DistrictDrilldownCard from './DistrictDrilldownCard';
import DistrictVenueTableCard from './DistrictVenueTableCard';
import VenueInsightsCards from './VenueInsightsCards';
import { Building2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function VenueAnalyticsSection({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const fetchVenueData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = forceRefresh ? '/api/venue-analytics?refresh=true' : '/api/venue-analytics';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
        if (resData.districts && resData.districts.length > 0 && !selectedDistrict) {
          setSelectedDistrict(resData.districts[0]);
        }
      } else {
        setError(resData.error || 'Venue Analytics data source unavailable.');
      }
    } catch (err) {
      console.error('Error fetching venue analytics:', err);
      setError(err.message || 'Venue Analytics data source unavailable. Please verify the configured Excel file.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    fetchVenueData();
  }, [fetchVenueData]);

  useEffect(() => {
    if (refreshTrigger) {
      fetchVenueData(true);
    }
  }, [refreshTrigger, fetchVenueData]);

  if (isLoading && !data) {
    return (
      <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-700">Loading Venue Analytics Dataset...</p>
        <p className="text-xs text-slate-400">Parsing TN Districts Pincodes.xlsx server-side...</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="bg-white border border-rose-200 rounded-xl p-6 shadow-xs space-y-3 text-center">
        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">Venue Analytics Data Source Unavailable</h3>
        <p className="text-xs text-rose-600 font-medium max-w-md mx-auto">{error}</p>
        <p className="text-xs text-slate-400">
          Please verify that <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200 font-mono">TN Districts Pincodes.xlsx</code> exists at the configured location.
        </p>
        <button
          onClick={() => fetchVenueData(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Venue Data
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6 pt-4 border-t-2 border-slate-200">
      {/* Section 10 Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200 rounded-md">
              SEC 10
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-900 uppercase">VENUE ANALYTICS (BOOK MY VENUE - BMW)</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Independent venue intelligence derived from <span className="font-semibold text-slate-700">TN Districts Pincodes.xlsx</span>. 100% isolated pipeline.
          </p>
        </div>

        <button
          onClick={() => fetchVenueData(true)}
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer self-start sm:self-auto"
          title="Reload Venue Analytics Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Venue Data</span>
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* SEC 10 KPI CARDS */}
          <VenueKpisCard summary={data.summary} />

          {/* SEC 10 INSIGHT CARDS */}
          <VenueInsightsCards summary={data.summary} />

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

          {/* VENUE RANGE DISTRIBUTION & SCATTER PLOT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VenueRangeDistributionCard
              distributions={data.distributions || []}
              totalDistricts={data.summary?.totalDistricts || 38}
            />
            <PincodeVsVenueScatterCard districts={data.districts || []} />
          </div>

          {/* UNION TERRITORY BAR CHART */}
          {data.unionTerritories && data.unionTerritories.length > 0 && (
            <UtVenueBarChart unionTerritories={data.unionTerritories} />
          )}

          {/* DISTRICT VENUE MASTER DATA TABLE */}
          <DistrictVenueTableCard
            districts={data.rankings || []}
            onSelectDistrict={setSelectedDistrict}
          />
        </div>
      )}
    </section>
  );
}
