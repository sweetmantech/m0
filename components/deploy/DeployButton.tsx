import { Button } from '@/components/ui/button';
import React from 'react';

interface DeployButtonProps {
  className?: string;
  url?: string;
  children?: React.ReactNode;
}

export default function DeployButton({ className, children }: DeployButtonProps) {
  const handleOAuthRedirect = () => {
    // Redirect to Vercel OAuth integration page
    const link = 'https://vercel.com/integrations/recoup/new';
    window.location.assign(link);
  };

  return (
    <Button
      className={className || 'w-full bg-white text-zinc-900 hover:bg-zinc-200 h-8 px-3 py-1 text-sm'}
      onClick={handleOAuthRedirect}
    >
      {children || 'Deploy to Production'}
    </Button>
  );
} 