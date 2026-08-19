'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Hash, Calendar, Type, CheckSquare, Layers, Search, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';

export default function DynamicExcelFieldsCard({ dynamicColumns = [], excelSheets = [] }) {
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [expandedFields, setExpandedFields] = useState({});

  const sheets = useMemo(() => {
    if (excelSheets && Array.isArray(excelSheets) && excelSheets.length > 0) {
      return excelSheets;
    }
    if (dynamicColumns && Array.isArray(dynamicColumns) && dynamicColumns.length > 0) {
      return [{ sheetName: 'Sheet 1', fields: dynamicColumns }];
    }
    return [];
  }, [excelSheets, dynamicColumns]);

  if (!sheets || sheets.length === 0) {
    return null;
  }

  const activeSheet = sheets[selectedSheetIndex] || sheets[0] || { sheetName: 'Sheet 1', fields: [] };
  const activeFields = activeSheet.fields || [];

  const filteredFields = useMemo(() => {
    return activeFields.filter((col) => {
      const name = typeof col === 'string' ? col : col.name || '';
      const type = typeof col === 'object' ? col.type : 'Text';
      const sampleVals = (col.sampleValues || col.actualValues || []).map(v => String(v).toLowerCase());

      const matchesSearch = !searchQuery.trim() ||
        name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        sampleVals.some(val => val.includes(searchQuery.toLowerCase().trim()));

      const matchesType = selectedType === 'ALL' ||
        (selectedType === 'Numeric' && (type === 'Number' || type === 'Numeric')) ||
        (selectedType === 'Text' && type === 'Text') ||
        (selectedType === 'Date' && type === 'Date') ||
        (selectedType === 'Boolean' && type === 'Boolean');

      return matchesSearch && matchesType;
    });
  }, [activeFields, searchQuery, selectedType]);

  const toggleExpand = (fieldName) => {
    setExpandedFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const getTypeBadge = (type) => {
    const normType = type === 'Number' ? 'Numeric' : type;
    switch (normType) {
      case 'Numeric':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-flex items-center gap-1">
            <Hash className="w-3 h-3 text-blue-400" /> Numeric
          </span>
        );
      case 'Date':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30 inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-400" /> Date
          </span>
        );
      case 'Boolean':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 inline-flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-emerald-400" /> Boolean
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-500/20 text-slate-300 border border-slate-400/30 inline-flex items-center gap-1">
            <Type className="w-3 h-3 text-slate-400" /> Text
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm space-y-4 animate-fade-in border border-blue-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-800/80 pb-3 gap-3">
        <div>
          <h3 className="text-base font-extrabold flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>DYNAMIC EXCEL DATASET FIELDS DETECTED</span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-amber-400 text-slate-950 rounded-full">
              {activeFields.length} Actual Field{activeFields.length > 1 ? 's' : ''}
            </span>
          </h3>
          <p className="text-xs text-blue-200/90 mt-0.5">
            True dynamic schema viewer. Displaying actual fields and raw values directly from the uploaded Excel sheet.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-blue-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter fields or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950/40 border border-blue-700/60 text-xs rounded-lg text-white placeholder-blue-300/60 focus:outline-hidden focus:border-amber-400 w-44 sm:w-52"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-blue-700/60 text-[11px] font-bold">
            {['ALL', 'Numeric', 'Text'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Sheet Switcher Tabs (If multiple sheets exist) */}
      {sheets.length > 1 && (
        <div className="flex items-center gap-2 border-b border-blue-800/60 pb-2 overflow-x-auto">
          <span className="text-xs font-extrabold text-blue-300 flex items-center gap-1 uppercase tracking-wider shrink-0 mr-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" /> Workbook Sheets:
          </span>
          {sheets.map((sh, idx) => (
            <button
              key={sh.sheetName || idx}
              onClick={() => setSelectedSheetIndex(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedSheetIndex === idx
                  ? 'bg-white text-blue-950 shadow-xs border border-amber-400/80'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20 hover:text-white border border-transparent'
              }`}
            >
              <span>{sh.sheetName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedSheetIndex === idx ? 'bg-blue-100 text-blue-900 font-black' : 'bg-white/10 text-blue-300'
              }`}>
                {sh.fields ? sh.fields.length : 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Field Cards Grid */}
      {filteredFields.length === 0 ? (
        <div className="bg-slate-950/30 border border-white/10 rounded-xl p-6 text-center space-y-1">
          <p className="text-xs font-bold text-blue-200">No fields matching filter criteria</p>
          <p className="text-[11px] text-blue-300/70">Try resetting search query or field type filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFields.map((col, idx) => {
            const fieldName = typeof col === 'string' ? col : col.name;
            const fieldKey = (typeof col === 'object' && col.id)
              ? col.id
              : (typeof col === 'object' && col.columnIndex !== undefined)
                ? `${fieldName}_col_${col.columnIndex}`
                : `${fieldName}_idx_${idx}`;

            const fieldType = typeof col === 'object' ? col.type : 'Text';
            const uniqueCount = typeof col === 'object' && col.uniqueCount !== undefined
              ? col.uniqueCount
              : (col.sampleValues ? col.sampleValues.length : 0);
            const rawValues = (typeof col === 'object' ? (col.actualValues || col.sampleValues) : []) || [];
            const isExpanded = expandedFields[fieldKey];
            const displayValues = isExpanded ? rawValues : rawValues.slice(0, 10);
            const hasMore = rawValues.length > 10;

            return (
              <div
                key={fieldKey}
                className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-3.5 space-y-3 flex flex-col justify-between hover:border-amber-400/40 hover:bg-white/15 transition-all duration-200 shadow-2xs group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <h4 className="text-sm font-black text-white truncate" title={fieldName}>
                      {fieldName}
                    </h4>
                    {getTypeBadge(fieldType)}
                  </div>

                  <div className="mt-2 text-[11px] text-blue-200/90 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                    <span>{uniqueCount} unique value{uniqueCount !== 1 ? 's' : ''} in sheet</span>
                  </div>
                </div>

                {/* Actual Values Container (NO Derived Min/Max/Avg/Sum stats) */}
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase text-blue-300/80 tracking-wider block">
                    Actual values from uploaded sheet
                  </span>

                  {rawValues.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No values present in column</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto pr-1">
                      {displayValues.map((val, vIdx) => (
                        <span
                          key={`${fieldKey}_val_${vIdx}`}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950/40 text-blue-100 border border-white/10 break-all max-w-[200px]"
                          title={String(val)}
                        >
                          {String(val)}
                        </span>
                      ))}
                    </div>
                  )}

                  {hasMore && (
                    <button
                      onClick={() => toggleExpand(fieldKey)}
                      className="text-[10px] font-extrabold text-amber-300 hover:text-amber-200 mt-1 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" /> Show sample values
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" /> Show all {rawValues.length} values
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
