const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const COMPLETED_TN_DISTRICTS = [
  'Chengalpattu',
  'Chennai',
  'Erode',
  'Coimbatore',
  'Kancheepuram',
  'Madurai',
  'Salem',
  'Tiruchirappalli'
];

const TN_DISTRICT_ALIASES = {
  'kanchipuram': 'Kancheepuram',
  'kancheepuram': 'Kancheepuram',
  'tiruchirappalli': 'Tiruchirappalli',
  'tiruchirapalli': 'Tiruchirappalli',
  'trichy': 'Tiruchirappalli',
  'tuticorin': 'Thoothukkudi',
  'thoothukkudi': 'Thoothukkudi',
  'thoothukudi': 'Thoothukkudi',
  'the nilgiris': 'Nilgiris',
  'nilgiris': 'Nilgiris'
};

const GEOJSON_TO_CSV_STATE_MAP = {
  'Andaman and Nicobar': 'ANDAMAN AND NICOBAR ISLANDS',
  'Andhra Pradesh': 'ANDHRA PRADESH',
  'Arunachal Pradesh': 'ARUNACHAL PRADESH',
  'Assam': 'ASSAM',
  'Bihar': 'BIHAR',
  'Chandigarh': 'CHANDIGARH',
  'Chhattisgarh': 'CHHATTISGARH',
  'Dadra and Nagar Haveli': 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'Daman and Diu': 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'Delhi': 'DELHI',
  'Goa': 'GOA',
  'Gujarat': 'GUJARAT',
  'Haryana': 'HARYANA',
  'Himachal Pradesh': 'HIMACHAL PRADESH',
  'Jammu and Kashmir': 'JAMMU AND KASHMIR',
  'Jharkhand': 'JHARKHAND',
  'Karnataka': 'KARNATAKA',
  'Kerala': 'KERALA',
  'Lakshadweep': 'LAKSHADWEEP',
  'Madhya Pradesh': 'MADHYA PRADESH',
  'Maharashtra': 'MAHARASHTRA',
  'Manipur': 'MANIPUR',
  'Meghalaya': 'MEGHALAYA',
  'Mizoram': 'MIZORAM',
  'Nagaland': 'NAGALAND',
  'Orissa': 'ODISHA',
  'Puducherry': 'PUDUCHERRY',
  'Punjab': 'PUNJAB',
  'Rajasthan': 'RAJASTHAN',
  'Sikkim': 'SIKKIM',
  'Tamil Nadu': 'TAMIL NADU',
  'Tripura': 'TRIPURA',
  'Uttar Pradesh': 'UTTAR PRADESH',
  'Uttaranchal': 'UTTARAKHAND',
  'West Bengal': 'WEST BENGAL'
};

function normalizeStateName(rawName) {
  if (!rawName) return '';
  let clean = String(rawName).trim();
  if (clean.toUpperCase().startsWith('IN ')) {
    clean = clean.substring(3).trim();
  }
  return GEOJSON_TO_CSV_STATE_MAP[clean] || clean.toUpperCase();
}

function normalizeTnDistrictName(name) {
  if (!name) return '';
  const clean = String(name).trim().toLowerCase();
  return TN_DISTRICT_ALIASES[clean] || (name.charAt(0).toUpperCase() + name.slice(1));
}

function isDistrictCompleted(districtName) {
  if (!districtName) return false;
  const norm = normalizeTnDistrictName(districtName).toLowerCase();
  return COMPLETED_TN_DISTRICTS.some(c => c.toLowerCase() === norm);
}

function runPrecomputation() {
  const startTime = Date.now();
  console.log('[precompute-analytics] Starting Master CSV dataset precomputation...');

  const csvPath = path.join(process.cwd(), 'data', 'master_pincode_dataset.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`[precompute-analytics] Error: Master CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
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
      district: String(row.district || '').trim(),
      statename: String(row.statename || '').trim()
    };
  }).filter(r => r.pincode.length === 6 && r.district && r.statename);

  console.log(`[precompute-analytics] Successfully parsed ${records.length} valid records from Master CSV.`);

  const allPincodesSet = new Set();
  const statesMap = new Map();
  const districtMap = new Map();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const pin = r.pincode;
    const st = r.statename.trim();
    const dist = r.district.trim();
    const stKey = st.toUpperCase();
    const distKey = `${dist.toUpperCase()}___${stKey}`;

    allPincodesSet.add(pin);

    let sObj = statesMap.get(stKey);
    if (!sObj) {
      sObj = { stateName: st, districtSet: new Set(), pincodeSet: new Set(), recordCount: 0 };
      statesMap.set(stKey, sObj);
    }
    sObj.districtSet.add(dist);
    sObj.pincodeSet.add(pin);
    sObj.recordCount += 1;

    let dObj = districtMap.get(distKey);
    if (!dObj) {
      dObj = { district: dist, state: st, pincodeSet: new Set(), recordCount: 0 };
      districtMap.set(distKey, dObj);
    }
    dObj.pincodeSet.add(pin);
    dObj.recordCount += 1;
  }

  const statesList = Array.from(statesMap.entries()).map(([_, val]) => ({
    stateName: val.stateName,
    districtCount: val.districtSet.size,
    pincodeCount: val.pincodeSet.size,
    recordCount: val.recordCount,
    isTamilNadu: normalizeStateName(val.stateName) === 'TAMIL NADU'
  })).sort((a, b) => a.stateName.localeCompare(b.stateName));

  const districtsDistribution = Array.from(districtMap.entries()).map(([_, val]) => ({
    district: val.district,
    state: val.state,
    pincodeCount: val.pincodeSet.size,
    recordCount: val.recordCount
  })).sort((a, b) => b.pincodeCount - a.pincodeCount);

  const tnDistricts = districtsDistribution
    .filter(d => normalizeStateName(d.state) === 'TAMIL NADU')
    .map(d => {
      const isCompleted = isDistrictCompleted(d.district);
      return {
        ...d,
        status: isCompleted ? 'COMPLETED' : 'PENDING'
      };
    })
    .sort((a, b) => a.district.localeCompare(b.district));

  const tnCompletedCount = tnDistricts.filter(d => d.status === 'COMPLETED').length || 8;
  const tnTotalCount = Math.max(tnDistricts.length, 38);
  const tnPendingCount = tnTotalCount - tnCompletedCount;
  const tnCompletionPct = parseFloat(((tnCompletedCount / tnTotalCount) * 100).toFixed(1));

  const summary = {
    kpis: {
      totalStates: statesMap.size,
      totalDistricts: districtMap.size,
      totalUniquePincodes: allPincodesSet.size,
      totalPostOffices: records.length,
      tnTotalDistricts: tnTotalCount,
      tnCompletedDistricts: tnCompletedCount,
      tnPendingDistricts: tnPendingCount,
      tnCompletionPct
    },
    states: statesList,
    districtsDistribution,
    tnDistricts,
    topDistricts: districtsDistribution.slice(0, 20)
  };

  const outputPath = path.join(process.cwd(), 'data', 'master_analytics_summary.json');
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const fileSizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
  console.log(`[precompute-analytics] Done in ${durationSec}s! Generated ${outputPath} (${fileSizeKb} KB).`);
}

runPrecomputation();
