import { Vercel } from '@vercel/sdk';
 
export default async function getDeploymentEvents(vercel: Vercel, idOrUrl: string) {
  return vercel.deployments.getDeploymentEvents({ idOrUrl });
} 