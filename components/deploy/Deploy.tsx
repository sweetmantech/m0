import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VercelIcon } from '../icons';
import DeployVerification from './DeployVerification';
import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function Deploy() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
        onClick={() => setOpen((prev) => !prev)}
      >
        <VercelIcon size={16} />
        Deploy
      </Button>
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && <DeployVerification onClose={() => setOpen(false)} />}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
} 