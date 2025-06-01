import { Vercel } from '@vercel/sdk';
import { createProject } from '@/lib/vercel/createProject';
import { getDeploymentFiles } from '@/lib/vercel/getDeploymentFiles';

export async function deployProject(vercel: Vercel, uniqueName: string, files?: Array<{ file: string; data: string; encoding: string }>) {
  // Create a new project using the utility
  const projectInfo = await createProject(vercel, uniqueName);

  // Always use getDeploymentFiles to backfill required files
  const deploymentFiles = getDeploymentFiles(uniqueName, files);
  console.log('SWEETS LOGS /lib/vercel/deployProject deploymentFiles', deploymentFiles);
  
  // Deploy the new project
  const deployResponse = await vercel.deployments.createDeployment({
    requestBody: {
      name: uniqueName,
      project: uniqueName,
      target: 'production',
      files: deploymentFiles,
    },
  });
  const deploymentInfo = { id: deployResponse.id, status: deployResponse.status };

  return { projectInfo, deploymentInfo };
} 