'use client';

import React, { useState } from 'react';
import { Search, MapPin, Eye, X, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';

export default function DistrictDrilldownCard({ districts = [], selectedDistrict, onSelectDistrict }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pinSearch, setPinSearch] = useState('');

  const activeDistrict = selectedDistrict || (districts.length > 0 ? districts[0] : null);

  const handleCopyPincodes = () => {
    if (!activeDistrict || !activeDistrict.pincodes) return;
    const text = activeDistrict.pincodes.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredPincodes = (activeDistrict?.pincodes || []).filter(pin =>
    pin.includes(pinSearch.trim())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Title Bar & Selector Dropdown */}
      <div className="border-b border-slate-200 pb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <span>DISTRICT DRILL-DOWN & PINCODE INTELLIGENCE</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a district to inspect venue metrics and view unique pincode records.
          </p>
        </div>

        {/* District Selector Dropdown */}
        <div className="w-full sm:w-64 shrink-0">
          <select
            value={activeDistrict?.district || ''}
            onChange={(e) => {
              const found = districts.find(d => d.district === e.target.value);
              if (found && onSelectDistrict) onSelectDistrict(found);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer truncate"
          >
            {districts.map((d) => (
              <option key={d.district} value={d.district}>
                #{d.rank} — {d.district} ({d.displayVenue})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeDistrict ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          {/* Clean 2x2 Grid Layout for Perfect Spacing & Full Text Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            {/* Card 1: District & Rank */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-h-[105px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  District & Rank
                </span>
                <div className="text-base font-black text-slate-900 mt-1 truncate" title={activeDistrict.district}>
                  {activeDistrict.district}
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 rounded-md whitespace-nowrap">
                  Rank #{activeDistrict.rank} of {districts.length}
                </span>
              </div>
            </div>

            {/* Card 2: Venue Count */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-h-[105px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Venue Count
                </span>
                <div className="text-xl font-black text-blue-900 mt-1 tracking-tight whitespace-nowrap">
                  {activeDistrict.displayVenue}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">
                Calculated Venue Volume
              </span>
            </div>

            {/* Card 3: Data Type */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-h-[105px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data Type
                </span>
                <div className="mt-1.5 flex items-center">
                  {activeDistrict.isApproximate ? (
                    <span className="px-2.5 py-1 rounded-md font-extrabold bg-amber-100 text-amber-900 border border-amber-200 text-xs inline-flex items-center gap-1.5 whitespace-nowrap">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Approximate (±)</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs inline-flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Exact Number</span>
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">
                Source Precision
              </span>
            </div>

            {/* Card 4: Unique Pincodes & Modal Action */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between shadow-2xs min-h-[105px]">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Unique Pincodes
                </span>
                <div className="text-base font-black text-slate-900 mt-1">
                  {activeDistrict.pincodeCount} <span className="text-xs font-bold text-slate-500">PINs</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="View District Pincodes"
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>View Pincodes ({activeDistrict.pincodeCount})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-6">Select a district to view drill-down analysis</div>
      )}

      {/* Pincodes Modal */}
      {isModalOpen && activeDistrict && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col animate-modal-pop">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{activeDistrict.district} Pincodes</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                    {activeDistrict.pincodeCount} Total
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted exclusively from TN Districts Pincodes.xlsx
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Copy Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter pincodes..."
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleCopyPincodes}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>

            {/* Pincodes Grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[200px]">
              {filteredPincodes.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-bold font-mono">
                  {filteredPincodes.map((pin) => (
                    <div
                      key={pin}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition-colors"
                    >
                      {pin}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-12">No matching pincodes found</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
