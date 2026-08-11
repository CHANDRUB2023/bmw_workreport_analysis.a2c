import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportAnalyticsPdfReport({
  kpis,
  statesData = [],
  tnDistrictsData = [],
  topDistrictsData = [],
  productivityMetrics,
  whatIfScenarios = [],
  burndownSeries = [],
  insights = [],
  metroData
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Page 1 Header Banner
  doc.setFillColor(30, 64, 175); // Dark Blue #1e40af
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('A2C ANALYTICAL DASHBOARD REPORT', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('India & Tamil Nadu District / Pincode Analytics', 14, 23);
  doc.text(`Generated: ${dateStr} | ${timeStr}`, 135, 23);

  let currentY = 40;

  // 1. Executive Summary & KPIs
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. EXECUTIVE KPI SUMMARY', 14, currentY);
  currentY += 6;

  const kpiRows = [
    ['Total States / Union Territories', String(kpis?.totalStates || 37)],
    ['Total All-India Districts', String(kpis?.totalDistricts || 750)],
    ['Total Unique 6-Digit Pincodes', String(kpis?.totalUniquePincodes || 19586).replace(/\B(?=(\d{3})+(?!\d))/g, ',')],
    ['Total Master Post Offices', String(kpis?.totalPostOffices || 145086).replace(/\B(?=(\d{3})+(?!\d))/g, ',')],
    ['Tamil Nadu Total Districts', String(kpis?.tnTotalDistricts || 38)],
    ['Completed TN Districts', String(kpis?.tnCompletedDistricts || 8)],
    ['Pending TN Districts', String(kpis?.tnPendingDistricts || 30)],
    ['TN Completion Percentage', `${kpis?.tnCompletionPct || 21.1}%`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Key Performance Indicator', 'Dataset / Calculated Value']],
    body: kpiRows,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 2. Geographic & District Overview
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('2. GEOGRAPHIC DISTRIBUTION (TOP STATES)', 14, currentY);
  currentY += 6;

  const stateRows = (statesData || []).slice(0, 10).map(s => [
    s.stateName,
    String(s.districtCount),
    String(s.pincodeCount),
    String(s.recordCount)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['State / Union Territory', 'Districts', 'Unique Pincodes', 'Post Offices']],
    body: stateRows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 3. Tamil Nadu Operational Status
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('3. TAMIL NADU DISTRICT COMPLETION BREAKDOWN', 14, currentY);
  currentY += 6;

  const tnRows = (tnDistrictsData || []).slice(0, 15).map(d => [
    d.district,
    d.status,
    String(d.pincodeCount),
    String(d.recordCount)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['District Name', 'Completion Status', 'Unique Pincodes', 'Post Office Records']],
    body: tnRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === 'body') {
        if (data.cell.raw === 'COMPLETED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [217, 119, 6];
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 4. Productivity & Theoretical Workload Forecast
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. THEORETICAL PRODUCTIVITY & WORKFORCE FORECAST', 14, currentY);
  currentY += 6;

  const prodInputs = productivityMetrics?.inputs || {};
  const rates = productivityMetrics?.rates || {};
  const cutoff = productivityMetrics?.cutoffAnalysis || {};

  const prodRows = [
    ['Baseline Team Configuration', `${prodInputs.teamMembers || 4} Members @ ${prodInputs.workingHours || 8} Working Hours/Day`],
    ['Observed Baseline Productivity', `${productivityMetrics?.baseline?.teamHourlyRate || 2.25} venues/team-hour (${productivityMetrics?.baseline?.individualHourlyRate || 0.5625} per person-hour)`],
    ['Theoretical Hourly Range', `Min: ${rates.minRateHourly || 1.0} / Avg: ${rates.avgRateHourly || 1.75} / Max: ${rates.maxRateHourly || 2.5} venues/hr`],
    [`Cut-off Analysis (${prodInputs.cutoffHours || 5} Hours Output)`, `Min: ${cutoff.minPrediction || 5.0} | Avg: ${cutoff.avgPrediction || 8.75} | Max: ${cutoff.maxPrediction || 12.5} venues`],
    ['Target Remaining Venues', `${prodInputs.targetRemainingVenues || 90} Venues`],
    ['Estimated Days to Completion', `${productivityMetrics?.teamRequirement?.estimatedHoursCurrentTeam ? (productivityMetrics.teamRequirement.estimatedHoursCurrentTeam / prodInputs.workingHours).toFixed(1) : 5.0} Days`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Productivity Benchmark Parameter', 'Calculated Analytics Value']],
    body: prodRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 5. Workforce Scenarios Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('5. WORKFORCE SCENARIO COMPARISON', 14, currentY);
  currentY += 6;

  const scenarioRows = (whatIfScenarios || []).map(s => [
    s.name,
    String(s.members),
    `${s.hours} hrs`,
    `${s.expectedOutput} venues/day`,
    `${s.completionDays} Days`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Scenario', 'Members', 'Hours', 'Daily Capacity', 'Estimated Completion']],
    body: scenarioRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 6. Dynamic Key Insights
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('6. OPERATIONAL & PRODUCTIVITY INSIGHTS', 14, currentY);
  currentY += 6;

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  (insights || []).forEach((insight, idx) => {
    const splitText = doc.splitTextToSize(`${idx + 1}. ${insight}`, 180);
    doc.text(splitText, 14, currentY);
    currentY += splitText.length * 5 + 3;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} — A2C ANALYTICAL DASHBOARD REPORT`, 14, 287);
  }

  doc.save(`A2C_Analytical_Dashboard_Report_${now.toISOString().slice(0,10)}.pdf`);
}
