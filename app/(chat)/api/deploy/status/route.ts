import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from '@vercel/sdk';
import getDeployment from '@/lib/vercel/getDeployment';
import getDeploymentEvents from '@/lib/vercel/getDeploymentEvents';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const accessToken = searchParams.get('accessToken') || process.env.VERCEL_ACCESS_TOKEN;
  if (!id || !accessToken) {
    return NextResponse.json({ error: 'Missing id or accessToken' }, { status: 400 });
  }

  const vercel = new Vercel({ bearerToken: accessToken });

  // Fetch deployment info using utility
  let deploymentInfo;
  try {
    deploymentInfo = await getDeployment(vercel, id);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch deployment info' }, { status: 500 });
  }

  // Fetch build logs/events using utility
  let logs: any[] = [];
  try {
    const sdkLogs = await getDeploymentEvents(vercel, id);
    if (Array.isArray(sdkLogs)) {
      logs = sdkLogs;
    } else if (sdkLogs) {
      logs = [sdkLogs];
    }
  } catch (e: any) {
    logs = [];
  }

  return NextResponse.json({
    ...deploymentInfo,
    logs,
  });
} 