import React from 'react';
import DeployButton from './DeployButton';

const DeployCreate: React.FC = () => {
  return (
    <>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm">Deploy to Vercel</span>
        <span className="text-sm text-zinc-400">
          Publish the latest version of your app. This will make your changes live and accessible to all users.
        </span>
      </div>
      <DeployButton
        className="w-full bg-white text-zinc-900 hover:bg-zinc-200 h-8 px-3 py-1 text-sm"
      >
        Deploy to Production
      </DeployButton>
    </>
  );
};

export default DeployCreate; 