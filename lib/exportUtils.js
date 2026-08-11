import * as XLSX from 'xlsx';

export function exportRecordsToCSV(records, filename = 'pincode_analytics_export.csv') {
  if (!records || records.length === 0) return;

  const headers = ['Office Name', 'Pincode', 'Office Type', 'Delivery Status', 'Division', 'Region', 'Circle', 'District', 'State'];
  const csvRows = [headers.join(',')];

  records.forEach(r => {
    const row = [
      `"${(r.officename || '').replace(/"/g, '""')}"`,
      `"${r.pincode || ''}"`,
      `"${r.officetype || ''}"`,
      `"${r.delivery || ''}"`,
      `"${(r.divisionname || '').replace(/"/g, '""')}"`,
      `"${(r.regionname || '').replace(/"/g, '""')}"`,
      `"${(r.circlename || '').replace(/"/g, '""')}"`,
      `"${(r.district || '').replace(/"/g, '""')}"`,
      `"${(r.statename || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportRecordsToExcel(records, filename = 'pincode_analytics_export.xlsx') {
  if (!records || records.length === 0) return;

  const data = records.map(r => ({
    'Office Name': r.officename,
    'Pincode': r.pincode,
    'Office Type': r.officetype,
    'Delivery Status': r.delivery,
    'Division': r.divisionname,
    'Region': r.regionname,
    'Circle': r.circlename,
    'District': r.district,
    'State': r.statename
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pincode Analytics');
  XLSX.writeFile(workbook, filename);
}
