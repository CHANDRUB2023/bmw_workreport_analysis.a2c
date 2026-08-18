'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Globe,
  Users,
  Building2,
  X,
  Sparkles,
  BarChart3,
  Map,
  Calculator,
  TrendingUp,
  Landmark,
  TrainTrack,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const NAVIGATION_CATEGORIES = [
  {
    id: 'executive',
    title: 'EXECUTIVE',
    icon: LayoutDashboard,
    items: [
      { id: 1, secCode: '01', title: 'Executive Overview', icon: BarChart3, badge: 'KPIs' }
    ]
  },
  {
    id: 'geographic_analysis',
    title: 'GEOGRAPHIC ANALYSIS',
    icon: Globe,
    items: [
      { id: 2, secCode: '02', title: 'India Geographic Map', icon: Map, badge: 'India' },
      { id: 3, secCode: '03', title: 'TN District Analysis', icon: Globe, badge: 'Tamil Nadu' }
    ]
  },
  {
    id: 'operations',
    title: 'OPERATIONS',
    icon: TrainTrack,
    items: [
      { id: 4, secCode: '04', title: 'Manpower Requirement', icon: Users, badge: 'Manpower' },
      { id: 5, secCode: '05', title: 'Metro System Analysis', icon: TrainTrack, badge: 'Metro' }
    ]
  },
  {
    id: 'workforce',
    title: 'WORKFORCE',
    icon: Users,
    items: [
      { id: 6, secCode: '06', title: 'Workforce What-If', icon: Calculator, badge: 'What-If' },
      { id: 8, secCode: '07', title: 'Working Hours vs Output', icon: TrendingUp, badge: 'Productivity' }
    ]
  },
  {
    id: 'venue_analytics',
    title: 'VENUE ANALYTICS',
    icon: Building2,
    items: [
      { id: 10, secCode: '08', title: 'Venue Analytics', icon: Landmark, badge: 'BMW' }
    ]
  }
];

export default function AnalyticsSidebar({
  selectedSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}) {
  // Track which categories are collapsed (default: all expanded)
  const [collapsedCategories, setCollapsedCategories] = useState({});
  // Track desktop compact sidebar mode
  const [isCompact, setIsCompact] = useState(false);

  const handleItemClick = (id) => {
    onSelectSection(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleCategoryClick = (category) => {
    // Un-collapse category
    setCollapsedCategories((prev) => ({
      ...prev,
      [category.id]: false
    }));
    // Select first item in category if not already active
    if (category.items && category.items.length > 0) {
      handleItemClick(category.items[0].id);
    }
  };

  let globalItemIndex = 0;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 select-none custom-scrollbar overflow-y-auto relative">
      {/* Top Branding Section */}
      <div className={`p-4 border-b border-slate-200 bg-slate-50/70 backdrop-blur-xs animate-fade-in ${isCompact ? 'px-2 py-3 text-center' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          <div className={`flex items-center gap-3 min-w-0 group cursor-pointer ${isCompact ? 'justify-center mx-auto' : ''}`} onClick={() => isCompact && setIsCompact(false)}>
            {/* Locked A2C Logo Asset */}
            <div className="h-10 w-10 relative flex items-center justify-center p-0.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs shrink-0 overflow-hidden group-hover:shadow-md group-hover:border-blue-300 transition-all duration-300">
              <img src="/a2c-logo.png" alt="A2C Logo" className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>

            {!isCompact && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900 tracking-tight truncate group-hover:text-blue-900 transition-colors">
                    R&D ANALYTICS
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-blue-100/80 text-blue-800 rounded uppercase border border-blue-200/60 shadow-2xs">
                    BMW
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 truncate">
                  A2C Analytical Dashboard
                </p>
              </div>
            )}
          </div>

          {/* Compact Toggle Button on Desktop */}
          {!isOpenMobile && (
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer hidden lg:flex shrink-0"
              title={isCompact ? "Expand Sidebar" : "Compact Sidebar"}
            >
              {isCompact ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          )}

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
      <div className={`flex-1 overflow-y-auto p-3 space-y-3.5 ${isCompact ? 'px-2' : ''}`}>
        {NAVIGATION_CATEGORIES.map((category, catIdx) => {
          const hasActiveChild = category.items.some((item) => item.id === selectedSection);
          // Active category is ALWAYS expanded. Other categories expand/collapse on toggle.
          const isCollapsed = collapsedCategories[category.id] && !hasActiveChild;
          const CategoryIcon = category.icon;
          const catDelay = `${catIdx * 60 + 80}ms`;

          return (
            <div
              key={category.id}
              className="space-y-1 animate-sidebar-slide"
              style={{ animationDelay: catDelay }}
            >
              {/* Category Header Button */}
              {!isCompact ? (
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full px-2.5 py-1.5 flex items-center justify-between rounded-lg transition-all duration-200 text-left cursor-pointer group ${
                    hasActiveChild ? 'bg-blue-50/70 text-blue-900 font-bold' : 'hover:bg-slate-100/80 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-600 group-hover:text-slate-900 transition-colors">
                      {category.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors animate-badge-pop">
                      {category.items.length}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-250 ease-out ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                  </div>
                </button>
              ) : (
                <div
                  className="py-1 text-center border-b border-slate-100 pb-1.5 mb-1 cursor-pointer group"
                  title={category.title}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CategoryIcon className="w-4 h-4 mx-auto text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              )}

              {/* Category Items */}
              <div
                className={!isCompact ? `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isCollapsed ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'
                }` : 'space-y-1.5'}
              >
                <div className={!isCompact ? "overflow-hidden" : ""}>
                  <div className={!isCompact ? "pl-2 space-y-1 border-l-2 border-slate-100/90 ml-3 mt-1" : "space-y-1.5"}>
                    {category.items.map((item) => {
                      globalItemIndex += 1;
                      const isActive = selectedSection === item.id;
                      const ItemIcon = item.icon;
                      const itemDelay = `${globalItemIndex * 40 + 120}ms`;

                      return (
                        <div key={item.id} className="relative group/compact">
                          <button
                            onClick={() => handleItemClick(item.id)}
                            style={{ animationDelay: itemDelay }}
                            className={`w-full text-left rounded-xl text-xs flex items-center transition-all duration-200 cursor-pointer group animate-sidebar-slide ${
                              isCompact
                                ? `p-2.5 justify-center ${
                                    isActive
                                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-600/30'
                                      : 'text-slate-700 hover:bg-slate-100 hover:text-blue-900'
                                  }`
                                : `px-3 py-2 justify-between ${
                                    isActive
                                      ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-600/25 border-l-4 border-blue-300 translate-x-1'
                                      : 'text-slate-700 hover:bg-slate-100/90 hover:text-blue-900 hover:translate-x-1 font-semibold'
                                  }`
                            }`}
                          >
                            <div className={`flex items-center gap-2.5 min-w-0 ${isCompact ? 'justify-center' : ''}`}>
                              <ItemIcon
                                className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                                }`}
                              />
                              {!isCompact && (
                                <>
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] font-black rounded-md shrink-0 transition-colors ${
                                      isActive
                                        ? 'bg-blue-700/80 text-blue-100 shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200'
                                    }`}
                                  >
                                    {item.secCode}
                                  </span>
                                  <span className="truncate text-xs tracking-tight">{item.title}</span>
                                </>
                              )}
                            </div>
                            {!isCompact && isActive && (
                              <span className="w-2 h-2 rounded-full bg-white shrink-0 ml-1 shadow-[0_0_8px_#ffffff] animate-pulse" />
                            )}
                          </button>

                          {/* Floating Animated Tooltip for Compact Desktop Mode */}
                          {isCompact && (
                            <div className="opacity-0 pointer-events-none group-hover/compact:opacity-100 group-hover/compact:pointer-events-auto transition-all duration-200 ease-out transform translate-x-1 group-hover/compact:translate-x-0 absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-slate-700/80 w-52 text-left">
                              <div className="flex items-center gap-2 mb-1 pb-1 border-b border-slate-800">
                                <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-600 text-white rounded">
                                  {item.secCode}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                                  {category.title}
                                </span>
                              </div>
                              <div className="text-xs font-extrabold text-slate-100">
                                {item.title}
                              </div>
                              {/* Pointer Arrow */}
                              <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-slate-900/95" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Card inside Sidebar */}
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/80 animate-fade-in">
        {!isCompact ? (
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center space-y-1 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-center gap-1.5 text-blue-700 font-extrabold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>A2C Analytics Dashboard</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              8 Active Analytics Workspaces
            </p>
          </div>
        ) : (
          <div className="text-center py-1 cursor-pointer" onClick={() => setIsCompact(false)} title="8 Active Analytics Workspaces">
            <Sparkles className="w-4 h-4 mx-auto text-blue-600 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className={`hidden lg:block shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 ${isCompact ? 'w-20' : 'w-72'}`}>
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

