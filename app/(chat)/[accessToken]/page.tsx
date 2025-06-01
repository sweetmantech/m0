import { Vercel } from '@vercel/sdk';

export default async function AccessTokenPage({ params }: { params: { accessToken: string } }) {
  let projectInfo: { id: string; name: string } | null = null;
  let error: string | null = null;

  try {
    // Initialize the Vercel SDK
    const vercel = new Vercel({ bearerToken: params.accessToken });
    // Create a new project
    const createResponse = await vercel.projects.createProject({
      requestBody: {
        name: 'new-wav0-project',
        framework: 'nextjs',
      },
    });
    projectInfo = { id: createResponse.id, name: createResponse.name };
  } catch (e: any) {
    error = e?.message || 'Unknown error during project creation.';
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>New Project Created</h2>
      {projectInfo && (
        <>
          <p>Project Name: {projectInfo.name}</p>
          <p>Project ID: {projectInfo.id}</p>
        </>
      )}
    </div>
  );
} 