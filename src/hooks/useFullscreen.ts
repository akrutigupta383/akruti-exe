import { useCallback, useEffect, useState } from 'react';

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

function currentFullscreenElement(): Element | null {
  const doc = document as FsDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function useFullscreen() {
  const doc = typeof document !== 'undefined' ? (document as FsDocument) : null;
  const isSupported = !!doc && !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
  const [isFullscreen, setIsFullscreen] = useState(() => !!doc && !!currentFullscreenElement());

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!currentFullscreenElement());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  /**
   * Resolves to false when fullscreen is unsupported or the browser refuses.
   * Some embedded browsers never settle the request, so give up after a moment.
   */
  const toggle = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    const d = document as FsDocument;
    const wantFullscreen = !currentFullscreenElement();
    try {
      const request = wantFullscreen
        ? (() => {
            const el = document.documentElement as FsElement;
            return el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
          })()
        : d.exitFullscreen
          ? d.exitFullscreen()
          : d.webkitExitFullscreen?.();
      await Promise.race([request, new Promise((resolve) => setTimeout(resolve, 1500))]);
    } catch {
      return false;
    }
    return !!currentFullscreenElement() === wantFullscreen;
  }, [isSupported]);

  return { isSupported, isFullscreen, toggle };
}
