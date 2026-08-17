'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Globe,
  Users,
  MapPin,
  Building2,
  X,
  Sparkles,
  BarChart3,
  Map,
  Calculator,
  GitCompare,
  TrendingUp,
  Landmark,
  TrainTrack
} from 'lucide-react';

export const NAVIGATION_CATEGORIES = [
  {
    id: 'executive',
    title: 'EXECUTIVE',
    icon: LayoutDashboard,
    items: [
      { id: 1, secCode: 'SEC 1', title: 'Executive Overview', icon: BarChart3, badge: 'KPIs' }
    ]
  },
  {
    id: 'geographic_analysis',
    title: 'GEOGRAPHIC ANALYSIS',
    icon: Globe,
    items: [
      { id: 2, secCode: 'SEC 2', title: 'India Geographic Map', icon: Map, badge: 'India' },
      { id: 3, secCode: 'SEC 3', title: 'TN District Analysis', icon: Globe, badge: 'Tamil Nadu' }
    ]
  },
  {
    id: 'operations',
    title: 'OPERATIONS',
    icon: TrainTrack,
    items: [
      { id: 4, secCode: 'SEC 4', title: 'Manpower Requirement', icon: Users, badge: 'Manpower' },
      { id: 5, secCode: 'SEC 5', title: 'Metro System Analysis', icon: TrainTrack, badge: 'Metro' }
    ]
  },
  {
    id: 'workforce',
    title: 'WORKFORCE',
    icon: Users,
    items: [
      { id: 6, secCode: 'SEC 6', title: 'Workforce What-If', icon: Calculator, badge: 'What-If' },
      { id: 8, secCode: 'SEC 8', title: 'Working Hours vs Output', icon: TrendingUp, badge: 'Productivity' }
    ]
  },
  {
    id: 'venue_analytics',
    title: 'VENUE ANALYTICS',
    icon: Building2,
    items: [
      { id: 10, secCode: 'SEC 10', title: 'Venue Analytics', icon: Landmark, badge: 'BMW' }
    ]
  }
];

export default function AnalyticsSidebar({
  selectedSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}) {
  // Track which categories are collapsed (default: all expanded = empty set)
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (catId) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleItemClick = (id) => {
    onSelectSection(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none">
      {/* Top Branding Section */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Locked A2C Logo Asset */}
            <div className="h-10 w-10 relative flex items-center justify-center p-0.5 bg-white border border-slate-200 rounded-xl shadow-2xs shrink-0 overflow-hidden">
              <img src="/a2c-logo.png" alt="A2C Logo" className="h-full w-auto object-contain" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 tracking-tight truncate">
                  R&D ANALYTICS
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded uppercase">
                  BMW
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 truncate">
                A2C Analytical Dashboard
              </p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAVIGATION_CATEGORIES.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          const CategoryIcon = category.icon;
          const hasActiveChild = category.items.some((item) => item.id === selectedSection);

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header Button */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full px-2.5 py-1.5 flex items-center justify-between rounded-lg transition-colors text-left cursor-pointer group ${
                  hasActiveChild ? 'bg-blue-50/60 text-blue-900' : 'hover:bg-slate-100/70 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`w-4 h-4 ${hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-600">
                    {category.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-slate-200">
                    {category.items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {!isCollapsed && (
                <div className="pl-2 space-y-0.5 border-l-2 border-slate-100 ml-3 mt-1">
                  {category.items.map((item) => {
                    const isActive = selectedSection === item.id;
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-black rounded-md shrink-0 ${
                              isActive
                                ? 'bg-blue-700 text-blue-100'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {item.secCode}
                          </span>
                          <span className="truncate text-xs">{item.title}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Card inside Sidebar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center space-y-1 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-blue-700 font-extrabold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>2C Analytics Dashboard</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            8 Active Analytics Sections
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Slide-out Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
