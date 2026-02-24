import { NextResponse } from 'next/server';
import { fetchAviationData } from '../../../server/providers/airservices.provider';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const aviation = await fetchAviationData('YTYA');
    return NextResponse.json(aviation);
  } catch (err) {
    console.error('Aviation API error:', err);
    return NextResponse.json({ error: 'Aviation fetch failed' }, { status: 502 });
  }
}
