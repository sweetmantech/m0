'use client';

import { toast } from '@/components/toast';
import { Message } from 'ai';
import { useState, useEffect } from 'react';

export interface DeployContextValue {
  deploy: (message: Message) => Promise<any>;
  result: any;
  error: string | null;
  isLoading: boolean;
  showOverlay: boolean;
  closeOverlay: () => void;
}

export function useDeploy(accessToken?: string | null): DeployContextValue {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (result || error || isLoading) setShowOverlay(true);
  }, [result, error, isLoading]);

  // Helper to extract code blocks with filenames from LLM output
  function parseFilesFromMessageContent(content: string): Array<{ file: string; data: string; encoding: string }> {
    const fileBlocks: Array<{ file: string; data: string; encoding: string }> = [];
    if (!content) return fileBlocks;
    // Regex to match code blocks like ```tsx file="app/page.tsx" ...code...```
    const codeBlockRegex = /```[a-zA-Z]+ file=\"([^\"]+)\"\n([\s\S]*?)```/g;
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const [, file, data] = match;
      fileBlocks.push({ file, data: data.trim(), encoding: 'utf-8' });
    }
    return fileBlocks;
  }

  async function deploy(message: Message) {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      // Parse files from message content
      const files = parseFilesFromMessageContent(message.content);
      const body: any = { accessToken };
      if (files.length > 0) {
        body.files = files;
      }
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  function closeOverlay() {
    setShowOverlay(false);
  }

  return { deploy, result, error, isLoading, showOverlay, closeOverlay };
} 