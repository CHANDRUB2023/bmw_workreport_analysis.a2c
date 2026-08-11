import { loadMasterDataset, normalizeStateName } from './dataService';
import { COMPLETED_TN_DISTRICTS, isDistrictCompleted } from './formatUtils';

let _cachedAnalytics = null;

export function getAnalyticsDatasetSummary() {
  if (_cachedAnalytics) {
    return _cachedAnalytics;
  }

  const records = loadMasterDataset();
  if (!records || records.length === 0) {
    return {
      kpis: {
        totalStates: 0,
        totalDistricts: 0,
        totalUniquePincodes: 0,
        totalPostOffices: 0,
        tnTotalDistricts: 38,
        tnCompletedDistricts: 8,
        tnPendingDistricts: 30,
        tnCompletionPct: 21.1
      },
      states: [],
      districtsDistribution: [],
      tnDistricts: [],
      topDistricts: []
    };
  }

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

    // Update state stats
    let sObj = statesMap.get(stKey);
    if (!sObj) {
      sObj = { stateName: st, districtSet: new Set(), pincodeSet: new Set(), recordCount: 0 };
      statesMap.set(stKey, sObj);
    }
    sObj.districtSet.add(dist);
    sObj.pincodeSet.add(pin);
    sObj.recordCount += 1;

    // Update district stats
    let dObj = districtMap.get(distKey);
    if (!dObj) {
      dObj = { district: dist, state: st, pincodeSet: new Set(), recordCount: 0 };
      districtMap.set(distKey, dObj);
    }
    dObj.pincodeSet.add(pin);
    dObj.recordCount += 1;
  }

  // Format States list
  const statesList = Array.from(statesMap.entries()).map(([_, val]) => ({
    stateName: val.stateName,
    districtCount: val.districtSet.size,
    pincodeCount: val.pincodeSet.size,
    recordCount: val.recordCount,
    isTamilNadu: normalizeStateName(val.stateName) === 'TAMIL NADU'
  })).sort((a, b) => a.stateName.localeCompare(b.stateName));

  // Format District Distribution list
  const districtsDistribution = Array.from(districtMap.entries()).map(([_, val]) => ({
    district: val.district,
    state: val.state,
    pincodeCount: val.pincodeSet.size,
    recordCount: val.recordCount
  })).sort((a, b) => b.pincodeCount - a.pincodeCount);

  // Tamil Nadu specific district list
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

  _cachedAnalytics = summary;
  return _cachedAnalytics;
}
