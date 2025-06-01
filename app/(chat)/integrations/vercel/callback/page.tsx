import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const id = generateUUID();
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code;

  // If no code, show error
  if (!code || typeof code !== 'string') {
    return <div>Missing code parameter in callback URL.</div>;
  }

  let accessToken: string | null = null;
  let error: string | null = null;

  try {
    const res = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.VERCEL_CLIENT_ID!,
        client_secret: process.env.VERCEL_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/integrations/vercel/oauth2/callback`,
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      error = `Failed to exchange code: ${res.statusText}`;
    } else {
      const data = await res.json();
      accessToken = data.access_token;
      if (!accessToken) {
        error = 'No access_token returned from Vercel.';
      }
    }
  } catch (e: any) {
    error = e?.message || 'Unknown error during token exchange.';
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // You can store the accessToken in a cookie, session, or pass to a component as needed
  return (
    <div>
      <h2>Vercel OAuth Success</h2>
      <p>Access Token: {accessToken}</p>
      {/* You can now use the access token or continue your app flow */}
    </div>
  );
}
