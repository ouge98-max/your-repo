import React from 'react';
import { MediaBubble } from './MediaBubble';

export interface MediaItem {
  id: string;
  src: string;
  alt: string;
  type?: 'image' | 'video';
  webpSrc?: string;
  captionsSrc?: string;
  fit?: 'cover' | 'contain';
}

const demoItems: MediaItem[] = [
  {
    id: 'chat',
    src: '/icon-192.png',
    alt: 'Chat messages icon',
    type: 'image',
    fit: 'contain',
  },
  {
    id: 'maps',
    src: '/icon-512.png',
    alt: 'Map navigation icon',
    type: 'image',
    fit: 'contain',
  },
  {
    id: 'wallet',
    src: new URL('../logo.jpg', import.meta.url).href,
    alt: 'Digital wallet brand logo',
    type: 'image',
    fit: 'contain',
  },
  {
    id: 'camera',
    src: new URL('../creators.jpg', import.meta.url).href,
    alt: 'Creators and camera capture',
    type: 'image',
    fit: 'cover',
  },
  {
    id: 'moments',
    src: new URL('../ride.mp4', import.meta.url).href,
    alt: 'Social moments video clip',
    type: 'video',
    captionsSrc: '/ride.vtt',
  },
];

export const MediaBubbleGrid: React.FC = () => {
  return (
    <div className="media-bubble-grid" aria-label="App feature showcase">
      {demoItems.map((item) => (
        <MediaBubble
          key={item.id}
          src={item.src}
          alt={item.alt}
          type={item.type}
          webpSrc={item.webpSrc}
          captionsSrc={item.captionsSrc}
          fit={item.fit}
        />
      ))}
    </div>
  );
};

export default MediaBubbleGrid;
