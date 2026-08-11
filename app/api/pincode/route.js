import { NextResponse } from 'next/server';
import {
  getAvailableStates,
  getAvailableDistricts,
  getDistrictPincodes,
  lookupByPincode,
  getDatasetInfo,
  searchDataset
} from '@/lib/dataService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'dataset_info') {
      const info = getDatasetInfo();
      return NextResponse.json({ success: true, ...info });
    }

    if (action === 'states') {
      const states = getAvailableStates();
      return NextResponse.json({ success: true, count: states.length, states });
    }

    if (action === 'districts') {
      const state = searchParams.get('state');
      const districts = getAvailableDistricts(state);
      return NextResponse.json({ success: true, count: districts.length, districts });
    }

    if (action === 'pincodes') {
      const district = searchParams.get('district');
      const state = searchParams.get('state');
      const result = getDistrictPincodes(district, state);
      return NextResponse.json(result);
    }

    if (action === 'lookup') {
      const pincode = searchParams.get('pincode');
      const result = lookupByPincode(pincode);
      return NextResponse.json(result);
    }

    if (action === 'search') {
      const query = searchParams.get('query') || '';
      const state = searchParams.get('state') || '';
      const district = searchParams.get('district') || '';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

      const result = searchDataset({ search: query, state, district, page, pageSize });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Supported: dataset_info, states, districts, pincodes, lookup, search'
    }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
