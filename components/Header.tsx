import React, { useRef, useEffect } from 'react';
import { ArrowLeftIcon } from './icons';
import { User } from '../types';
import { Avatar } from './Avatar';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  focusOnMount?: boolean;
  // New props for chat header context
  subtitle?: React.ReactNode;
  avatarUser?: User | null;
  onTitleClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, focusOnMount, subtitle, avatarUser, onTitleClick }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [focusOnMount]);

  const renderTitleArea = () => {
    // If onTitleClick is provided, it's an interactive chat header
    if (onTitleClick) {
      return (
        <button onClick={onTitleClick} className="flex-1 flex items-center gap-3 text-left p-1 rounded-lg hover:bg-muted min-w-0">
          {avatarUser && <Avatar user={avatarUser} size="sm" />}
          <div className="flex-1 min-w-0">
            <h1 ref={titleRef} tabIndex={-1} className="text-lg font-bold text-foreground truncate focus:outline-none">{title}</h1>
            {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
          </div>
        </button>
      );
    }

    // Default non-interactive title
    return (
      <div className="flex-1 min-w-0">
        <h1 ref={titleRef} tabIndex={-1} className="text-xl font-bold focus:outline-none text-foreground truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl border-border">
      <div className="max-w-md mx-auto px-4 flex items-center h-16 gap-4">
        {onBack && (
          <button onClick={onBack} aria-label="Go back" className="p-2 -ml-2 rounded-full text-foreground/70 hover:bg-muted">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
        )}
        {renderTitleArea()}
        {rightAction && (
            <div className="ml-auto flex-shrink-0">
                {rightAction}
            </div>
        )}
      </div>
    </header>
  );
};