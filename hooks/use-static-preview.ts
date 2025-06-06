import { useEffect, useRef, useState } from 'react';
import { getIframeUrl } from '@/lib/preview/getIframeUrl';
import { FileDescriptor } from '@/lib/types';

export default function useStaticPreview(code: string | undefined, files: FileDescriptor[] | null) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const prevBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (!code) {
      setError('No app/page.tsx file found for preview.');
      setBlobUrl(null);
      setLoading(false);
      return;
    }
    try {
      const url = getIframeUrl({
        code,
        files,
      });
      if (!cancelled) {
        if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
        prevBlobUrl.current = url;
        setBlobUrl(url);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate preview');
      setBlobUrl(null);
    } finally {
      setLoading(false);
    }
    return () => {
      cancelled = true;
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, [code, files]);

  return { blobUrl, error, loading };
} 