import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
  onAmountConfirm: (amount: number, currency: string) => void;
  currentUser: User;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ isOpen, onClose, recipient, onAmountConfirm, currentUser }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCurrency('BDT');
      triggerElementRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = Array.from(modalRef.current.querySelectorAll<HTMLElement>('input, button, select')).filter((el: HTMLElement) => el.offsetParent !== null);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              (lastElement as HTMLElement)?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              (firstElement as HTMLElement)?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        triggerElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);


  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > 0) {
      onAmountConfirm(parseFloat(amount), currency);
    }
  };
  
  if (!isOpen) return null;

  const availableCurrencies = Object.keys(currentUser.balances || { 'BDT': 0 });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-money-title"
    >
      <div ref={modalRef} className="bg-popover/80 backdrop-blur-2xl border border-border rounded-2xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleAmountSubmit} className="p-6">
            <h2 id="send-money-title" className="text-xl font-bold text-center text-popover-foreground mb-2">Send Money</h2>
            <p className="text-center text-muted-foreground mb-6">To: <span className="font-semibold text-popover-foreground">{recipient.name}</span></p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground" aria-hidden="true">{getCurrencySymbol(currency)}</span>
              <label htmlFor="amount-input" className="sr-only">Amount</label>
              <input
                id="amount-input"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full text-center text-4xl font-bold p-4 pl-12 bg-background border-2 border-input text-foreground rounded-lg focus:ring-ring focus:border-ring outline-none"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="currency-select" className="sr-only">Currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-center p-2 bg-background border-2 border-input text-foreground rounded-lg focus:ring-ring focus:border-ring outline-none font-semibold"
              >
                {availableCurrencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={onClose} className="w-full bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-secondary/80">Cancel</button>
              <button type="submit" disabled={!amount || parseFloat(amount) <= 0} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none">Next</button>
            </div>
          </form>
      </div>
    </div>
  );
};