'use client';

import { toast } from '@/components/toast';
import { Message } from 'ai';
import { useState, useEffect } from 'react';
import { parseFilesFromMessageContent } from '@/lib/vercel/parseFilesFromMessageContent';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileDescriptor } from '@/lib/types';

export interface DeployContextValue {
  deploy: (message: Message) => Promise<any>;
  result: any;
  error: string | null;
  isLoading: boolean;
  showOverlay: boolean;
  closeOverlay: () => void;
  files: FileDescriptor[] | null;
}

export function useDeploy(accessToken?: string | null): DeployContextValue {
  const [showOverlay, setShowOverlay] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [files, setFiles] = useState<FileDescriptor[] | null>(null);

  // Mutation to trigger deployment
  const deployMutation = useMutation({
    mutationFn: async (message: Message) => {
      if (!accessToken) throw new Error('No access token');
      const files = parseFilesFromMessageContent(message.content);
      const body: any = { accessToken };
      if (files.length > 0) body.files = files;
      setFiles(files);
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deployment failed');
      setProjectInfo(data.projectInfo);
      setDeploymentId(data.deploymentInfo?.id);
      return data;
    },
    onSuccess: () => setShowOverlay(true),
    onError: () => setShowOverlay(true),
  });

  // Query to poll deployment status
  const {
    data: deploymentStatus,
    isLoading: isPolling,
    error: pollingError,
  } = useQuery<any>({
    queryKey: ['vercel-deployment', deploymentId, accessToken],
    queryFn: async () => {
      if (!deploymentId || !accessToken) return null;
      const res = await fetch(`/api/deploy/status?id=${deploymentId}&accessToken=${accessToken}`);
      if (!res.ok) throw new Error('Failed to fetch deployment status');
      return res.json();
    },
    enabled: !!deploymentId && !!accessToken,
    refetchInterval: (data: any) => {
      // Stop polling if deployment is ready or errored
      if (!data) return 2000;
      if (data?.readyState === 'READY' || data?.readyState === 'ERROR' || data?.readyState === 'CANCELED') return false;
      return 2000;
    },
  });

  function deploy(message: Message) {
    setShowOverlay(false);
    setDeploymentId(null);
    setProjectInfo(null);
    setFiles(null);
    return deployMutation.mutateAsync(message);
  }

  function closeOverlay() {
    setShowOverlay(false);
  }

  // Compose result for overlay
  const result = deploymentId
    ? {
        projectInfo,
        deploymentInfo: deploymentStatus,
      }
    : deployMutation.data;

  return {
    deploy,
    result,
    error: (deployMutation.error as any)?.message || (pollingError as any)?.message || null,
    isLoading: deployMutation.isPending || isPolling,
    showOverlay,
    closeOverlay,
    files,
  };
} 