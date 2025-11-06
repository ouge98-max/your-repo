import React from 'react';
import { Message, BillSplitParticipant, User } from '../types';
import { Check, Receipt } from './icons';
import { getCurrencySymbol } from '../utils/currency';

interface BillSplitBubbleProps {
    message: Message;
    onPay: (message: Message, participant: BillSplitParticipant) => void;
    currentUser: User;
}

export const BillSplitBubble: React.FC<BillSplitBubbleProps> = ({ message, onPay, currentUser }) => {
    const { billSplitRequestData: request } = message;
    if (!request) return null;

    const currentUserParticipant = request.participants.find(p => p.userId === currentUser.id);
    const hasPaid = currentUserParticipant?.paid ?? false;
    const canPay = currentUserParticipant && !hasPaid;
    
    const paidCount = request.participants.filter(p => p.paid).length;
    const totalCount = request.participants.length;

    return (
        <div className="w-72 text-card-foreground">
            <div className="bg-card p-4 rounded-lg shadow-md border border-border space-y-3">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                         <Receipt size={20} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-lg">{request.title}</p>
                        <p className="text-sm text-muted-foreground">Total: {getCurrencySymbol('BDT')}{request.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {request.participants.map(p => (
                         <div key={p.userId} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{p.userId === currentUser.id ? "Your share" : "Owes"}</span>
                            <div className="flex items-center gap-2">
                                 <span className="font-semibold">{getCurrencySymbol('BDT')}{p.amount.toLocaleString()}</span>
                                 {p.paid && <Check size={16} className="text-primary" />}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    {paidCount}/{totalCount} participants have paid.
                </div>

                {canPay && (
                    <button 
                        onClick={() => onPay(message, currentUserParticipant)}
                        className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg hover:bg-primary/90 mt-2"
                    >
                        Pay {getCurrencySymbol('BDT')}{currentUserParticipant.amount.toLocaleString()}
                    </button>
                )}
                 {hasPaid && (
                    <div className="w-full bg-primary/10 text-primary font-bold py-2 rounded-lg mt-2 text-center text-sm flex items-center justify-center gap-2">
                        <Check size={16} /> You've Paid
                    </div>
                )}
            </div>
        </div>
    );
};
