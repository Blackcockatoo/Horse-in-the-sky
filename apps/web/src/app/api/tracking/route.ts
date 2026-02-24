import { NextResponse } from 'next/server';
import { fetchNearbyAircraft } from '../../../server/providers/adsb.provider';

export const revalidate = 30; // 30 seconds

export async function GET() {
  try {
    const tracking = await fetchNearbyAircraft();
    return NextResponse.json(tracking);
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.json({ error: 'Tracking fetch failed' }, { status: 502 });
  }
}
