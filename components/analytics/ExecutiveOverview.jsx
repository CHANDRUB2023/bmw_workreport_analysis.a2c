'use client';

import React from 'react';
import { MapPin, Building2, Globe, CheckCircle2, Clock, Percent, ShieldCheck } from 'lucide-react';

export default function ExecutiveOverview({ kpis }) {
  const cards = [
    {
      title: 'Total States / UTs',
      value: kpis?.totalStates ?? 37,
      subtitle: 'Covered in Master CSV',
      icon: Globe,
      iconBg: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Total Districts',
      value: (kpis?.totalDistricts ?? 750).toLocaleString(),
      subtitle: 'All-India Coverage',
      icon: Building2,
      iconBg: 'bg-indigo-100 text-indigo-700'
    },
    {
      title: 'Unique Pincodes',
      value: (kpis?.totalUniquePincodes ?? 19586).toLocaleString(),
      subtitle: '6-Digit Verified PINs',
      icon: MapPin,
      iconBg: 'bg-sky-100 text-sky-700'
    },
    {
      title: 'Tamil Nadu Districts',
      value: kpis?.tnTotalDistricts ?? 38,
      subtitle: 'Target Operations Scope',
      icon: ShieldCheck,
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      title: 'Completed Districts',
      value: kpis?.tnCompletedDistricts ?? 8,
      subtitle: 'Operational Verified',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    {
      title: 'Pending Districts',
      value: kpis?.tnPendingDistricts ?? 30,
      subtitle: 'Workforce Queue',
      icon: Clock,
      iconBg: 'bg-orange-100 text-orange-700'
    },
    {
      title: 'Completion Rate',
      value: `${kpis?.tnCompletionPct ?? 21.1}%`,
      subtitle: 'TN Operational Progress',
      icon: Percent,
      iconBg: 'bg-teal-100 text-teal-700'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>SECTION 1</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-900">EXECUTIVE OVERVIEW</span>
        </h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          Source: Master CSV Dataset
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg ${c.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {c.value}
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                  {c.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
