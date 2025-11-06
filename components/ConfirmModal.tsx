import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2Icon } from './icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, description,
  confirmText = 'Confirm', cancelText = 'Cancel',
  isLoading = false, isDestructive = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      // Focus on confirm button by default
      setTimeout(() => modalRef.current?.querySelector<HTMLButtonElement>('.confirm-button')?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  const confirmButtonClass = isDestructive
    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
    : 'bg-primary hover:bg-primary/90 text-primary-foreground';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div ref={modalRef} className="bg-popover text-popover-foreground rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          {isDestructive && <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />}
          <h2 id="confirm-modal-title" className="text-xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={onClose} disabled={isLoading} className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-accent disabled:opacity-50">
              {cancelText}
            </button>
            <button type="button" onClick={onConfirm} disabled={isLoading} className={`confirm-button w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 ${confirmButtonClass} disabled:opacity-50`}>
              {isLoading && <Loader2Icon className="h-5 w-5 animate-spin" />}
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};