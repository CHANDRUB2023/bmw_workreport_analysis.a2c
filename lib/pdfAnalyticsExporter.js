import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportAnalyticsPdfReport({
  kpis,
  statesData = [],
  tnDistrictsData = [],
  topDistrictsData = [],
  productivityMetrics,
  whatIfScenarios = [],
  insights = [],
  metroData,
  statusCounts,
  venueSummary,
  venueDistricts = []
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
  doc.setFontSize(18);
  doc.text('R&D REPORT ANALYSIS — BOOK MY VENUE (BMW)', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Executive Operations & Pincode Intelligence Report | Data Analyzed by A2C Team', 14, 23);
  doc.text(`Generated: ${dateStr} | ${timeStr}`, 130, 23);

  let currentY = 40;

  // 1. Executive Summary & KPIs
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('1. EXECUTIVE KPI SUMMARY', 14, currentY);
  currentY += 6;

  const compCount = statusCounts?.completedCount ?? (kpis?.tnCompletedDistricts || 8);
  const progCount = statusCounts?.progressCount ?? 0;
  const pendCount = statusCounts?.pendingCount ?? (38 - compCount);
  const compPct = statusCounts?.completionPct ?? (kpis?.tnCompletionPct || 21.1);

  const kpiRows = [
    ['Total States / Union Territories', String(kpis?.totalStates || 37)],
    ['Total All-India Districts', String(kpis?.totalDistricts || 750)],
    ['Total Unique 6-Digit Pincodes', String(kpis?.totalUniquePincodes || 19586).replace(/\B(?=(\d{3})+(?!\d))/g, ',')],
    ['Total Master Post Office Records', String(kpis?.totalPostOffices || 145086).replace(/\B(?=(\d{3})+(?!\d))/g, ',')],
    ['Tamil Nadu Total Districts', '38 Districts'],
    ['Completed Districts (Verified)', `${compCount} Districts (${compPct}%)`],
    ['In Progress Districts', `${progCount} Districts`],
    ['Pending Work Districts', `${pendCount} Districts`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Key Performance Indicator', 'Dataset / Calculated Metric']],
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
  doc.text('3. TAMIL NADU DISTRICT STATUS BREAKDOWN', 14, currentY);
  currentY += 6;

  const tnRows = (tnDistrictsData || []).slice(0, 15).map(d => [
    d.district,
    d.status || 'PENDING',
    String(d.pincodeCount),
    String(d.recordCount)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['District Name', 'Operational Status', 'Unique Pincodes', 'Post Office Records']],
    body: tnRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === 'body') {
        if (data.cell.raw === 'COMPLETED') {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'PROGRESS' || data.cell.raw === 'IN PROGRESS') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 4. Workforce Scenarios Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('4. WORKFORCE SCENARIO ANALYSIS', 14, currentY);
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
    head: [['Scenario', 'Members', 'Hours', 'Daily Output', 'Estimated Completion']],
    body: scenarioRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 14, right: 14 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 5. Section 10 Venue Analytics Summary (Optional addition if venueDistricts provided)
  if (venueDistricts && venueDistricts.length > 0) {
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('5. SECTION 10 — VENUE ANALYTICS (BOOK MY VENUE)', 14, currentY);
    currentY += 6;

    const venueRows = (venueDistricts || []).slice(0, 15).map(d => [
      `#${d.rank}`,
      d.district,
      d.displayVenue,
      d.isApproximate ? 'Approximate (±)' : 'Exact',
      `${d.pincodeCount} PINs`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'District Name', 'Venue Count', 'Data Type', 'Excel Unique PINs']],
      body: venueRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === 'body') {
          if (data.cell.raw === 'Exact') {
            data.cell.styles.textColor = [16, 185, 129];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} — R&D Report Analysis (Book My Venue - BMW) — Data Analyzed by A2C Team`, 14, 287);
  }

  doc.save(`RD_Report_Analysis_BMW_A2C_${now.toISOString().slice(0,10)}.pdf`);
}
