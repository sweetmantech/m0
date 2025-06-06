import { Vercel } from '@vercel/sdk';
import { createProject } from '@/lib/vercel/createProject';
import { getDeploymentFiles } from '@/lib/vercel/getDeploymentFiles';
import { DEFAULT_PREVIEW_PROJECT_NAME } from '@/lib/constants';

// Utility to extract packages from install commands in LLM message content
function extractPackagesFromInstallCommands(messages: Array<{ content?: string }>): string[] {
  const installRegex = /(?:npm install|yarn add|pnpm add|bun add)\s+([@\w\-./]+(?:\s+[@\w\-./]+)*)/g;
  const pkgs = new Set<string>();
  for (const msg of messages) {
    if (!msg.content) continue;
    let match;
    while ((match = installRegex.exec(msg.content))) {
      const parts = match[1].split(/\s+/);
      for (const pkg of parts) {
        // Ignore flags (e.g., --dev)
        if (!pkg.startsWith('-')) {
          // For scoped packages, only take the first two segments
          const segs = pkg.split('/');
          const dep = pkg.startsWith('@') ? segs.slice(0, 2).join('/') : segs[0];
          pkgs.add(dep);
        }
      }
    }
  }
  return Array.from(pkgs);
}

export async function deployProject(
  vercel: Vercel,
  uniqueName: string,
  files?: Array<{ file: string; data: string; encoding: string }>,
  messages?: Array<{ content?: string }>
) {
  // Only create a new project if not using the default preview project name
  const isDefaultProject = uniqueName === DEFAULT_PREVIEW_PROJECT_NAME;
  const projectInfo = isDefaultProject ? { id: null, name: uniqueName } : await createProject(vercel, uniqueName);

  // Parse install commands from messages (if provided)
  const requiredPackages = messages ? extractPackagesFromInstallCommands(messages) : [];

  // Always use getDeploymentFiles to backfill required files
  const deploymentFiles = getDeploymentFiles(uniqueName, files, requiredPackages);

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