const GEOJSON_TO_CSV_STATE_MAP = {
  "Andaman and Nicobar": "ANDAMAN AND NICOBAR ISLANDS",
  "Andhra Pradesh": "ANDHRA PRADESH",
  "Arunachal Pradesh": "ARUNACHAL PRADESH",
  "Assam": "ASSAM",
  "Bihar": "BIHAR",
  "Chandigarh": "CHANDIGARH",
  "Chhattisgarh": "CHHATTISGARH",
  "Dadra and Nagar Haveli": "THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
  "Daman and Diu": "THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
  "Delhi": "DELHI",
  "Goa": "GOA",
  "Gujarat": "GUJARAT",
  "Haryana": "HARYANA",
  "Himachal Pradesh": "HIMACHAL PRADESH",
  "Jammu and Kashmir": "JAMMU AND KASHMIR",
  "Jharkhand": "JHARKHAND",
  "Karnataka": "KARNATAKA",
  "Kerala": "KERALA",
  "Lakshadweep": "LAKSHADWEEP",
  "Madhya Pradesh": "MADHYA PRADESH",
  "Maharashtra": "MAHARASHTRA",
  "Manipur": "MANIPUR",
  "Meghalaya": "MEGHALAYA",
  "Mizoram": "MIZORAM",
  "Nagaland": "NAGALAND",
  "Orissa": "ODISHA",
  "Puducherry": "PUDUCHERRY",
  "Punjab": "PUNJAB",
  "Rajasthan": "RAJASTHAN",
  "Sikkim": "SIKKIM",
  "Tamil Nadu": "TAMIL NADU",
  "Tripura": "TRIPURA",
  "Uttar Pradesh": "UTTAR PRADESH",
  "Uttaranchal": "UTTARAKHAND",
  "West Bengal": "WEST BENGAL"
};

export const COMPLETED_TN_DISTRICTS = [
  "Chengalpattu",
  "Chennai",
  "Erode",
  "Coimbatore",
  "Kancheepuram",
  "Madurai",
  "Salem",
  "Tiruchirappalli"
];

const TN_DISTRICT_ALIASES = {
  "kanchipuram": "Kancheepuram",
  "kancheepuram": "Kancheepuram",
  "tiruchirappalli": "Tiruchirappalli",
  "tiruchirapalli": "Tiruchirappalli",
  "trichy": "Tiruchirappalli",
  "tuticorin": "Thoothukkudi",
  "thoothukkudi": "Thoothukkudi",
  "thoothukudi": "Thoothukkudi",
  "the nilgiris": "Nilgiris",
  "nilgiris": "Nilgiris"
};

export function normalizeStateName(rawName) {
  if (!rawName) return '';
  let clean = String(rawName).trim();
  if (clean.toUpperCase().startsWith('IN ')) {
    clean = clean.substring(3).trim();
  }
  return GEOJSON_TO_CSV_STATE_MAP[clean] || clean.toUpperCase();
}

export function formatDisplayStateName(stateName) {
  if (!stateName || stateName === 'Select a state from the map') {
    return 'Select a state from the map';
  }
  let clean = String(stateName).trim();
  if (clean.toUpperCase().startsWith('IN ')) {
    clean = clean.substring(3).trim();
  }
  
  const words = clean.split(/\s+/);
  const formatted = words.map(w => {
    const u = w.toUpperCase();
    if (['AND', 'OF', 'THE'].includes(u)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  const res = formatted.join(' ');
  return res ? res.charAt(0).toUpperCase() + res.slice(1) : '';
}

export function normalizeTnDistrictName(name) {
  if (!name) return "";
  const clean = String(name).trim().toLowerCase();
  return TN_DISTRICT_ALIASES[clean] || (name.charAt(0).toUpperCase() + name.slice(1));
}

export function isDistrictCompleted(districtName) {
  if (!districtName) return false;
  const norm = normalizeTnDistrictName(districtName).toLowerCase();
  return COMPLETED_TN_DISTRICTS.some(c => c.toLowerCase() === norm);
}
