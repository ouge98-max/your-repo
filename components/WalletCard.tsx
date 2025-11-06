import React, { useState } from 'react';
import { User } from '../types';
import { getCurrencySymbol } from '../utils/currency';

interface WalletCardProps {
    user: User;
    displayBalance: number;
    displayCurrency: string;
}

const ProviderLogo: React.FC<{ provider: 'Bkash' | 'Nagad' }> = ({ provider }) => {
    if (provider === 'Bkash') {
        return <span className="text-2xl font-bold" style={{ color: '#d9226e' }}>bKash</span>;
    }
    if (provider === 'Nagad') {
        return <span className="text-2xl font-bold" style={{ color: '#f0592b' }}>nagad</span>;
    }
    return null;
};

export const WalletCard: React.FC<WalletCardProps> = ({ user, displayBalance, displayCurrency }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="wallet-details"
            className="relative w-full bg-gradient-to-br from-primary to-brand-600 rounded-2xl shadow-lg shadow-primary/20 p-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform duration-200 hover:scale-[1.02] overflow-hidden"
        >
            {/* Gloss Effect */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-white/20 to-transparent opacity-50 -translate-x-1/4 -translate-y-1/4" />
             {/* Subtle Pattern Overlay */}
            <div 
                className="absolute inset-0 bg-repeat opacity-5"
                style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}
            />

            <div className="relative">
                <div className="flex justify-between items-start text-white">
                    <div>
                        <p className="text-sm text-primary-foreground/80">Main Balance ({displayCurrency})</p>
                        <p className="text-4xl font-bold mt-1">
                            {getCurrencySymbol(displayCurrency)}{parseFloat(displayBalance.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-sm flex items-center gap-1" aria-hidden="true">
                        <span>Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>
                <div id="wallet-details" className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 mt-6' : 'max-h-0'}`}>
                    <div className="pt-4 border-t border-white/20 space-y-3">
                        <div className="flex justify-between items-center">
                            <ProviderLogo provider={user.wallet.provider} />
                            <div className="text-right">
                                <p className="text-sm font-semibold text-white">{user.name}</p>

                                <p className="text-xs text-white/80">{user.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
};
