'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, X, RefreshCw, Layers, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function VenueUploadModal({ isOpen, onClose, onSuccessRefresh }) {
  const [step, setStep] = useState('SELECT'); // 'SELECT', 'PREVIEW', 'SUCCESS', 'ERROR'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select an Excel workbook file first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/venue-upload?action=analyze', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setIsAnalyzing(false);

      if (data.success) {
        setPreviewData(data);
        setStep('PREVIEW');
      } else {
        setErrorMsg(data.error || 'Failed to analyze Excel file.');
        setStep('ERROR');
      }
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMsg(`Server error during file analysis: ${err.message}`);
      setStep('ERROR');
    }
  };

  const handleConfirmApply = async () => {
    setIsConfirming(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/venue-upload?action=confirm', {
        method: 'POST'
      });

      const data = await res.json();
      setIsConfirming(false);

      if (data.success) {
        setStep('SUCCESS');
        if (onSuccessRefresh) onSuccessRefresh();
      } else {
        setErrorMsg(data.error || 'Failed to confirm dataset replacement.');
      }
    } catch (err) {
      setIsConfirming(false);
      setErrorMsg(`Server error during confirmation: ${err.message}`);
    }
  };

  const handleReset = () => {
    setStep('SELECT');
    setSelectedFile(null);
    setPreviewData(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>UPLOAD / REPLACE VENUE DATASET</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md">
                  Section 10 Only
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a new Excel workbook (<span className="font-semibold text-slate-700">.xlsx / .xls</span>) for Tamil Nadu Venue Analytics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* STEP 1: SELECT FILE */}
          {step === 'SELECT' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-extrabold text-slate-800 block">
                    Click to select or drag & drop Excel workbook
                  </span>
                  <span className="text-xs text-slate-400 font-medium mt-1 block">
                    Supports .xlsx or .xls (Max 25MB). Must contain District and Venue Count columns.
                  </span>
                </div>

                {selectedFile && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold">
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <span>{selectedFile.name}</span>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION */}
          {step === 'PREVIEW' && previewData && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>WORKBOOK VALIDATION PASSED</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    {previewData.fileInfo.name} ({(previewData.fileInfo.sizeKb)} KB)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Districts</span>
                    <span className="text-base font-black text-slate-900">{previewData.summary.totalDistricts}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Venues</span>
                    <span className="text-base font-black text-blue-900">{previewData.summary.totalVenues.toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Exact Records</span>
                    <span className="text-base font-black text-emerald-700">{previewData.summary.exactCount}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Approx (±)</span>
                    <span className="text-base font-black text-amber-700">{previewData.summary.approximateCount}</span>
                  </div>
                </div>

                {/* Dynamic Columns Detected */}
                {previewData.dynamicColumns && previewData.dynamicColumns.length > 0 ? (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-extrabold text-blue-900 uppercase block mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{previewData.dynamicColumns.length} New Dynamic Excel Columns Detected</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewData.dynamicColumns.map((colName) => (
                        <span key={colName} className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-md text-xs font-bold">
                          + {colName}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-slate-500">
                    Standard Excel Schema (No additional columns added)
                  </div>
                )}
              </div>

              {/* Preview Sample Table */}
              {previewData.sampleRows && previewData.sampleRows.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Sample Records Preview (First {previewData.sampleRows.length} Rows)
                  </span>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] sticky top-0">
                        <tr>
                          <th className="px-3 py-2">District</th>
                          <th className="px-3 py-2">Venue Count</th>
                          <th className="px-3 py-2">Precision</th>
                          {previewData.dynamicColumns.map(col => (
                            <th key={col} className="px-3 py-2 bg-blue-50 text-blue-900">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {previewData.sampleRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-bold text-slate-900">{r.district}</td>
                            <td className="px-3 py-1.5 font-black text-blue-900">{r.displayVenue}</td>
                            <td className="px-3 py-1.5">
                              {r.isApproximate ? (
                                <span className="text-[10px] font-bold text-amber-700">Approximate (±)</span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700">Exact</span>
                              )}
                            </td>
                            {previewData.dynamicColumns.map(col => (
                              <td key={col} className="px-3 py-1.5 font-bold text-slate-800 bg-blue-50/20">
                                {r.additionalFields?.[col] !== undefined ? String(r.additionalFields[col]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP ERROR */}
          {step === 'ERROR' && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-rose-900">Workbook Validation Error</h4>
                <p className="text-xs font-bold text-rose-700 mt-1">{errorMsg}</p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Another Excel File</span>
              </button>
            </div>
          )}

          {/* STEP SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-900">Venue Dataset Updated Successfully!</h4>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  The active Venue Analytics dataset has been replaced. Section 10 analytics and dynamic fields have refreshed automatically.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'SELECT' && (
          <div className="border-t border-slate-200 pt-3 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{isAnalyzing ? 'Analyzing Workbook...' : 'Analyze File'}</span>
            </button>
          </div>
        )}

        {step === 'PREVIEW' && (
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Select Different File
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isConfirming}
                className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isConfirming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{isConfirming ? 'Applying Dataset...' : 'CONFIRM & APPLY'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
