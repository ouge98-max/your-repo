import React from 'react';
import { CameraIcon, ImageIcon, GiftIcon, Receipt, CurrencyDollarIcon } from './icons';

interface AttachmentSheetProps {
  onClose: () => void;
  onSelect: (option: 'camera' | 'gallery' | 'red_envelope' | 'bill_split' | 'send_money') => void;
  showSendMoney?: boolean;
}

const AttachmentButton: React.FC<{ icon: React.FC<any>, label: string, onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center space-y-2 group">
        <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-border group-hover:bg-muted transition-colors">
            <Icon className="h-7 w-7 text-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
    </button>
);

export const AttachmentSheet: React.FC<AttachmentSheetProps> = ({ onClose, onSelect, showSendMoney }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose}>
      <div 
        className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-2xl p-6 shadow-lg animate-slide-in-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
            <AttachmentButton icon={CameraIcon} label="Camera" onClick={() => onSelect('camera')} />
            <AttachmentButton icon={ImageIcon} label="Gallery" onClick={() => onSelect('gallery')} />
            {showSendMoney && <AttachmentButton icon={CurrencyDollarIcon} label="Send Money" onClick={() => onSelect('send_money')} />}
            <AttachmentButton icon={GiftIcon} label="Red Envelope" onClick={() => onSelect('red_envelope')} />
            <AttachmentButton icon={Receipt} label="Split Bill" onClick={() => onSelect('bill_split')} />
        </div>
      </div>
    </div>
  );
};