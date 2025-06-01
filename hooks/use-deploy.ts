'use client';

import { toast } from '@/components/toast';
import { Message } from 'ai';
import { useState } from 'react';

export interface DeployContextValue {
  deploy: (message: Message) => Promise<any>;
  result: any;
  error: string | null;
  isLoading: boolean;
}

export function useDeploy(accessToken?: string | null) {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function deploy(message: Message) {
    console.log('useDeploy - deploying', message);
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ type: 'success', description: `Deployed: ${data.deploymentInfo?.id || 'Success'}` });
        setResult(data);
      } else {
        toast({ type: 'error', description: data.error || 'Deployment failed' });
        setError(data.error || 'Deployment failed');
      }
      return data;
    } catch (e: any) {
      toast({ type: 'error', description: e?.message || 'Deployment error' });
      setError(e?.message || 'Deployment error');
      return { error: e?.message || 'Deployment error' };
    } finally {
      setIsLoading(false);
    }
  }
  return { deploy, result, error, isLoading };
} 