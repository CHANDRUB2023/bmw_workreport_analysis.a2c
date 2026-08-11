'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

export default function AnalyticsHeader({ onExportPdf, isLoading, onRefresh }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Official A2C Logo SVG */}
          <div className="w-12 h-12 relative rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0">
            <img src="/a2c-logo.svg" alt="A2C Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                R&D REPORT ANALYSIS
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200 rounded-full uppercase tracking-wider">
                Book My Venue (BMW)
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Executive Operations & Analytics Dashboard</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-extrabold">Data Analyzed by A2C Team</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 border border-slate-200 cursor-pointer"
              title="Reload Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          )}

          <button
            onClick={onExportPdf}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF REPORT
          </button>
        </div>
      </div>
    </header>
  );
}
