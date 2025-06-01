import { Vercel } from '@vercel/sdk';

export async function createProject(vercel: Vercel, uniqueName: string) {
  const createResponse = await vercel.projects.createProject({
    requestBody: {
      name: uniqueName,
      framework: 'nextjs',
    },
  });
  return { id: createResponse.id, name: createResponse.name };
} 