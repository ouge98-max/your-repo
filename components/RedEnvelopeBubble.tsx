import React from 'react';
import { Message } from '../types';
import { EnvelopeIcon } from './icons';

interface RedEnvelopeBubbleProps {
    message: Message;
    isCurrentUser: boolean;
    onOpen: (message: Message) => void;
}

export const RedEnvelopeBubble: React.FC<RedEnvelopeBubbleProps> = ({ message, isCurrentUser, onOpen }) => {
    const { greeting, isOpened } = message.redEnvelopeData!;
    const isRecipient = !isCurrentUser;
    const canOpen = isRecipient && !isOpened;

    const envelopeClasses = `relative w-64 p-4 rounded-lg overflow-hidden text-center flex flex-col items-center justify-center transition-all duration-300 ${isOpened ? 'bg-red-900/80' : 'bg-gradient-to-br from-red-600 to-yellow-500 shadow-lg shadow-red-500/30'}`;

    return (
        <button 
            onClick={() => canOpen ? onOpen(message) : {}} 
            disabled={!canOpen}
            className={envelopeClasses}
            aria-label={canOpen ? `Red envelope with greeting: ${greeting}. Tap to open.` : `Red envelope. Greeting: ${greeting}. Status: ${isOpened ? 'Opened' : 'Sent'}.`}
        >
            {!isOpened && (
                <div className="absolute inset-0 bg-yellow-300/20 opacity-50 animate-pulse"></div>
            )}
            <div className="relative z-10">
                {isOpened ? (
                     <EnvelopeIcon className="h-10 w-10 text-yellow-300/50 mx-auto" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-yellow-300 shadow-inner">
                        <span className="text-xl font-bold text-red-800">৳</span>
                    </div>
                )}
                <p className="font-semibold text-white mt-2 break-words">{greeting}</p>
                <p className="text-xs text-yellow-200/80 mt-1">
                    {isOpened ? 'Red Envelope Opened' : (isRecipient ? 'Tap to open' : 'Sent')}
                </p>
            </div>
        </button>
    );
};