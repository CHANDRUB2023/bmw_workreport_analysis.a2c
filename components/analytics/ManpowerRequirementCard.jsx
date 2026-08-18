'use client';

import React, { useState } from 'react';
import { Users, Calculator, Info, ChevronDown } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function ManpowerRequirementCard() {
  const [remainingWorkPincodes, setRemainingWorkPincodes] = useState(125);
  const [availableHours, setAvailableHours] = useState(5);
  const [targetDays, setTargetDays] = useState(4);
  const [currentMembers, setCurrentMembers] = useState(4);

  const indRate = 0.5625; // 18 / 32

  // Formula: Required Members = Remaining Work Pincodes / (Target Days * Hours * Rate)
  const exactRequired = remainingWorkPincodes / (targetDays * availableHours * indRate);
  const requiredMembers = Math.ceil(exactRequired);
  const additionalNeeded = Math.max(0, requiredMembers - currentMembers);

  return (
    <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
      <div className="border-b border-slate-200/90 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-black bg-blue-100 text-blue-800 rounded-md">SEC 04</span>
          <span>REMAINING WORK PINCODES & MANPOWER REQUIREMENT</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Operational workforce analysis for remaining work pincodes within target completion deadline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Inputs */}
        <div className="lg:col-span-6 bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs shadow-2xs">
          <div>
            <label className="font-extrabold text-slate-900 block mb-1">REMAINING WORK PINCODES</label>
            <input
              type="number" min="1" max="5000" value={remainingWorkPincodes}
              onChange={(e) => setRemainingWorkPincodes(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-black text-sm text-blue-900 bg-white shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift Hours / Day</label>
              <input
                type="number" min="1" max="16" value={availableHours}
                onChange={(e) => setAvailableHours(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Completion Days</label>
              <input
                type="number" min="1" max="60" value={targetDays}
                onChange={(e) => setTargetDays(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Active Team Size</label>
            <input
              type="number" min="1" max="50" value={currentMembers}
              onChange={(e) => setCurrentMembers(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Right Clean Output Cards */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Current Team</span>
              <span className="text-2xl font-black text-slate-800">
                <AnimatedCounter value={currentMembers} />
              </span>
              <span className="text-[10px] text-slate-500 block font-medium">Members</span>
            </div>

            <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase block">Required Team</span>
              <span className="text-2xl font-black text-blue-900">
                <AnimatedCounter value={requiredMembers} />
              </span>
              <span className="text-[10px] text-blue-700 block font-medium">Members</span>
            </div>

            <div className={`border rounded-xl p-3 text-center shadow-2xs ${
              additionalNeeded > 0
                ? 'bg-amber-50/90 border-amber-300 text-amber-900'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
            }`}>
              <span className="text-[10px] font-bold uppercase block">Additional Needed</span>
              <span className="text-2xl font-black">
                <AnimatedCounter value={additionalNeeded} />
              </span>
              <span className="text-[10px] block font-medium">Members</span>
            </div>
          </div>

          {/* Clean Primary Result Highlight */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 space-y-2 shadow-md shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">Target Workload</span>
                <div className="text-xl font-black">{remainingWorkPincodes} REMAINING WORK PINCODES</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400">
                  <AnimatedCounter value={requiredMembers} suffix=" Team Members Required" />
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-blue-200 font-semibold">
                <span>Current Workforce Capacity Coverage</span>
                <span className="font-bold text-white">{Math.min(100, Math.round((currentMembers / requiredMembers) * 100))}%</span>
              </div>
              <div className="w-full h-2 bg-blue-950/80 rounded-full overflow-hidden border border-blue-800/60 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full animate-progress-grow"
                  style={{ '--target-width': `${Math.min(100, Math.round((currentMembers / requiredMembers) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hidden/Expandable Calculation Formula */}
          <details className="group bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 text-xs shadow-2xs">
            <summary className="font-bold text-slate-700 flex items-center justify-between cursor-pointer select-none">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                View Calculation Breakdown
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1.5">
              <div className="font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-blue-950 shadow-2xs">
                Required Members = Math.ceil({remainingWorkPincodes} / ({targetDays} Days × {availableHours} Hours × {indRate}))
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Calculated based on {remainingWorkPincodes} remaining work pincodes in {targetDays} days with {availableHours}-hour daily shifts at a baseline individual rate of {indRate} units/person-hour.
              </p>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
