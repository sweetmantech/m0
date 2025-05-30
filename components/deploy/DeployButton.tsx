import { Button } from '@/components/ui/button';
import React from 'react';

const DEFAULT_DEPLOY_URL =
  'https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET&envDescription=Learn more about how to get the API Keys for the application&envLink=https://github.com/vercel/ai-chatbot/blob/main/.env.example&demo-title=AI Chatbot&demo-description=An Open-Source AI Chatbot Template Built With Next.js and the AI SDK by Vercel.&demo-url=https://chat.vercel.ai&products=[{"type":"integration","protocol":"ai","productSlug":"grok","integrationSlug":"xai"},{"type":"integration","protocol":"storage","productSlug":"neon","integrationSlug":"neon"},{"type":"blob"}]';

interface DeployButtonProps {
  className?: string;
  url?: string;
  children?: React.ReactNode;
}

export default function DeployButton({ className, url = DEFAULT_DEPLOY_URL, children }: DeployButtonProps) {
  return (
    <Button
      className={className || 'w-full bg-white text-zinc-900 hover:bg-zinc-200 h-8 px-3 py-1 text-sm'}
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
    >
      {children || 'Deploy to Production'}
    </Button>
  );
} 