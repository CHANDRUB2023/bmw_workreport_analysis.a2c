'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import ExecutiveOverview from '@/components/analytics/ExecutiveOverview';
import IndiaGeoAnalysis from '@/components/analytics/IndiaGeoAnalysis';
import TnDistrictAnalysis from '@/components/analytics/TnDistrictAnalysis';
import CompletionDonutCard from '@/components/analytics/CompletionDonutCard';
import ManpowerRequirementCard from '@/components/analytics/ManpowerRequirementCard';
import MetroAnalysisCard from '@/components/analytics/MetroAnalysisCard';
import WhatIfAnalyzerCard from '@/components/analytics/WhatIfAnalyzerCard';
import ScenarioComparisonCard from '@/components/analytics/ScenarioComparisonCard';
import ProductivityAnalysisCard from '@/components/analytics/ProductivityAnalysisCard';
import PincodeDistributionBarChart from '@/components/analytics/PincodeDistributionBarChart';
import Footer from '@/components/analytics/Footer';
import { Download } from 'lucide-react';

import { exportAnalyticsPdfReport } from '@/lib/pdfAnalyticsExporter';
import { calculateProductivityMetrics } from '@/lib/productivityService';
import { calculateWhatIfScenarios } from '@/lib/analyticsService';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  
  // Dynamic status tracking from SEC-3 checkboxes
  const [tnStatusCounts, setTnStatusCounts] = useState({
    completedCount: 8,
    progressCount: 0,
    pendingCount: 30,
    totalDistricts: 38,
    completionPct: 21.1
  });

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
      kpis: {
        ...data.kpis,
        tnCompletedDistricts: tnStatusCounts.completedCount,
        tnPendingDistricts: tnStatusCounts.pendingCount,
        tnCompletionPct: tnStatusCounts.completionPct
      },
      statesData: data.states,
      tnDistrictsData: data.tnDistricts,
      topDistrictsData: data.topDistricts,
      productivityMetrics,
      whatIfScenarios,
      metroData: data.metro,
      statusCounts: tnStatusCounts
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
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Retry Loading Analytics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between">
      <div>
        {/* Header Navigation Banner */}
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
              {/* SEC 1 — EXECUTIVE OVERVIEW */}
              <ExecutiveOverview kpis={{
                ...data.kpis,
                tnCompletedDistricts: tnStatusCounts.completedCount,
                tnPendingDistricts: tnStatusCounts.pendingCount,
                tnCompletionPct: tnStatusCounts.completionPct
              }} />

              {/* SEC 2 — INDIA GEOGRAPHIC MAP (Protected) */}
              <IndiaGeoAnalysis
                statesData={data.states || []}
                selectedState={selectedState}
                onSelectState={setSelectedState}
              />

              {/* SEC 3 — TAMIL NADU DISTRICT MAP & CHECKBOX STATUS + COMPLETION DONUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8">
                  <TnDistrictAnalysis
                    tnDistricts={data.tnDistricts || []}
                    onStatusChange={setTnStatusCounts}
                  />
                </div>
                <div className="lg:col-span-4">
                  <CompletionDonutCard
                    tnCompleted={tnStatusCounts.completedCount}
                    tnProgress={tnStatusCounts.progressCount}
                    tnPending={tnStatusCounts.pendingCount}
                    tnTotal={tnStatusCounts.totalDistricts}
                  />
                </div>
              </div>

              {/* SEC 4 — REMAINING WORK PINCODES & MANPOWER REQUIREMENT */}
              <ManpowerRequirementCard />

              {/* SEC 5 — METRO SYSTEM NETWORK ANALYSIS */}
              <MetroAnalysisCard metroData={data.metro} />

              {/* SEC 6 & SEC 7 — WORKFORCE WHAT-IF ANALYZER & SCENARIO COMPARISON */}
              <div className="space-y-6">
                <WhatIfAnalyzerCard />
                <ScenarioComparisonCard />
              </div>

              {/* SEC 8 & SEC 9 — PRODUCTIVITY BENCHMARK & DISTRICT DISTRIBUTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductivityAnalysisCard />
                <PincodeDistributionBarChart districtsData={data.districtsDistribution || []} />
              </div>

              {/* BOTTOM DOWNLOAD PDF REPORT ACTION BUTTON */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleExportPdf}
                  className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD PDF REPORT
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* A2C Team Footer */}
      <Footer />
    </div>
  );
}
