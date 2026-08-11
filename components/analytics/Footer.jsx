'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Exact Un-retouched Uploaded A2C Logo Image */}
          <div className="h-14 w-auto relative flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <img src="/a2c-logo.png" alt="A2C - Any Idea Converting Logo" className="h-full w-auto object-contain" />
          </div>

          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              DATA ANALYZED BY A2C TEAM
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              R&D Report Analysis System • Book My Venue (BMW)
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400 font-medium">
          Official Internal Operations & Analytics Report • {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
