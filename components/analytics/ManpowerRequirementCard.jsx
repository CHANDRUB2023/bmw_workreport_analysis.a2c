'use client';

import React, { useState } from 'react';
import { Users, Calculator, ArrowRight, Info } from 'lucide-react';

export default function ManpowerRequirementCard() {
  const [remainingWork, setRemainingWork] = useState(120);
  const [availableHours, setAvailableHours] = useState(5);
  const [targetDays, setTargetDays] = useState(4);
  const [currentMembers, setCurrentMembers] = useState(4);

  const indRate = 0.5625; // 18 / 32

  // Formula: Required Members = Remaining Work / (Target Days * Hours * Rate)
  const exactRequired = remainingWork / (targetDays * availableHours * indRate);
  const requiredMembers = Math.ceil(exactRequired);
  const additionalNeeded = Math.max(0, requiredMembers - currentMembers);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 13</span>
          <span>REQUIRED WORKFORCE ANALYSIS</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Calculates target manpower requirements to complete a given workload within target deadline
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Remaining Work (Venues)</label>
            <input
              type="number" min="1" max="1000" value={remainingWork}
              onChange={(e) => setRemainingWork(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift Hours / Day</label>
              <input
                type="number" min="1" max="16" value={availableHours}
                onChange={(e) => setAvailableHours(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Completion Days</label>
              <input
                type="number" min="1" max="60" value={targetDays}
                onChange={(e) => setTargetDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Active Team Size</label>
            <input
              type="number" min="1" max="50" value={currentMembers}
              onChange={(e) => setCurrentMembers(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold bg-white"
            />
          </div>
        </div>

        {/* Right Output Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Current</span>
              <span className="text-xl font-black text-slate-800">{currentMembers}</span>
              <span className="text-[10px] text-slate-500 block">Members</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Required</span>
              <span className="text-xl font-black text-blue-900">{requiredMembers}</span>
              <span className="text-[10px] text-blue-700 block">Members</span>
            </div>

            <div className={`border rounded-lg p-3 text-center ${
              additionalNeeded > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <span className="text-[10px] font-bold uppercase block">Additional</span>
              <span className="text-xl font-black">{additionalNeeded}</span>
              <span className="text-[10px] block">Members Needed</span>
            </div>
          </div>

          {/* Formula Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Calculation Breakdown & Formula</span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2 rounded-md border border-slate-200 text-blue-950">
              Required Members = Math.ceil({remainingWork} / ({targetDays} Days × {availableHours} Hours × {indRate}))
            </div>
            <div className="text-[11px] text-slate-500 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                To finish {remainingWork} venues in {targetDays} days with {availableHours}-hour shifts at {indRate} venues/person-hour, a minimum of {requiredMembers} members is required (exact: {exactRequired.toFixed(2)}).
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
