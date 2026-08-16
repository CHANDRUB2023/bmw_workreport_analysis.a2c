'use client';

import React from 'react';
import { Lightbulb, Trophy, TrendingUp, TrendingDown, Calculator, CheckCircle2 } from 'lucide-react';

export default function VenueInsightsCards({ summary }) {
  const highest = summary?.highestVenueDistrict;
  const secondHighest = summary?.secondHighestVenueDistrict;
  const lowest = summary?.lowestVenueDistrict;
  const avg = summary?.averageVenueCount ?? 0;
  const total = summary?.totalDistricts ?? 0;
  const exact = summary?.exactCount ?? 0;
  const approx = summary?.approximateCount ?? 0;

  const insights = [
    {
      title: 'Top Operations Hub',
      text: `${highest?.district || 'N/A'} leads Tamil Nadu with ${highest?.displayVenue || 0} venues (${highest?.isApproximate ? 'Approximate' : 'Exact'} count).`,
      icon: Trophy,
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
      iconColor: 'text-amber-600 bg-amber-100'
    },
    {
      title: 'Secondary Operations Center',
      text: `${secondHighest?.district || 'N/A'} ranks second with ${secondHighest?.displayVenue || 0} venues (${secondHighest?.isApproximate ? 'Approximate' : 'Exact'} count).`,
      icon: TrendingUp,
      color: 'border-blue-200 bg-blue-50/50 text-blue-900',
      iconColor: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Lowest Volume Scope',
      text: `${lowest?.district || 'N/A'} records the lowest venue density with ${lowest?.displayVenue || 0} venues.`,
      icon: TrendingDown,
      color: 'border-slate-200 bg-slate-50 text-slate-800',
      iconColor: 'text-slate-500 bg-slate-200'
    },
    {
      title: 'Statewide Average Density',
      text: `Average of ${avg.toLocaleString()} venues per district calculated dynamically across all ${total} districts.`,
      icon: Calculator,
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900',
      iconColor: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: 'Data Accuracy Ratio',
      text: `${exact} districts (${((exact / (total || 1)) * 100).toFixed(1)}%) contain exact figures; ${approx} districts rely on approximate (±) source counts.`,
      icon: CheckCircle2,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      iconColor: 'text-emerald-600 bg-emerald-100'
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>EXECUTIVE VENUE INSIGHTS</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamically calculated operational highlights from the venue Excel dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {insights.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`border rounded-xl p-3.5 flex flex-col justify-between space-y-2 transition-all ${item.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-lg ${item.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xs font-semibold leading-snug">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
