import React from 'react';
import { DeploymentEvents } from './DeploymentEvents';

interface DeploymentInfoOverlayProps {
  result: any;
  error: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export function DeploymentInfoOverlay({ result, error, isLoading, onClose }: DeploymentInfoOverlayProps) {
  if (!result && !error && !isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 min-w-[320px] max-w-[90vw] relative">
        <button
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {isLoading && <p className="text-center text-zinc-700 dark:text-zinc-200">Deploying to Vercel...</p>}
        {result && result.projectInfo && (
          <div className="mb-2 text-center">
            <h2 className="text-lg font-semibold mb-1">New Project Created</h2>
            <p className="text-sm text-zinc-500">{result.projectInfo.name}</p>
            <p className="text-xs text-zinc-400">ID: {result.projectInfo.id}</p>
          </div>
        )}
        {result && result.deploymentInfo && (
          <div className="text-center">
            <h3 className="text-base font-medium mb-1">Deployment Status</h3>
            <p className="text-sm text-zinc-500">Deployment ID: {result.deploymentInfo.id}</p>
            <p className="text-xs text-zinc-400 mb-2">Status: {result.deploymentInfo.status}</p>
            {result.deploymentInfo.status !== 'READY' && (
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 border-4 border-zinc-300 border-t-zinc-900 dark:border-t-white rounded-full animate-spin mb-1" />
                <span className="text-xs text-zinc-500">{result.deploymentInfo.status === 'ERROR' ? 'Deployment failed' : 'Deploying...'}</span>
              </div>
            )}
            {result.deploymentInfo.status === 'READY' && (
              result.deploymentInfo.alias?.length > 0 ? (
                <a
                  href={`https://${result.deploymentInfo.alias[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  View Production App
                </a>
              ) : result.deploymentInfo.url ? (
                <a
                  href={`https://${result.deploymentInfo.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  View Deployed App
                </a>
              ) : null
            )}
            <DeploymentEvents logs={result.deploymentInfo.logs} />
          </div>
        )}
        {error && <p className="text-center text-red-500 mt-2">Error: {error}</p>}
      </div>
    </div>
  );
} 