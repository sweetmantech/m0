import { Vercel } from '@vercel/sdk';
import { createProject } from '@/lib/vercel/createProject';
import { getDeploymentFiles } from '@/lib/vercel/getDeploymentFiles';

export async function deployProject(vercel: Vercel, uniqueName: string) {
  // Create a new project using the utility
  const projectInfo = await createProject(vercel, uniqueName);

  // Get hard-coded minimal Next.js files
  const files = getDeploymentFiles(uniqueName);

  // Deploy the new project
  const deployResponse = await vercel.deployments.createDeployment({
    requestBody: {
      name: uniqueName,
      project: uniqueName,
      target: 'production',
      files,
    },
  });
  const deploymentInfo = { id: deployResponse.id, status: deployResponse.status };

  return { projectInfo, deploymentInfo };
} 