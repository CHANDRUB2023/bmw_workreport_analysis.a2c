'use client';

import React, { useState } from 'react';
import { Sliders, Calendar, Zap, Clock, Users, Target } from 'lucide-react';

export default function WhatIfAnalyzerCard() {
  const [members, setMembers] = useState(4);
  const [hours, setHours] = useState(5);
  const [remainingWork, setRemainingWork] = useState(120);
  const [ratePerPersonHour, setRatePerPersonHour] = useState(0.5625);

  const dailyCapacity = members * hours * ratePerPersonHour;
  const weeklyCapacity = dailyCapacity * 5;
  const estimatedDays = dailyCapacity > 0 ? (remainingWork / dailyCapacity).toFixed(1) : '0';

  const today = new Date();
  const completionDate = new Date(today);
  completionDate.setDate(today.getDate() + Math.ceil(Number(estimatedDays) || 0));

  const dateFormatted = completionDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 6</span>
          <span>WORKFORCE WHAT-IF ANALYZER</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time parameter adjustment for capacity forecasting & completion date estimation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Input Sliders */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-600" /> Team Members</span>
              <span className="text-blue-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-200">{members} Members</span>
            </div>
            <input
              type="range" min="1" max="20" step="1" value={members}
              onChange={(e) => setMembers(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" /> Working Hours / Day</span>
              <span className="text-blue-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-200">{hours} Hours</span>
            </div>
            <input
              type="range" min="1" max="12" step="1" value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-blue-600" /> Remaining Work (Venues)</span>
              <span className="text-blue-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-200">{remainingWork} Venues</span>
            </div>
            <input
              type="range" min="10" max="500" step="10" value={remainingWork}
              onChange={(e) => setRemainingWork(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-600" /> Productivity Rate</span>
              <span className="text-blue-900 font-black bg-white px-2 py-0.5 rounded-md border border-slate-200">{ratePerPersonHour} / person-hr</span>
            </div>
            <select
              value={ratePerPersonHour}
              onChange={(e) => setRatePerPersonHour(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white"
            >
              <option value={0.5625}>0.5625 venues/person-hr (Baseline: 18v / 32h)</option>
              <option value={0.25}>0.2500 venues/person-hr (Minimum Theoretical)</option>
              <option value={0.4375}>0.4375 venues/person-hr (Average Theoretical)</option>
              <option value={0.625}>0.6250 venues/person-hr (Maximum Theoretical)</option>
            </select>
          </div>
        </div>

        {/* Right: Calculated Outputs */}
        <div className="lg:col-span-6 bg-blue-900 text-white rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-widest block">Instant Calculation Output</span>
            <h4 className="text-xl font-black">Capacity & Completion Target</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-800/80 border border-blue-700 rounded-lg p-3">
              <span className="text-[10px] text-blue-300 uppercase font-bold block">Daily Capacity</span>
              <span className="text-2xl font-black text-white">{dailyCapacity.toFixed(1)}</span>
              <span className="text-[11px] text-blue-200 block">Venues / Day</span>
            </div>

            <div className="bg-blue-800/80 border border-blue-700 rounded-lg p-3">
              <span className="text-[10px] text-blue-300 uppercase font-bold block">Weekly Capacity (5d)</span>
              <span className="text-2xl font-black text-white">{weeklyCapacity.toFixed(1)}</span>
              <span className="text-[11px] text-blue-200 block">Venues / Week</span>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-200 block">Estimated Completion Time</span>
              <span className="text-2xl font-black text-emerald-400">{estimatedDays} Working Days</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-300 block">Projected Finish Date</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {dateFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
