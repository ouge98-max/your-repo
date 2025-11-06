import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { generateQrCodeSvgPath } from '../utils/qrCodeGenerator';
import { Avatar } from './Avatar';
import { X } from './icons';


interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, user }) => {
  const [qrPath, setQrPath] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
      setTimeout(() => modalRef.current?.querySelector<HTMLElement>('button')?.focus(), 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);

      const qrData = `ouma-ge://contact?name=${encodeURIComponent(user.name)}&phone=${encodeURIComponent(user.phone)}&avatar=${encodeURIComponent(user.avatarUrl)}`;
      generateQrCodeSvgPath(qrData)
          .then(path => setQrPath(path))
          .catch(err => console.error("Failed to generate QR Code path:", err));
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose, user]);

  if (!isOpen) return null;

  const titleId = `qr-title-${user.id}`;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
        <div ref={modalRef} className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl w-full max-w-xs text-center p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} aria-label="Close QR code modal" className="absolute -top-3 -right-3 text-gray-200 bg-gray-700 rounded-full border border-gray-600 p-1">
                <X className="h-6 w-6"/>
            </button>
            
            <Avatar user={user} size="lg" className="mx-auto mb-3" />
            <h3 id={titleId} className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Scan to pay or add me on Ouma-Ge</p>

            <div className="bg-white p-4 rounded-lg shadow-inner">
                 <svg viewBox="0 0 45 45" className="w-full h-full" role="img" aria-label={`QR code to pay ${user.name}`}>
                    <title>QR code for ${user.name}</title>
                    <path d={qrPath} fill="#111827" />
                </svg>
            </div>
        </div>
    </div>
  );
};