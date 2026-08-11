'use client';

import React from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';

export default function AnalyticsHeader({ onExportPdf, isLoading, onRefresh }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                A2C ANALYTICAL DASHBOARD
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Production Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              India & Tamil Nadu District / Pincode Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 border border-slate-200"
              title="Reload Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          )}

          <button
            onClick={onExportPdf}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF REPORT
          </button>
        </div>
      </div>
    </header>
  );
}
