import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const accessToken = searchParams.get('accessToken') || process.env.VERCEL_ACCESS_TOKEN;
  if (!id || !accessToken) {
    return NextResponse.json({ error: 'Missing id or accessToken' }, { status: 400 });
  }
  const vercelRes = await fetch(`https://api.vercel.com/v13/deployments/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 }, // always fresh
  });
  if (!vercelRes.ok) {
    const error = await vercelRes.text();
    return NextResponse.json({ error }, { status: vercelRes.status });
  }
  const data = await vercelRes.json();
  return NextResponse.json(data);
} 