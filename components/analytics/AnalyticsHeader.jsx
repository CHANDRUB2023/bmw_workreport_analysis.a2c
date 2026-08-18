'use client';

import React from 'react';
import { Download, RefreshCw, Menu } from 'lucide-react';

export default function AnalyticsHeader({ onExportPdf, isLoading, onRefresh, onToggleMobileSidebar }) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-150 border border-slate-200 lg:hidden cursor-pointer shrink-0 active:scale-95"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Exact Un-retouched Uploaded A2C Logo Image */}
          <div className="h-14 w-auto relative flex items-center justify-center p-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs shrink-0 overflow-hidden group hover:border-blue-300 transition-colors">
            <img src="/a2c-logo.png" alt="A2C Logo" className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                R&D REPORT ANALYSIS
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-100/90 text-blue-800 border border-blue-200 rounded-full uppercase tracking-wider shadow-2xs">
                Book My Venue (BMW)
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Executive Operations & Analytics Dashboard</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-extrabold flex items-center gap-1">
                Data Analyzed by A2C Team
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 rounded-xl transition-all duration-150 flex items-center gap-2 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-xs"
              title="Reload Analytics Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          )}

          <button
            onClick={onExportPdf}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 rounded-xl shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD PDF REPORT
          </button>
        </div>
      </div>
    </header>
  );
}
