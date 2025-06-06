import React from 'react';
import DeployLogs from './DeployLogs';

interface DeployProgressProps {
  deploymentInfo: any;
  error?: string | null;
}

const DeployProgress: React.FC<DeployProgressProps> = ({ deploymentInfo, error }) => {
  if (!deploymentInfo) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-sm">Deployment in Progress</span>
      <span className="text-sm text-zinc-400">Your app is being deployed. This may take a minute.</span>
      {deploymentInfo?.status && (
        <span className="text-xs text-zinc-300">Status: {deploymentInfo.status}</span>
      )}
      <DeployLogs logs={deploymentInfo?.logs} />
      {error && <span className="text-red-400 text-xs mt-2">Error: {error}</span>}
    </div>
  );
};

export default DeployProgress; 