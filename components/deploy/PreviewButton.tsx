import React, { useState } from 'react';
import { StaticPreview } from './StaticPreview';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';

interface PreviewButtonProps {
  className?: string;
  label?: string;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ className = '', label }) => {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <>
      <Button
        className={`bg-black text-white hover:bg-white hover:text-black md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto ${className}`}
        onClick={() => setShowPreview((v) => !v)}
      >
        {showPreview ? 'Hide Preview' : (label || 'Preview')}
      </Button>
      {typeof window !== 'undefined' && showPreview &&
        createPortal(
          <div>
            <StaticPreview onClose={() => setShowPreview(false)} />
          </div>,
          document.body
        )
      }
    </>
  );
};

export default PreviewButton; 