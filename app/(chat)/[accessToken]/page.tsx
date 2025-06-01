import { Vercel } from '@vercel/sdk';
import { getUniqueProjectName } from '@/lib/vercel/getUniqueProjectName';
import { deployProject } from '@/lib/vercel/deployProject';

export default async function AccessTokenPage({ params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  let projectInfo: { id: string; name: string } | null = null;
  let deploymentInfo: { id: string; status: string } | null = null;
  let error: string | null = null;

  try {
    // Initialize the Vercel SDK
    const vercel = new Vercel({ bearerToken: accessToken });
    // Create and deploy the project using the utility
    const uniqueName = getUniqueProjectName();
    const result = await deployProject(vercel, uniqueName);
    projectInfo = result.projectInfo;
    deploymentInfo = result.deploymentInfo;
  } catch (e: any) {
    error = e?.message || 'Unknown error during project creation or deployment.';
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
      {deploymentInfo && (
        <>
          <h3>Deployment Triggered</h3>
          <p>Deployment ID: {deploymentInfo.id}</p>
          <p>Status: {deploymentInfo.status}</p>
        </>
      )}
    </div>
  );
} 