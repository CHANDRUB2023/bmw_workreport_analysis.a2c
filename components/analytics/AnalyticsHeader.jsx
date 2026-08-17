'use client';

import React from 'react';
import { Download, RefreshCw, Menu } from 'lucide-react';

export default function AnalyticsHeader({ onExportPdf, isLoading, onRefresh, onToggleMobileSidebar }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 lg:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Exact Un-retouched Uploaded A2C Logo Image */}
          <div className="h-14 w-auto relative flex items-center justify-center p-1 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0 overflow-hidden">
            <img src="/a2c-logo.png" alt="A2C Logo" className="h-full w-auto object-contain" />
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
