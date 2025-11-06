import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type MediaType = 'image' | 'video';

export interface MediaBubbleProps {
  src: string;
  alt: string;
  type?: MediaType; // auto-detect by extension if not provided
  size?: number; // diameter in px; defaults to responsive clamp
  webpSrc?: string; // optional webp source for images
  captionsSrc?: string; // optional vtt captions for video
  borderColorRgb?: string; // e.g. "var(--primary)" without rgb(); uses theme primary by default
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  fit?: 'cover' | 'contain';
}

const isImageExt = (url: string) => /(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/i.test(url);
const isVideoExt = (url: string) => /(\.mp4|\.webm|\.ogg)$/i.test(url);

export const MediaBubble: React.FC<MediaBubbleProps> = ({
  src,
  alt,
  type,
  size,
  webpSrc,
  captionsSrc,
  borderColorRgb,
  onClick,
  className,
  style,
  fit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Determine media type
  const computedType: MediaType = type ?? (isVideoExt(src) ? 'video' : 'image');

  // IntersectionObserver for lazy load
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const styleSize: React.CSSProperties = size
    ? { ['--bubble-size' as any]: `${size}px` }
    : { ['--bubble-size' as any]: 'clamp(96px, 12vw, 120px)' };

  const borderVar = borderColorRgb ?? 'var(--primary)';

  return (
    <motion.div
      ref={containerRef}
      role={onClick ? 'button' : undefined}
      tabIndex={0}
      aria-label={alt}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={`media-bubble ${className ?? ''}`.trim()}
      style={{ ...styleSize, ['--bubble-border' as any]: `rgb(${borderVar})`, ...(style ?? {}) }}
      whileHover={{ scale: 1.03 }}
    >
      {!loaded && <div className="media-bubble-skeleton" aria-hidden="true" />}

      {computedType === 'image' ? (
        inView ? (
          <picture>
            {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
            <img
              src={src}
              alt={alt}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              style={{ width: '100%', height: '100%', objectFit: fit ?? 'cover' }}
            />
          </picture>
        ) : (
          <div className="media-bubble-placeholder" />
        )
      ) : (
        inView ? (
          <video
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onLoadedData={() => setLoaded(true)}
            style={{ width: '100%', height: '100%', objectFit: fit ?? 'cover' }}
          >
            <source src={src} />
            {captionsSrc && (
              <track kind="captions" src={captionsSrc} default />
            )}
          </video>
        ) : (
          <div className="media-bubble-placeholder" />
        )
      )}
    </motion.div>
  );
};

export default MediaBubble;