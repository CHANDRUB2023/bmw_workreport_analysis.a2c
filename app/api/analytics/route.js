import { NextResponse } from 'next/server';
import { getAnalyticsDatasetSummary } from '@/lib/analyticsDataService';
import { VERIFIED_METRO_SYSTEMS } from '@/lib/productivityService';

export async function GET() {
  try {
    const summary = getAnalyticsDatasetSummary();
    const totalMetroStations = VERIFIED_METRO_SYSTEMS.reduce((acc, m) => acc + m.totalStations, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...summary,
      metro: {
        totalCities: VERIFIED_METRO_SYSTEMS.length,
        totalStations: totalMetroStations,
        systems: VERIFIED_METRO_SYSTEMS
      }
    });
  } catch (error) {
    console.error('Error in Analytics API route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to compute analytics summary'
    }, { status: 500 });
  }
}
