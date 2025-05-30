import { motion } from 'framer-motion';
import DeployButton from './DeployButton';

export default function DeployVerification({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Overlay for click-away */}
      <div
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Popover */}
      <motion.div
        key="deploy-verification"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed right-4 top-16 z-[9999] sm:w-[480px] w-[90vw] max-w-[95vw] rounded-lg bg-black text-zinc-50 shadow-xl border border-zinc-800 p-3 flex flex-col gap-4"
        role="dialog"
        aria-modal="true"
      >
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
      </motion.div>
    </>
  );
} 