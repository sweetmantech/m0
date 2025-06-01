import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from '@vercel/sdk';
import { getUniqueProjectName } from '@/lib/vercel/getUniqueProjectName';
import { deployProject } from '@/lib/vercel/deployProject';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, files } = await req.json();
    console.log('SWEETS LOGS /api/deploy files', files);
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }
    const vercel = new Vercel({ bearerToken: accessToken });
    const uniqueName = getUniqueProjectName();
    const result = await deployProject(vercel, uniqueName, files);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error during project creation or deployment.' }, { status: 500 });
  }
} 