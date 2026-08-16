import { NextResponse } from 'next/server';
import { getVenueAnalyticsSummary, clearVenueCache } from '@/lib/venueDataService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('refresh') === 'true') {
      clearVenueCache();
    }

    const data = getVenueAnalyticsSummary();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/venue-analytics route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Venue Analytics data source unavailable. Please verify the configured Excel file.'
      },
      { status: 200 } // Return 200 with success: false for graceful UI rendering
    );
  }
}
