import React from 'react';

interface DeploySuccessProps {
  deploymentInfo: any;
}

const DeploySuccess: React.FC<DeploySuccessProps> = ({ deploymentInfo }) => {
  if (!deploymentInfo) return null;
  console.log("deploymentInfo", deploymentInfo);
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <span className="text-3xl">🎉</span>
      <span className="font-semibold text-lg">Deployment Successful!</span>
      <span className="text-sm text-zinc-400 text-center">Your app is live and ready to use.</span>
      <a
        href={`https://${deploymentInfo.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 px-4 py-2 bg-black text-white hover:bg-white hover:text-black rounded transition font-medium text-base"
      >
        View Production App
      </a>
    </div>
  );
};

export default DeploySuccess; 