'use client';

import { useState, useRef, useEffect } from 'react';
import { getEmbedUrl } from '@/lib/utils/video';
import { cn } from '@/lib/utils/cn';
import type { VideoProvider } from '@/types/database';

interface VideoPlayerProps {
  provider: VideoProvider;
  videoId: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ provider, videoId, title, className }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!videoId.trim()) {
    return (
      <div className={cn('flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400', className)}>
        Nenhum vídeo selecionado
      </div>
    );
  }

  const embedUrl = getEmbedUrl(provider, videoId);
  const iframeTitle = title || `Video player - ${provider}`;

  return (
    <div ref={containerRef} className={cn('relative aspect-video w-full overflow-hidden rounded-lg bg-dark-card', className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-dark-border border-t-primary" />
        </div>
      )}
      {inView && (
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-presentation allow-popups"
          allowFullScreen
          title={iframeTitle}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
