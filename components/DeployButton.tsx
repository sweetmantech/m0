import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VercelIcon } from './icons';
import DeployVerification from './DeployVerification';
import { AnimatePresence } from 'framer-motion';

export default function DeployButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-white hover:bg-zinc-800 text-zinc-50 md:flex py-1 px-4 h-fit md:h-[34px] order-4 md:ml-auto"
        onClick={() => setOpen((prev) => !prev)}
      >
        <VercelIcon size={16} />
        Deploy
      </Button>
      <AnimatePresence>
        {open && (
          <DeployVerification
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 