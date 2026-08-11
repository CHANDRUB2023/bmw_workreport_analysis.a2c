'use client';

import React, { useMemo } from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { generateOperationalInsights } from '@/lib/analyticsService';

export default function ProductivityInsightsCard({
  teamMembers = 4,
  workingHours = 8,
  completedVenues = 18,
  cutoffHours = 5,
  targetRemainingVenues = 90
}) {
  const insights = useMemo(() => {
    return generateOperationalInsights({
      teamMembers,
      workingHours,
      completedVenues,
      cutoffHours,
      targetRemainingVenues
    });
  }, [teamMembers, workingHours, completedVenues, cutoffHours, targetRemainingVenues]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">SEC 14</span>
          <span>KEY PRODUCTIVITY INSIGHTS</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamically evaluated operational insights based on current dataset parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((statement, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
          >
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {statement}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
