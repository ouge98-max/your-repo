import React from 'react';
import { AiActionRequest, User } from '../types';
import { Avatar } from './Avatar';
import { PaperAirplaneIcon } from './icons';
import { getCurrencySymbol } from '../utils/currency';

interface AiActionCardProps {
    request: AiActionRequest;
    onConfirm: (request: AiActionRequest) => void;
    onCancel: (request: AiActionRequest) => void;
}

export const AiActionCard: React.FC<AiActionCardProps> = ({ request, onConfirm, onCancel }) => {
    const { type, recipient, amount, status } = request;

    if (type !== 'send_money') return null;

    const isPending = status === 'pending';

    return (
        <div className="bg-gray-800 p-4 rounded-2xl max-w-xs w-full space-y-3 border border-brandGreen-500/30 shadow-md">
            <h3 className="font-bold text-white">Confirm Transaction</h3>
            <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                <Avatar user={recipient} size="sm" />
                <div>
                    <p className="text-sm text-gray-400">Recipient</p>
                    <p className="font-semibold text-gray-200">{recipient.name}</p>
                </div>
                 <div className="ml-auto text-right">
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="font-bold text-brandGreen-400">{getCurrencySymbol('BDT')}{amount.toLocaleString('en-IN')}</p>
                </div>
            </div>
            {isPending ? (
                <div className="flex gap-2">
                    <button onClick={() => onCancel(request)} className="w-full bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500">Cancel</button>
                    <button onClick={() => onConfirm(request)} className="w-full bg-brandGreen-600 text-white font-bold py-2 rounded-lg hover:bg-brandGreen-700 flex items-center justify-center gap-2">
                        <PaperAirplaneIcon className="h-4 w-4" /> Confirm
                    </button>
                </div>
            ) : (
                <p className="text-center text-sm font-semibold text-gray-400 italic">
                    {status === 'confirmed' ? 'Transaction Confirmed.' : 'Transaction Cancelled.'}
                </p>
            )}
        </div>
    );
};