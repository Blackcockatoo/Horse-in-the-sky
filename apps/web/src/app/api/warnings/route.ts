import { NextResponse } from 'next/server';
import { fetchWarnings } from '../../../server/providers/bom.provider';

export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const warnings = await fetchWarnings();
    return NextResponse.json(warnings);
  } catch (err) {
    console.error('Warnings API error:', err);
    return NextResponse.json({ error: 'Warnings fetch failed' }, { status: 502 });
  }
}
