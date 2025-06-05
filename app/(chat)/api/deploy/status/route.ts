import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from '@vercel/sdk';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const accessToken = searchParams.get('accessToken') || process.env.VERCEL_ACCESS_TOKEN;
  if (!id || !accessToken) {
    return NextResponse.json({ error: 'Missing id or accessToken' }, { status: 400 });
  }

  const vercel = new Vercel({ bearerToken: accessToken });

  // Fetch deployment info using SDK
  let deploymentInfo;
  try {
    deploymentInfo = await vercel.deployments.getDeployment({ idOrUrl: id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch deployment info' }, { status: 500 });
  }

  // Fetch build logs/events using SDK
  let logs: any[] = [];
  try {
    const sdkLogs = await vercel.deployments.getDeploymentEvents({ idOrUrl: id });
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