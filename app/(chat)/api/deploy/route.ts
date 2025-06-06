import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from '@vercel/sdk';
import { getUniqueProjectName } from '@/lib/vercel/getUniqueProjectName';
import { deployProject } from '@/lib/vercel/deployProject';
import { DEFAULT_PREVIEW_PROJECT_NAME } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, files } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
    }
    const vercel = new Vercel({ bearerToken: accessToken });
    const isDefaultAccessToken = accessToken === process.env.NEXT_PUBLIC_DEFAULT_ACCESS_TOKEN;
    const projectName = isDefaultAccessToken ? DEFAULT_PREVIEW_PROJECT_NAME : getUniqueProjectName();
    const result = await deployProject(vercel, projectName, files);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error during project creation or deployment.' }, { status: 500 });
  }
} 