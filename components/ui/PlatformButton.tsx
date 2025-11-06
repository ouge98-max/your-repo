import React, { useCallback } from 'react';
import { cn } from '../../lib/utils';

interface PlatformButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  haptic?: boolean;
  keyboardShortcut?: string;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  ariaLabel,
  haptic = true,
  keyboardShortcut,
}) => {
  const handleClick = useCallback(() => {
    // Haptic feedback for mobile devices
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light vibration
    }
    
    if (onClick && !disabled && !loading) {
      onClick();
    }
  }, [onClick, disabled, loading, haptic]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    } else if (keyboardShortcut && e.key === keyboardShortcut) {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick, keyboardShortcut]);

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus-visible focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'touch-target touch-feedback', // Cross-platform touch improvements
    {
      // Variant styles
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
    },
    {
      // Size styles
      'h-9 px-3 text-sm': size === 'sm',
      'h-11 px-4 text-base': size === 'md',
      'h-14 px-6 text-lg': size === 'lg',
    },
    className
  );

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={baseClasses}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      {loading && (
        <span className="mr-2 animate-spin">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

export default PlatformButton;