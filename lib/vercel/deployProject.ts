import { Vercel } from '@vercel/sdk';
import { createProject } from '@/lib/vercel/createProject';

export async function deployProject(vercel: Vercel, uniqueName: string) {
  // Create a new project using the utility
  const projectInfo = await createProject(vercel, uniqueName);

  // Deploy the new project
  const deployResponse = await vercel.deployments.createDeployment({
    requestBody: {
      name: uniqueName, // The project name used in the deployment URL
      project: uniqueName, // The project slug or name
      target: 'production',
      files: [
        {
          data: 'Hello, world!',
          encoding: 'utf-8',
          file: 'index.html',
        },
      ],
      // For a real deployment, you would need to provide files or gitSource, etc.
      // This is a placeholder for a minimal deployment request
    },
  });
  const deploymentInfo = { id: deployResponse.id, status: deployResponse.status };

  return { projectInfo, deploymentInfo };
} 