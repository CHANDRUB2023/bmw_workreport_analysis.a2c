import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { normalizeStateName, formatDisplayStateName } from './formatUtils.js';

export { normalizeStateName, formatDisplayStateName };

let _cachedRecords = null;
let _cachedStates = null;
let _cachedStateDistrictMap = {};

export function getProjectDatasetPath() {
  const primaryFile = path.join(process.cwd(), 'data', 'master_pincode_dataset.csv');
  if (fs.existsSync(primaryFile)) {
    return primaryFile;
  }
  // Fallback check if running from nested directory
  const parentFile = path.join(process.cwd(), '..', 'data', 'master_pincode_dataset.csv');
  if (fs.existsSync(parentFile)) {
    return parentFile;
  }
  return primaryFile;
}

export function getDatasetInfo() {
  const datasetPath = getProjectDatasetPath();
  const exists = fs.existsSync(datasetPath);
  let sizeMb = '0 MB';

  if (exists) {
    try {
      const stats = fs.statSync(datasetPath);
      sizeMb = `${(stats.size / (1024 * 1024)).toFixed(1)} MB`;
    } catch (err) {}
  }

  return {
    ready: exists,
    filename: 'master_pincode_dataset.csv',
    path: datasetPath,
    size: sizeMb
  };
}

export function loadMasterDataset() {
  if (_cachedRecords) {
    return _cachedRecords;
  }

  try {
    const datasetPath = getProjectDatasetPath();
    if (!fs.existsSync(datasetPath)) {
      console.error(`Master dataset CSV file not found at: ${datasetPath}`);
      return [];
    }

    const csvContent = fs.readFileSync(datasetPath, 'utf-8');
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });

    const records = (parsed.data || []).map(row => {
      let rawPin = String(row.pincode || '').trim().replace(/\D/g, '');
      if (rawPin.length > 0 && rawPin.length < 6) {
        rawPin = rawPin.padStart(6, '0');
      }

      return {
        officename: String(row.officename || '').trim(),
        pincode: rawPin,
        officetype: String(row.officetype || '').trim(),
        delivery: String(row.delivery || '').trim(),
        divisionname: String(row.divisionname || '').trim(),
        regionname: String(row.regionname || '').trim(),
        circlename: String(row.circlename || '').trim(),
        district: String(row.district || '').trim(),
        statename: String(row.statename || '').trim(),
        latitude: parseFloat(row.latitude) || null,
        longitude: parseFloat(row.longitude) || null
      };
    }).filter(r => r.pincode.length === 6 && r.district && r.statename);

    _cachedRecords = records;
    console.log(`Successfully loaded ${records.length} records from dataset CSV.`);
    return _cachedRecords;
  } catch (error) {
    console.error('Error reading dataset CSV:', error);
    return [];
  }
}

export function getAvailableStates() {
  if (_cachedStates) return _cachedStates;
  const records = loadMasterDataset();
  const statesSet = new Set();
  records.forEach(r => {
    if (r.statename) statesSet.add(r.statename.toUpperCase());
  });
  _cachedStates = Array.from(statesSet).sort();
  return _cachedStates;
}

export function getAvailableDistricts(stateName = null) {
  const records = loadMasterDataset();
  if (!stateName) {
    const districts = new Set(records.map(r => r.district.toUpperCase()));
    return Array.from(districts).sort();
  }

  const normState = normalizeStateName(stateName);
  if (_cachedStateDistrictMap[normState]) {
    return _cachedStateDistrictMap[normState];
  }

  const distSet = new Set();
  records.forEach(r => {
    if (r.statename.toUpperCase() === normState) {
      distSet.add(r.district);
    }
  });

  const sortedDistricts = Array.from(distSet).sort((a, b) => a.localeCompare(b));
  _cachedStateDistrictMap[normState] = sortedDistricts;
  return sortedDistricts;
}

export function getDistrictPincodes(districtName, stateName = null) {
  const records = loadMasterDataset();
  if (!districtName) return { found: false, error: 'District name required' };

  const normDist = String(districtName).trim().toUpperCase();
  const normState = stateName ? normalizeStateName(stateName) : null;

  const matched = records.filter(r => {
    const matchDist = r.district.toUpperCase() === normDist;
    if (normState) {
      return matchDist && (r.statename.toUpperCase() === normState);
    }
    return matchDist;
  });

  if (matched.length === 0) {
    return { found: false, error: `No records found for district: ${districtName}` };
  }

  const actualState = matched[0].statename;
  const actualDistrict = matched[0].district;
  const uniquePins = Array.from(new Set(matched.map(r => r.pincode))).sort();

  return {
    found: true,
    state: actualState,
    district: actualDistrict,
    total_records: matched.length,
    unique_pincodes_count: uniquePins.length,
    pincodes: uniquePins,
    records: matched.slice(0, 200)
  };
}

export function lookupByPincode(pincode) {
  const records = loadMasterDataset();
  const cleanPin = String(pincode || '').trim().padStart(6, '0');
  const matched = records.filter(r => r.pincode === cleanPin);

  if (matched.length === 0) {
    return { found: false, error: `Pincode ${cleanPin} not found.` };
  }

  return {
    found: true,
    pincode: cleanPin,
    state: matched[0].statename,
    district: matched[0].district,
    total_offices: matched.length,
    offices: matched
  };
}

export function searchDataset({ search = '', state = '', district = '', page = 1, pageSize = 50 }) {
  const records = loadMasterDataset();
  const cleanSearch = String(search).trim().toLowerCase();
  const normState = state ? normalizeStateName(state) : '';
  const normDist = district ? String(district).trim().toUpperCase() : '';

  let filtered = records;

  if (normState) {
    filtered = filtered.filter(r => r.statename.toUpperCase() === normState);
  }

  if (normDist) {
    filtered = filtered.filter(r => r.district.toUpperCase() === normDist);
  }

  if (cleanSearch) {
    filtered = filtered.filter(r =>
      r.pincode.includes(cleanSearch) ||
      r.officename.toLowerCase().includes(cleanSearch) ||
      r.district.toLowerCase().includes(cleanSearch) ||
      r.statename.toLowerCase().includes(cleanSearch) ||
      r.divisionname.toLowerCase().includes(cleanSearch)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    total,
    page: currentPage,
    pageSize,
    totalPages,
    records: paginated
  };
}
