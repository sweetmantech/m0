import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const DEPLOY_URL =
  'https://vercel.com/new/clone?repository-url=https://github.com/vercel/ai-chatbot&env=AUTH_SECRET&envDescription=Learn more about how to get the API Keys for the application&envLink=https://github.com/vercel/ai-chatbot/blob/main/.env.example&demo-title=AI Chatbot&demo-description=An Open-Source AI Chatbot Template Built With Next.js and the AI SDK by Vercel.&demo-url=https://chat.vercel.ai&products=[{"type":"integration","protocol":"ai","productSlug":"grok","integrationSlug":"xai"},{"type":"integration","protocol":"storage","productSlug":"neon","integrationSlug":"neon"},{"type":"blob"}]';

export default function DeployVerification({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="deploy-verification"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute right-0 mt-2 z-[9999] w-[480px] max-w-[100vw] rounded-lg bg-black text-zinc-50 shadow-xl border border-zinc-800 p-3 flex flex-col gap-4"
      style={{ top: '100%' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm">Deploy to Vercel</span>
        <span className="text-sm text-zinc-400">
          Publish the latest version of your app. This will make your changes live and accessible to all users.
        </span>
      </div>
      <Button
        className="w-full bg-white text-zinc-900 hover:bg-zinc-200 h-8 px-3 py-1 text-sm"
        onClick={() => {
          window.open(DEPLOY_URL, '_blank', 'noopener,noreferrer');
          onClose();
        }}
      >
        Deploy to Production
      </Button>
    </motion.div>
  );
} 