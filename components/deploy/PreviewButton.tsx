import React, { useState } from 'react';
import { StaticPreview } from './StaticPreview';

interface PreviewButtonProps {
  className?: string;
  label?: string;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ className = '', label }) => {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <>
      <button
        className={`mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm ${className}`}
        onClick={() => setShowPreview((v) => !v)}
      >
        {showPreview ? 'Hide Preview' : (label || 'Preview')}
      </button>
      {showPreview && (
        <div className="my-4">
          <StaticPreview onClose={() => setShowPreview(false)} />
        </div>
      )}
    </>
  );
};

export default PreviewButton; 