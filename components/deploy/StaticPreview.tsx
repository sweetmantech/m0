import React from 'react';
import { useDeployContext } from '@/providers/DeployProvider';
import useStaticPreview from '@/hooks/use-static-preview';

interface StaticPreviewProps {
  onClose: () => void;
}

export function StaticPreview({ onClose }: StaticPreviewProps) {
  const { files } = useDeployContext();
  const mainFile = files?.find((f) => f.file === 'app/page.tsx');
  const code = mainFile?.data;
  const { blobUrl, error, loading } = useStaticPreview(code, files);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-4 max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-2xl z-10"
          onClick={onClose}
          aria-label="Close Preview"
        >
          &times;
        </button>
        {loading && (
          <div className="flex items-center justify-center h-64 w-full">
            <div className="size-8 border-4 border-zinc-300 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-red-500 p-4 w-full text-center">Error: {error}</div>
        )}
        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            title="Preview"
            className="w-full h-[70vh] border rounded"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
} 