import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as xlsxModule from 'xlsx';
import { clearVenueCache } from '@/lib/venueDataService';

const xlsx = xlsxModule.default || xlsxModule;

// Temporary in-memory staging for uploaded file buffer during preview phase
let _stagedUploadBuffer = null;
let _stagedFileInfo = null;

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analyze';

    if (action === 'confirm') {
      if (!_stagedUploadBuffer) {
        return NextResponse.json(
          { success: false, error: 'No staged workbook found for confirmation. Please re-upload the file.' },
          { status: 200 }
        );
      }

      const targetPath = path.join(process.cwd(), 'data', 'TN Districts Pincodes.xlsx');
      fs.writeFileSync(targetPath, _stagedUploadBuffer);

      // Clear in-memory venue dataset cache so Section 10 API serves the new data instantly
      clearVenueCache();

      const confirmedFile = _stagedFileInfo;
      _stagedUploadBuffer = null;
      _stagedFileInfo = null;

      return NextResponse.json({
        success: true,
        message: 'Venue Dataset Updated Successfully',
        fileInfo: confirmedFile,
        timestamp: new Date().toISOString()
      });
    }

    // Default Action: Analyze & Preview
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No Excel file provided in the upload request.' },
        { status: 200 }
      );
    }

    const fileName = file.name || 'uploaded_venue_dataset.xlsx';
    if (!fileName.toLowerCase().endsWith('.xlsx') && !fileName.toLowerCase().endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload an Excel workbook (.xlsx or .xls).' },
        { status: 200 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (fileBuffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file exceeds the maximum 25MB size limit.' },
        { status: 200 }
      );
    }

    let wb;
    try {
      wb = xlsx.read(fileBuffer, { type: 'buffer' });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: `Corrupted Excel workbook format: ${err.message}` },
        { status: 200 }
      );
    }

    if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel workbook contains no valid sheets.' },
        { status: 200 }
      );
    }

    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Excel sheet is completely empty.' },
        { status: 200 }
      );
    }

    // Dynamic Header Scanner (Order-Independent)
    let distCol = -1;
    let venueCol = -1;

    for (let r = 0; r < Math.min(5, rows.length); r++) {
      const row = rows[r] || [];
      row.forEach((cell, c) => {
        if (typeof cell === 'string') {
          const val = cell.trim().toUpperCase();
          if (['DISTRICTS', 'DISTRICT', 'DISTRICT NAME'].includes(val) && distCol === -1) distCol = c;
          if (['VENUE COUNT', 'VENUES', 'VENUE', 'ESTIMATED VENUES'].includes(val) && venueCol === -1 && c !== distCol) venueCol = c;
        }
      });
      if (distCol !== -1 && venueCol !== -1) break;
    }

    if (distCol === -1) {
      return NextResponse.json(
        { success: false, error: 'District column is missing from the uploaded Venue Dataset.' },
        { status: 200 }
      );
    }

    if (venueCol === -1) {
      return NextResponse.json(
        { success: false, error: 'Venue Count column is missing from the uploaded Venue Dataset.' },
        { status: 200 }
      );
    }

    // Dynamic Additional Columns Scanner
    const headerRow = rows[0] || [];
    const knownHeaders = ['DISTRICTS', 'DISTRICT', 'DISTRICT NAME', 'VENUE COUNT', 'VENUES', 'VENUE', 'ESTIMATED VENUES', 'STATE', 'UNION TERRITORIES', 'UNION TERRITORIES (DISTRICTS)', 'STATUS LABELS'];
    const dynamicColMap = {};

    headerRow.forEach((cell, c) => {
      if (cell && typeof cell === 'string') {
        const trimmed = cell.trim();
        const upper = trimmed.toUpperCase();
        if (c !== distCol && c !== venueCol && !knownHeaders.includes(upper)) {
          dynamicColMap[c] = trimmed;
        }
      }
    });

    // Record Analysis & Validation
    const districtRecords = [];
    let exactCount = 0;
    let approximateCount = 0;
    let totalVenues = 0;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row) continue;

      const dCell = row[distCol];
      const vCell = row[venueCol];

      if (dCell !== undefined && dCell !== null && dCell !== '') {
        const districtName = String(dCell).trim();
        if (['DISTRICTS', 'STATE', 'UNION TERRITORIES'].includes(districtName.toUpperCase())) continue;

        let isApprox = false;
        let venueNum = 0;

        if (vCell !== undefined && vCell !== null && vCell !== '') {
          const strVal = String(vCell).trim();
          if (strVal.includes('±')) {
            isApprox = true;
            approximateCount++;
          } else {
            exactCount++;
          }
          const parsedNum = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
          venueNum = isNaN(parsedNum) ? 0 : parsedNum;
        }

        totalVenues += venueNum;

        const additionalFields = {};
        Object.entries(dynamicColMap).forEach(([cIdx, colName]) => {
          if (row[cIdx] !== undefined && row[cIdx] !== null && row[cIdx] !== '') {
            additionalFields[colName] = row[cIdx];
          }
        });

        districtRecords.push({
          district: districtName,
          venueCount: venueNum,
          displayVenue: isApprox ? `${venueNum} ±` : `${venueNum}`,
          isApproximate: isApprox,
          additionalFields
        });
      }
    }

    // Stage buffer in memory for user confirmation
    _stagedUploadBuffer = fileBuffer;
    _stagedFileInfo = {
      name: fileName,
      sizeKb: (fileBuffer.length / 1024).toFixed(1),
      sheetName: wb.SheetNames[0],
      totalRows: rows.length
    };

    const dynamicColumnsList = Object.values(dynamicColMap);

    return NextResponse.json({
      success: true,
      previewOnly: true,
      fileInfo: _stagedFileInfo,
      summary: {
        totalDistricts: districtRecords.length,
        totalVenues,
        exactCount,
        approximateCount,
        dynamicColumnsCount: dynamicColumnsList.length
      },
      dynamicColumns: dynamicColumnsList,
      sampleRows: districtRecords.slice(0, 6)
    });

  } catch (error) {
    console.error('Error in /api/venue-upload route:', error);
    return NextResponse.json(
      { success: false, error: `Upload processing failed: ${error.message}` },
      { status: 200 }
    );
  }
}
