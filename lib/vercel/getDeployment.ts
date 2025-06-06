import { Vercel } from '@vercel/sdk';
 
export default async function getDeployment(vercel: Vercel, idOrUrl: string) {
  return vercel.deployments.getDeployment({ idOrUrl });
} 