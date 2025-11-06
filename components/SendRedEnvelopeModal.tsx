import React, { useState, useEffect } from 'react';
import { getCurrencySymbol } from '../utils/currency';

interface SendRedEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (amount: number, greeting: string) => Promise<void>;
}

export const SendRedEnvelopeModal: React.FC<SendRedEnvelopeModalProps> = ({ isOpen, onClose, onSend }) => {
  const [amount, setAmount] = useState('');
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setGreeting('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (numericAmount > 0) {
      setIsLoading(true);
      await onSend(numericAmount, greeting || 'Best Wishes!');
      // The parent component will close the modal on success.
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gradient-to-br from-red-800 to-yellow-600 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border-2 border-yellow-400/50" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSend} className="p-6">
          <h2 className="text-2xl font-bold text-center text-white mb-6" style={{textShadow: '0 1px 3px rgba(0,0,0,0.4)'}}>Send Red Envelope</h2>
          
          <div className="mb-4">
            <label htmlFor="red-envelope-amount" className="block text-sm font-medium text-yellow-200 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-yellow-200">{getCurrencySymbol('BDT')}</span>
              <input
                id="red-envelope-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full text-lg font-bold p-3 pl-10 bg-black/30 border-2 border-yellow-400/50 text-white rounded-lg focus:ring-yellow-400 focus:border-yellow-400 outline-none placeholder-yellow-200/50"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="red-envelope-greeting" className="block text-sm font-medium text-yellow-200 mb-1">Greeting (Optional)</label>
            <input
              id="red-envelope-greeting"
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Best Wishes!"
              maxLength={50}
              className="w-full p-3 bg-black/30 border-2 border-yellow-400/50 text-white rounded-lg focus:ring-yellow-400 focus:border-yellow-400 outline-none placeholder-yellow-200/50"
            />
          </div>
          
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={!amount || parseFloat(amount) <= 0 || isLoading} className="w-full bg-yellow-400 text-red-900 font-bold py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:bg-yellow-400/50">
              {isLoading ? 'Sending...' : 'Send'}
            </button>
            <button type="button" onClick={onClose} className="w-full bg-transparent text-yellow-200 font-bold py-3 rounded-lg hover:bg-white/10">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};