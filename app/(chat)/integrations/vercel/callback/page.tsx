import { Vercel } from '@vercel/sdk';

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams?.code;

  // If no code, show error
  if (!code || typeof code !== 'string') {
    return <div>Missing code parameter in callback URL.</div>;
  }

  let accessToken: string | null = null;
  let error: string | null = null;
  let projectInfo: { id: string; name: string } | null = null;

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
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/integrations/vercel/callback`,
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
      } else {
        // Initialize the Vercel SDK
        const vercel = new Vercel({ bearerToken: accessToken });
        // Create a new project
        const createResponse = await vercel.projects.createProject({
          requestBody: {
            name: 'new-wav0-project',
            framework: 'nextjs',
          },
        });
        projectInfo = { id: createResponse.id, name: createResponse.name };
      }
    }
  } catch (e: any) {
    error = e?.message || 'Unknown error during token exchange or project creation.';
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Vercel OAuth Success</h2>
      <p>Access Token: {accessToken}</p>
      {projectInfo && (
        <div>
          <h3>New Project Created</h3>
          <p>Project Name: {projectInfo.name}</p>
          <p>Project ID: {projectInfo.id}</p>
        </div>
      )}
    </div>
  );
}
