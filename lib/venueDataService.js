import fs from 'fs';
import path from 'path';
import * as xlsxModule from 'xlsx';
import { isDistrictCompleted, normalizeTnDistrictName } from './formatUtils.js';

const xlsx = xlsxModule.default || xlsxModule;

let cachedVenueData = null;
let lastLoadTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

function resolveExcelPath() {
  let envPath = (process.env.VENUE_EXCEL_PATH || '').trim();
  if ((envPath.startsWith('"') && envPath.endsWith('"')) || (envPath.startsWith("'") && envPath.endsWith("'"))) {
    envPath = envPath.slice(1, -1).trim();
  }

  const localProjectDataPath = path.join(process.cwd(), 'data', 'TN Districts Pincodes.xlsx');
  const candidates = [];

  if (envPath) {
    candidates.push(envPath);
    candidates.push(path.resolve(envPath));
    candidates.push(envPath.replace(/\//g, '\\'));
    candidates.push(envPath.replace(/\\/g, '/'));
  }

  candidates.push(localProjectDataPath);

  for (const p of candidates) {
    try {
      if (p && fs.existsSync(/*turbopackIgnore: true*/ p)) {
        return p;
      }
    } catch (e) {}
  }

  return localProjectDataPath;
}

function classifyFieldType(values) {
  if (!values || values.length === 0) return 'Text';

  let isNumber = true;
  let isDate = true;
  let isBoolean = true;

  const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/;
  const boolRegex = /^(true|false|yes|no|y|n|1|0)$/i;

  for (const val of values) {
    const strVal = String(val).trim();
    if (strVal === '') continue;

    // Check Number
    const num = Number(strVal.replace(/[^0-9.-]/g, ''));
    if (isNaN(num) || strVal.replace(/[^0-9.-]/g, '') === '') {
      isNumber = false;
    }

    // Check Date
    if (!dateRegex.test(strVal) && isNaN(Date.parse(strVal))) {
      isDate = false;
    }

    // Check Boolean
    if (!boolRegex.test(strVal)) {
      isBoolean = false;
    }
  }

  if (isNumber) return 'Number';
  if (isDate) return 'Date';
  if (isBoolean) return 'Boolean';
  return 'Text';
}

export function getVenueAnalyticsSummary() {
  const now = Date.now();
  if (cachedVenueData && (now - lastLoadTime) < CACHE_TTL_MS) {
    return cachedVenueData;
  }

  const resolvedPath = resolveExcelPath();

  if (process.env.NODE_ENV !== 'production') {
    console.log('[venueDataService] Server-side resolved Excel path:', resolvedPath);
  }

  if (!fs.existsSync(/*turbopackIgnore: true*/ resolvedPath)) {
    throw new Error(`Venue Analytics data source unavailable at ${resolvedPath}.`);
  }

  let wb;
  try {
    const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ resolvedPath);
    wb = xlsx.read(fileBuffer, { type: 'buffer' });
  } catch (err) {
    console.error('[venueDataService] Failed to read Excel workbook buffer:', err);
    throw new Error(`Unable to read Venue Analytics data from ${resolvedPath}: ${err.message}`);
  }

  if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('Unable to read Venue Analytics data. Invalid Excel workbook format.');
  }

  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  if (!rows || rows.length === 0) {
    throw new Error('Workbook sheet is empty.');
  }

  // 1. Dynamic Header & Column Location
  let distCol = -1;
  let venueCol = -1;

  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const row = rows[r] || [];
    row.forEach((cell, c) => {
      if (typeof cell === 'string') {
        const val = cell.trim().toUpperCase();
        if ((val === 'DISTRICTS' || val === 'DISTRICT') && distCol === -1) distCol = c;
        if ((val === 'VENUE COUNT' || val === 'VENUES' || val === 'VENUE') && venueCol === -1 && c !== distCol) venueCol = c;
      }
    });
    if (distCol !== -1 && venueCol !== -1) break;
  }

  if (distCol === -1 || venueCol === -1) {
    distCol = 41;
    venueCol = 42;
  }

  // 2. Scan Dynamic Additional Columns in Header Row (100% Position Independent)
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

  // 3. Extract District Unique Pincodes from columns prior to distCol
  const districtPincodesMap = {};

  headerRow.forEach((cell, c) => {
    if (cell && typeof cell === 'string' && c < distCol) {
      const dName = cell.trim();
      if (dName && dName.toUpperCase() !== 'STATUS LABELS') {
        const pins = new Set();
        for (let r = 1; r < rows.length; r++) {
          const val = rows[r][c];
          if (val !== undefined && val !== null && val !== '') {
            const strVal = String(val).trim();
            if (/^\d{6}$/.test(strVal)) {
              pins.add(strVal);
            }
          }
        }
        districtPincodesMap[dName.toLowerCase()] = {
          originalName: dName,
          pincodes: Array.from(pins).sort(),
          pincodeCount: pins.size
        };
      }
    }
  });

  // 4. Extract Tamil Nadu District Venue Records & Additional Fields
  const rawDistricts = [];
  const dynamicFieldValuesMap = {};
  Object.values(dynamicColMap).forEach(colName => {
    dynamicFieldValuesMap[colName] = [];
  });

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const dCell = row[distCol];
    const vCell = row[venueCol];

    if (dCell !== undefined && dCell !== null && dCell !== '') {
      const districtName = String(dCell).trim();
      if (['DISTRICTS', 'STATE', 'UNION TERRITORIES'].includes(districtName.toUpperCase())) continue;

      let venueCount = null;
      let isApproximate = false;
      let displayVenue = "Not Available";

      if (vCell !== undefined && vCell !== null && vCell !== '') {
        const strVal = String(vCell).trim();
        if (strVal.includes('±')) {
          isApproximate = true;
          const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
          venueCount = isNaN(num) ? 0 : num;
          displayVenue = `${venueCount.toLocaleString()} ±`;
        } else {
          isApproximate = false;
          const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
          venueCount = isNaN(num) ? 0 : num;
          displayVenue = venueCount.toLocaleString();
        }
      }

      const key = districtName.toLowerCase();
      const pInfo = districtPincodesMap[key] || { pincodes: [], pincodeCount: 0 };
      const isComp = isDistrictCompleted(districtName);
      const status = isComp ? 'COMPLETED' : 'PENDING';

      // Read Dynamic Additional Fields for this District Row
      const additionalFields = {};
      Object.entries(dynamicColMap).forEach(([cIdx, colName]) => {
        const cellVal = row[cIdx];
        if (cellVal !== undefined && cellVal !== null && cellVal !== '') {
          additionalFields[colName] = cellVal;
          dynamicFieldValuesMap[colName].push(cellVal);
        }
      });

      rawDistricts.push({
        district: districtName,
        venueCount: venueCount,
        isApproximate: isApproximate,
        displayVenue: displayVenue,
        status: status,
        pincodeCount: pInfo.pincodeCount,
        pincodes: pInfo.pincodes,
        additionalFields: additionalFields
      });
    }
  }

  // Build Dynamic Columns Summary Metadata
  const dynamicColumns = Object.entries(dynamicFieldValuesMap).map(([colName, valList]) => {
    const uniqueSet = new Set(valList.map(v => String(v).trim()));
    const type = classifyFieldType(valList);
    const sampleValues = Array.from(uniqueSet).slice(0, 5);

    let numberStats = null;
    if (type === 'Number' && valList.length > 0) {
      const nums = valList.map(v => Number(String(v).replace(/[^0-9.-]/g, ''))).filter(n => !isNaN(n));
      if (nums.length > 0) {
        numberStats = {
          min: Math.min(...nums),
          max: Math.max(...nums),
          sum: nums.reduce((a, b) => a + b, 0),
          avg: Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
        };
      }
    }

    return {
      name: colName,
      type: type,
      totalCount: valList.length,
      uniqueCount: uniqueSet.size,
      sampleValues: sampleValues,
      numberStats: numberStats
    };
  });

  // Calculate ranks
  const sortedDistricts = [...rawDistricts].sort((a, b) => (b.venueCount || 0) - (a.venueCount || 0));
  sortedDistricts.forEach((d, i) => {
    d.rank = i + 1;
  });

  const districts = rawDistricts.map(d => {
    const found = sortedDistricts.find(sd => sd.district === d.district);
    return { ...d, rank: found ? found.rank : 99 };
  });

  // Dynamic Summary Indicators
  const totalDistricts = districts.length;
  const estimatedTotalVenues = districts.reduce((sum, d) => sum + (d.venueCount || 0), 0);
  const highestVenueDistrict = sortedDistricts[0] || null;
  const secondHighestVenueDistrict = sortedDistricts[1] || null;
  const lowestVenueDistrict = sortedDistricts[sortedDistricts.length - 1] || null;
  const averageVenueCount = totalDistricts > 0 ? Math.round(estimatedTotalVenues / totalDistricts) : 0;
  const exactCount = districts.filter(d => !d.isApproximate).length;
  const approximateCount = districts.filter(d => d.isApproximate).length;
  const completedCount = districts.filter(d => d.status === 'COMPLETED').length;

  // Dynamic Range Distributions
  const ranges = [
    { label: '500+ Venues', key: '500+', min: 500, max: Infinity },
    { label: '300–499 Venues', key: '300-499', min: 300, max: 499 },
    { label: '200–299 Venues', key: '200-299', min: 200, max: 299 },
    { label: '100–199 Venues', key: '100-199', min: 100, max: 199 },
    { label: 'Below 100 Venues', key: 'below100', min: 0, max: 99 }
  ];

  const distributions = ranges.map(r => {
    const matched = districts.filter(d => d.venueCount !== null && d.venueCount >= r.min && d.venueCount <= r.max);
    const count = matched.length;
    const percentage = totalDistricts > 0 ? parseFloat(((count / totalDistricts) * 100).toFixed(1)) : 0;
    return {
      label: r.label,
      rangeKey: r.key,
      count: count,
      percentage: percentage,
      districts: matched.map(m => m.district)
    };
  });

  // 5. Union Territory Data Extraction
  let utCol = -1;
  let utVenueCol = -1;

  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const row = rows[r] || [];
    row.forEach((cell, c) => {
      if (typeof cell === 'string') {
        const val = cell.trim().toUpperCase();
        if (val === 'UNION TERRITORIES' && utCol === -1) utCol = c;
      }
    });
    if (utCol !== -1) break;
  }

  if (utCol === -1) utCol = 44;
  utVenueCol = utCol + 1;

  const unionTerritories = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const utCell = row[utCol];
    const utVCell = row[utVenueCol];

    if (utCell !== undefined && utCell !== null && utCell !== '') {
      const stateName = String(utCell).trim();
      if (['UNION TERRITORIES', 'STATE', 'DISTRICTS'].includes(stateName.toUpperCase())) continue;

      let venueCount = null;
      let isApproximate = false;
      let displayVenue = "Not Available";

      if (utVCell !== undefined && utVCell !== null && utVCell !== '') {
        const strVal = String(utVCell).trim();
        if (strVal.includes('±')) {
          isApproximate = true;
          const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
          venueCount = isNaN(num) ? 0 : num;
          displayVenue = `${venueCount.toLocaleString()} ±`;
        } else {
          isApproximate = false;
          const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
          venueCount = isNaN(num) ? 0 : num;
          displayVenue = venueCount.toLocaleString();
        }
      }

      unionTerritories.push({
        state: stateName,
        venueCount: venueCount,
        isApproximate: isApproximate,
        displayVenue: displayVenue
      });
    }
  }

  const result = {
    success: true,
    timestamp: new Date().toISOString(),
    summary: {
      totalDistricts,
      estimatedTotalVenues,
      highestVenueDistrict,
      secondHighestVenueDistrict,
      lowestVenueDistrict,
      averageVenueCount,
      exactCount,
      approximateCount,
      completedCount,
      dynamicColumnsCount: dynamicColumns.length
    },
    dynamicColumns,
    districts,
    rankings: sortedDistricts,
    distributions,
    unionTerritories
  };

  cachedVenueData = result;
  lastLoadTime = Date.now();
  return result;
}

export function clearVenueCache() {
  cachedVenueData = null;
  lastLoadTime = 0;
}
