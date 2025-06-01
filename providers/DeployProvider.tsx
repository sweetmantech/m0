'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDeploy as useDeployHook, DeployContextValue } from '@/hooks/use-deploy';

const DeployContext = createContext<DeployContextValue | undefined>(undefined);

export function DeployProvider({ accessToken, children }: { accessToken: string; children: ReactNode }) {
  const deployState = useDeployHook(accessToken);
  return <DeployContext.Provider value={deployState}>{children}</DeployContext.Provider>;
}

export function useDeployContext() {
  const ctx = useContext(DeployContext);
  if (!ctx) throw new Error('useDeployContext must be used within a DeployProvider');
  return ctx;
} 