'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import ExecutiveOverview from '@/components/analytics/ExecutiveOverview';
import IndiaGeoAnalysis from '@/components/analytics/IndiaGeoAnalysis';
import TnDistrictAnalysis from '@/components/analytics/TnDistrictAnalysis';
import PincodeDistributionBarChart from '@/components/analytics/PincodeDistributionBarChart';
import CompletionDonutCard from '@/components/analytics/CompletionDonutCard';
import ProductivityAnalysisCard from '@/components/analytics/ProductivityAnalysisCard';
import CutoffAnalysisCard from '@/components/analytics/CutoffAnalysisCard';
import TeamSizeAnalysisCard from '@/components/analytics/TeamSizeAnalysisCard';
import WhatIfAnalyzerCard from '@/components/analytics/WhatIfAnalyzerCard';
import ScenarioComparisonCard from '@/components/analytics/ScenarioComparisonCard';
import ScenarioHeatmapCard from '@/components/analytics/ScenarioHeatmapCard';
import PendingWorkBurndownCard from '@/components/analytics/PendingWorkBurndownCard';
import ManpowerRequirementCard from '@/components/analytics/ManpowerRequirementCard';
import ProductivityInsightsCard from '@/components/analytics/ProductivityInsightsCard';
import DistrictRankingCard from '@/components/analytics/DistrictRankingCard';
import MetroAnalysisCard from '@/components/analytics/MetroAnalysisCard';
import PincodeDataTable from '@/components/tables/PincodeDataTable';

import { exportAnalyticsPdfReport } from '@/lib/pdfAnalyticsExporter';
import { calculateProductivityMetrics } from '@/lib/productivityService';
import { calculateWhatIfScenarios } from '@/lib/analyticsService';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const fetchAnalytics = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/analytics')
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        return res.json();
      })
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || 'Failed to load analytics summary');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch analytics data:', err);
        setError(err.message || 'Master dataset processing error');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const productivityMetrics = useMemo(() => {
    return calculateProductivityMetrics({
      teamMembers: 4,
      workingHours: 8,
      completedVenues: 18,
      targetRemainingVenues: 90,
      cutoffHours: 5
    });
  }, []);

  const whatIfScenarios = useMemo(() => {
    return calculateWhatIfScenarios({
      individualHourlyRate: 0.5625,
      targetRemainingVenues: 90
    });
  }, []);

  const handleExportPdf = () => {
    if (!data) return;
    exportAnalyticsPdfReport({
      kpis: data.kpis,
      statesData: data.states,
      tnDistrictsData: data.tnDistricts,
      topDistrictsData: data.topDistricts,
      productivityMetrics,
      whatIfScenarios,
      metroData: data.metro
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-6 shadow-lg text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-black text-slate-900">Master Dataset Error</h2>
          <p className="text-xs text-rose-600 font-medium">{error}</p>
          <p className="text-xs text-slate-500">
            Please ensure master_pincode_dataset.csv is present in data/ folder.
          </p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Loading Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header Navigation Banner */}
      <AnalyticsHeader
        onExportPdf={handleExportPdf}
        isLoading={isLoading}
        onRefresh={fetchAnalytics}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading Master Dataset Analytics...</p>
            <p className="text-xs text-slate-400">Parsing and memoizing 165,627 records in-memory...</p>
          </div>
        )}

        {!isLoading && data && (
          <>
            {/* SECTION 1 — EXECUTIVE OVERVIEW */}
            <ExecutiveOverview kpis={data.kpis} />

            {/* SECTION 2 — INDIA GEOGRAPHIC ANALYSIS */}
            <IndiaGeoAnalysis
              statesData={data.states || []}
              selectedState={selectedState}
              onSelectState={setSelectedState}
            />

            {/* SECTION 3 & 5 — TAMIL NADU DISTRICT ANALYSIS + COMPLETION DONUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8">
                <TnDistrictAnalysis tnDistricts={data.tnDistricts || []} />
              </div>
              <div className="lg:col-span-4">
                <CompletionDonutCard
                  tnCompleted={data.kpis?.tnCompletedDistricts ?? 8}
                  tnTotal={data.kpis?.tnTotalDistricts ?? 38}
                />
              </div>
            </div>

            {/* SECTION 4 — DISTRICT PINCODE DISTRIBUTION BAR CHART */}
            <PincodeDistributionBarChart districtsData={data.districtsDistribution || []} />

            {/* SECTION 15 — TOP DISTRICT RANKING TABLE */}
            <DistrictRankingCard topDistrictsData={data.topDistricts || []} />

            {/* SECTION 4 — DATASET EXPLORER & TABLE */}
            <PincodeDataTable />

            {/* SECTION 6 — PRODUCTIVITY ANALYSIS */}
            <ProductivityAnalysisCard />

            {/* SECTION 7 & 8 — CUT-OFF & TEAM SIZE ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CutoffAnalysisCard />
              <TeamSizeAnalysisCard />
            </div>

            {/* SECTION 9 — WORKFORCE WHAT-IF ANALYZER */}
            <WhatIfAnalyzerCard />

            {/* SECTION 10 — WORKFORCE SCENARIO COMPARISON */}
            <ScenarioComparisonCard />

            {/* SECTION 11 — SCENARIO HEATMAP */}
            <ScenarioHeatmapCard individualHourlyRate={0.5625} />

            {/* SECTION 12 & 13 — BURNDOWN & MANPOWER REQUIREMENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PendingWorkBurndownCard />
              <ManpowerRequirementCard />
            </div>

            {/* SECTION 16 — METRO ANALYSIS */}
            <MetroAnalysisCard metroData={data.metro} />

            {/* SECTION 14 — PRODUCTIVITY INSIGHTS */}
            <ProductivityInsightsCard
              teamMembers={4}
              workingHours={8}
              completedVenues={18}
              cutoffHours={5}
              targetRemainingVenues={90}
            />

            {/* SECTION 20 — PDF REPORT BOTTOM ACTION CALL */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 text-center space-y-3 shadow-lg">
              <h3 className="text-xl font-black tracking-tight">A2C Analytical Dashboard — Ready for Faculty & Management Presentation</h3>
              <p className="text-xs text-blue-200 max-w-xl mx-auto">
                Generate a comprehensive multi-page PDF Analytics Report containing executive KPIs, geographic charts, workforce scenario forecasts, and productivity insights.
              </p>
              <button
                onClick={handleExportPdf}
                className="px-6 py-3 bg-white text-blue-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:bg-blue-50 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                DOWNLOAD ANALYTICS REPORT (PDF)
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
