import React, { useState, useMemo } from 'react';
import { User, BillSplitParticipant } from '../types';
import { getCurrencySymbol } from '../utils/currency';
import { X, UsersIcon } from './icons';

interface BillSplitCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: User[];
  currentUser: User;
  onCreate: (title: string, totalAmount: number, participants: Omit<BillSplitParticipant, 'paid'>[]) => void;
}

export const BillSplitCreationModal: React.FC<BillSplitCreationModalProps> = ({ isOpen, onClose, participants, currentUser, onCreate }) => {
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const numParticipants = participants.length;

  const amountPerPerson = useMemo(() => {
    const numericTotal = parseFloat(totalAmount);
    if (numericTotal > 0 && numParticipants > 0) {
      return (numericTotal / numParticipants);
    }
    return 0;
  }, [totalAmount, numParticipants]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericTotal = parseFloat(totalAmount);
    if (isNaN(numericTotal) || numericTotal <= 0 || numParticipants <= 0) {
        return;
    }

    // Convert to smallest currency unit (paisa) to avoid floating point issues
    const totalInPaisa = Math.round(numericTotal * 100);
    const baseAmountPaisa = Math.floor(totalInPaisa / numParticipants);
    let remainderPaisa = totalInPaisa % numParticipants;

    const finalParticipants = participants.map(p => {
      let userAmountPaisa = baseAmountPaisa;
      if (remainderPaisa > 0) {
        userAmountPaisa += 1;
        remainderPaisa--;
      }
      return {
        userId: p.id,
        amount: userAmountPaisa / 100, // Convert back to BDT
      };
    });

    onCreate(title, numericTotal, finalParticipants);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-popover rounded-2xl w-full max-w-sm max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-popover-foreground">Split Bill Equally</h2>
          <button onClick={onClose} className="text-muted-foreground"><X /></button>
        </div>
        <form onSubmit={handleSubmit} id="bill-split-form" className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">Title</label>
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Dinner" required className="mt-1 w-full bg-input border border-border rounded-md p-2" />
          </div>
          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-muted-foreground">Total Amount</label>
            <input id="totalAmount" type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" required className="mt-1 w-full bg-input border border-border rounded-md p-2" />
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UsersIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{participants.length} Participants</span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-foreground">{getCurrencySymbol('BDT')}{amountPerPerson > 0 ? amountPerPerson.toFixed(2) : '0.00'}</p>
                    <p className="text-xs text-muted-foreground">each</p>
                </div>
            </div>
          </div>
        </form>
        <div className="p-4 border-t border-border">
          <button form="bill-split-form" type="submit" disabled={!title || amountPerPerson <= 0} className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg disabled:opacity-50">
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};
