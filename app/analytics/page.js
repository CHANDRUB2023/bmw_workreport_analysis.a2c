'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsSidebar from '@/components/analytics/AnalyticsSidebar';
import ExecutiveOverview from '@/components/analytics/ExecutiveOverview';
import IndiaGeoAnalysis from '@/components/analytics/IndiaGeoAnalysis';
import TnDistrictAnalysis from '@/components/analytics/TnDistrictAnalysis';
import CompletionDonutCard from '@/components/analytics/CompletionDonutCard';
import ManpowerRequirementCard from '@/components/analytics/ManpowerRequirementCard';
import MetroAnalysisCard from '@/components/analytics/MetroAnalysisCard';
import WhatIfAnalyzerCard from '@/components/analytics/WhatIfAnalyzerCard';
import ProductivityAnalysisCard from '@/components/analytics/ProductivityAnalysisCard';
import VenueAnalyticsSection from '@/components/analytics/VenueAnalyticsSection';
import Footer from '@/components/analytics/Footer';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

import { exportAnalyticsPdfReport } from '@/lib/pdfAnalyticsExporter';
import { calculateProductivityMetrics } from '@/lib/productivityService';
import { calculateWhatIfScenarios } from '@/lib/analyticsService';

const VALID_SECTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

const SECTION_TITLES = {
  1: '01 — Executive Overview',
  2: '02 — India Geographic Map',
  3: '03 — TN District Analysis',
  4: '04 — Manpower Requirement',
  5: '05 — Metro System Analysis',
  6: '06 — Workforce What-If',
  8: '07 — Working Hours vs Output',
  10: '08 — Venue Analytics'
};

const SECTION_BADGES = {
  1: 'SEC 01',
  2: 'SEC 02',
  3: 'SEC 03',
  4: 'SEC 04',
  5: 'SEC 05',
  6: 'SEC 06',
  8: 'SEC 07',
  10: 'SEC 08'
};

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [venueRefreshTrigger, setVenueRefreshTrigger] = useState(0);

  // Active section state (defaults to SEC 1)
  const [selectedSection, setSelectedSection] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    setVenueRefreshTrigger((prev) => prev + 1);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    fetch('/api/analytics', { signal: controller.signal })
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
        if (err.name === 'AbortError') {
          setError('Master dataset request timed out. Please check backend / retry.');
        } else {
          setError(err.message || 'Master dataset processing error');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();

    // Read initial section from URL parameter ?section=X
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sec = parseInt(params.get('section'), 10);
      if (!isNaN(sec) && VALID_SECTIONS.includes(sec)) {
        setSelectedSection(sec);
      }
    }

    // Handle browser Back / Forward navigation button clicks
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const sec = parseInt(params.get('section'), 10);
        if (!isNaN(sec) && VALID_SECTIONS.includes(sec)) {
          setSelectedSection(sec);
        } else {
          setSelectedSection(1);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectSection = (sectionId) => {
    if (!VALID_SECTIONS.includes(sectionId)) return;
    setSelectedSection(sectionId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('section', sectionId.toString());
      window.history.pushState(null, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentSectionIndex = VALID_SECTIONS.indexOf(selectedSection);
  const prevSection = currentSectionIndex > 0 ? VALID_SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < VALID_SECTIONS.length - 1 ? VALID_SECTIONS[currentSectionIndex + 1] : null;

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between relative overflow-hidden animate-stage1-shell">
      {/* Subtle Depth Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Navigation Banner */}
      <div className="animate-stage3-header">
        <AnalyticsHeader
          onExportPdf={handleExportPdf}
          isLoading={isLoading}
          onRefresh={fetchAnalytics}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Sidebar + Main Content Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-full">
        {/* Left Sidebar Navigation */}
        <AnalyticsSidebar
          selectedSection={selectedSection}
          onSelectSection={handleSelectSection}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-stage4-viewport">
          {/* Top Section Navigation Header */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-all animate-stage5-title">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-2xs shadow-blue-600/30 animate-badge-pop">
                {SECTION_BADGES[selectedSection] || `SEC ${selectedSection}`}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{SECTION_TITLES[selectedSection] || `Section ${selectedSection}`}</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <button
                onClick={() => prevSection && handleSelectSection(prevSection)}
                disabled={!prevSection}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-2xs"
                title="Previous Section"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-slate-400 font-medium text-[11px] px-1 bg-slate-100 rounded-md py-0.5 border border-slate-200">
                {currentSectionIndex + 1} / {VALID_SECTIONS.length}
              </span>
              <button
                onClick={() => nextSection && handleSelectSection(nextSection)}
                disabled={!nextSection}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-2xs"
                title="Next Section"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Skeleton Shimmer Loading Placeholder */}
          {isLoading && (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="h-6 w-48 bg-slate-200 rounded-lg animate-shimmer" />
                <div className="h-6 w-24 bg-slate-200 rounded-lg animate-shimmer" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-28 bg-slate-100 rounded-xl p-4 space-y-3 border border-slate-200/60 animate-shimmer">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                    <div className="h-8 w-16 bg-slate-300 rounded-md" />
                  </div>
                ))}
              </div>
              <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200/60 animate-shimmer flex items-center justify-center text-slate-400 font-bold text-xs">
                Parsing master dataset & memoizing analytics...
              </div>
            </div>
          )}

          {/* Conditional Rendering of Currently Selected Section Only with Animated Entrance */}
          {!isLoading && data && (
            <div key={selectedSection} className="animate-section-enter space-y-6">
              {/* SEC 1 — EXECUTIVE OVERVIEW */}
              {selectedSection === 1 && (
                <ExecutiveOverview kpis={{
                  ...data.kpis,
                  tnCompletedDistricts: tnStatusCounts.completedCount,
                  tnPendingDistricts: tnStatusCounts.pendingCount,
                  tnCompletionPct: tnStatusCounts.completionPct
                }} />
              )}

              {/* SEC 2 — INDIA GEOGRAPHIC MAP ANALYSIS */}
              {selectedSection === 2 && (
                <IndiaGeoAnalysis
                  statesData={data.states || []}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                />
              )}

              {/* SEC 3 — TAMIL NADU DISTRICT MAP & CHECKBOX STATUS + COMPLETION DONUT */}
              {selectedSection === 3 && (
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
              )}

              {/* SEC 4 — REMAINING WORK PINCODES & MANPOWER REQUIREMENT */}
              {selectedSection === 4 && (
                <ManpowerRequirementCard />
              )}

              {/* SEC 5 — METRO SYSTEM NETWORK ANALYSIS */}
              {selectedSection === 5 && (
                <MetroAnalysisCard metroData={data.metro} />
              )}

              {/* SEC 6 — WORKFORCE WHAT-IF ANALYZER */}
              {selectedSection === 6 && (
                <WhatIfAnalyzerCard />
              )}

              {/* SEC 8 — PRODUCTIVITY BENCHMARK */}
              {selectedSection === 8 && (
                <ProductivityAnalysisCard />
              )}

              {/* SEC 10 — VENUE ANALYTICS */}
              {selectedSection === 10 && (
                <VenueAnalyticsSection refreshTrigger={venueRefreshTrigger} />
              )}

              {/* BOTTOM DOWNLOAD PDF REPORT ACTION BUTTON */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleExportPdf}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD PDF REPORT
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* A2C Team Footer */}
      <Footer />
    </div>
  );
}
