import React from 'react';
import { User } from '../types';
import { MediaBubble } from './MediaBubble';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className }) => {
  const pxSize = {
    sm: 40,
    md: 48,
    lg: 64,
    xl: 96,
  };
  
  const onlineDotSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
  }

  const onlineDotPositionClasses = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-0.5 right-0.5',
    xl: 'bottom-1 right-1',
  }

  const presenceColorClass = {
      online: 'bg-green-500',
      busy: 'bg-yellow-500',
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <MediaBubble
        src={user.avatarUrl}
        alt={user.name}
        size={pxSize[size]}
        className="shadow-none"
      />
      {user.presence && user.presence !== 'offline' && (
        <span className={`absolute ${onlineDotPositionClasses[size]} block ${onlineDotSizeClasses[size]} rounded-full ${presenceColorClass[user.presence as 'online' | 'busy']} ring-2 ring-background`} />
      )}
    </div>
  );
};