
import React, { useState, useEffect } from 'react';
import { MediaBubble } from './MediaBubble';
import { User, PaymentDetails } from '../types';
import { ArrowLeftIcon, Loader2Icon, ShieldCheckIcon, Fingerprint, Delete } from './icons';
import { Avatar } from './Avatar';
import { hapticFeedback } from '../utils/interaction';
import { getCurrencySymbol } from '../utils/currency';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void; // This will now trigger the centralized processPayment
  isLoading: boolean;
  amount: number;
  recipient: { // More generic recipient info
    name: string;
    avatarUrl?: string;
    logoUrl?: string; // For billers/services
  };
  currency?: string;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  onSubmit, // This is now a generic callback that triggers the AppContext's processPayment
  isLoading,
  amount,
  recipient,
  currency = 'BDT'
}) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin(''); // Reset PIN when modal opens
    }
  }, [isOpen]);

  useEffect(() => {
    if (pin.length === 4 && !isLoading) {
      onSubmit(pin); // Pass the pin back to the parent to trigger the actual payment process
    }
  }, [pin, isLoading, onSubmit]);
  
  const handleKeypadClick = (key: string) => {
    if (isLoading || pin.length >= 4) return;
    hapticFeedback();
    if (key === 'backspace') {
      setPin(p => p.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(p => p + key);
    }
  };
  
  if (!isOpen) return null;

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'fingerprint', '0', 'backspace'];

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col animate-fade-in" role="dialog" aria-modal="true">
      <header className="p-4 flex items-center h-16 flex-shrink-0">
        <button onClick={onClose} aria-label="Go back" className="p-2 -ml-2 rounded-full text-gray-300 hover:bg-white/10" disabled={isLoading}>
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-white mx-auto">Secure Payment</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-between text-white p-6">
        <div className="w-full flex flex-col items-center text-center">
            <div className="flex flex-col items-center">
                {recipient.logoUrl ? 
                    <MediaBubble
                      src={recipient.logoUrl}
                      alt={recipient.name}
                      type="image"
                      size={64}
                      fit="contain"
                      className=""
                      style={{ backgroundColor: '#ffffff', padding: '8px' }}
                    /> :
                    <Avatar user={{
                        id: '',
                        name: recipient.name,
                        phone: '',
                        avatarUrl: recipient.avatarUrl || '', // Fallback for avatarUrl if not provided
                        wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' },
                        kycStatus: 'Verified',
                        statusMessage: '',
                        presence: 'offline',
                        isAi: false, // Added isAi property
                        username: recipient.name.toLowerCase().replace(/\s/g, ''),
                        balances: {},
                        joinedDate: ''
                    }} size="lg" />
                }
                <p className="text-gray-400 mt-4">Paying</p>
                <p className="text-xl font-semibold">{recipient.name}</p>
            </div>
            <p className="text-5xl font-bold my-6">
                {getCurrencySymbol(currency)}{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-400 mb-2">Enter your PIN</p>
            {isLoading ? (
                <Loader2Icon className="h-8 w-8 animate-spin text-brandGreen-400" />
            ) : (
                <div className="flex justify-center gap-4 h-8 items-center">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-4 w-4 rounded-full transition-colors ${i < pin.length ? 'bg-brandGreen-400' : 'bg-gray-700'}`} />
                    ))}
                </div>
            )}
        </div>

        <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-4">
            {keypadKeys.map(key => (
                <button 
                    key={key} 
                    onClick={() => handleKeypadClick(key)} 
                    disabled={key === 'fingerprint' || isLoading}
                    className="h-16 rounded-full flex items-center justify-center text-3xl font-light bg-gray-800/50 hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-30"
                >
                    {key === 'backspace' ? <Delete /> : key === 'fingerprint' ? <Fingerprint /> : key}
                </button>
            ))}
        </div>
      </main>
      <footer className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2 flex-shrink-0">
        <ShieldCheckIcon size={14}/> Securely processed by OumaGe Pay
      </footer>
    </div>
  );
};
