

import React, { useState, useEffect } from 'react';
import { MediaBubble } from './MediaBubble';
import { User, LinkedAccount, CreditCard } from '../types';
import { Header } from './Header';
import { api } from '../services/mockApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from './icons';
import { ArrowLeft } from 'lucide-react';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface DepositWithdrawScreenProps {
    mode: 'deposit' | 'withdraw';
    user: User;
    onTransactionComplete: () => void;
}

type Step = 'select_account' | 'enter_amount' | 'confirm';
type SelectedSource = (LinkedAccount & { sourceType: 'account' }) | (CreditCard & { sourceType: 'card' });


const DepositWithdrawScreen: React.FC<DepositWithdrawScreenProps> = ({ mode, user, onTransactionComplete }) => {
    const [step, setStep] = useState<Step>('select_account');
    const [selectedSource, setSelectedSource] = useState<SelectedSource | null>(null);
    const [amount, setAmount] = useState('');
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    const title = mode === 'deposit' ? 'Deposit Money' : 'Withdraw Money';
    const linkedAccounts = user.linkedAccounts || [];
    const savedCards = user.creditCards || [];

    const handleSourceSelect = (source: LinkedAccount | CreditCard) => {
        if ('brand' in source) { // It's a CreditCard
            setSelectedSource({ ...source, sourceType: 'card' });
        } else { // It's a LinkedAccount
            setSelectedSource({ ...source, sourceType: 'account' });
        }
        setStep('enter_amount');
    };

    const handleAmountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            if (mode === 'withdraw' && numAmount > user.wallet.balance) {
                toast.error("Withdrawal amount cannot exceed your balance.");
                return;
            }
            setStep('confirm');
        }
    };
    
    const handleConfirm = () => {
        if (!selectedSource || !amount) return;
        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        if (!selectedSource || !amount) return;

        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'savings_transfer' as const, // Reusing savings_transfer type for deposit/withdraw from wallet
            amount: parseFloat(amount),
            mode: mode,
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onTransactionComplete();
            // Navigation to success screen is now handled by processPayment
        } else {
            // Error toast handled by processPayment
        }
    };
    
    const handleBack = () => {
        if (step === 'enter_amount') {
            setSelectedSource(null);
            setStep('select_account');
        } else if (step === 'confirm') {
            setStep('enter_amount');
        } else {
            navigate(-1);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'select_account':
                return (
                    <>
                        <h2 className="text-xl font-bold text-center text-foreground mb-2">
                            {mode === 'deposit' ? 'Deposit From' : 'Withdraw To'}
                        </h2>
                        <p className="text-center text-muted-foreground mb-6">Select an account to continue.</p>
                        
                        {mode === 'deposit' && savedCards.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">Saved Cards</h3>
                                <div className="space-y-3">
                                {savedCards.map(card => (
                                    <button key={card.id} onClick={() => handleSourceSelect(card)} className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors">
                                        <img src={card.brand === 'visa' ? 'https://i.imgur.com/gTUMp3A.png' : 'https://i.imgur.com/MAuz2i7.png'} alt={card.brand} className="h-8 object-contain" />
                                        <div className="text-left">
                                            <p className="font-semibold text-card-foreground capitalize">{card.brand} Card</p>
                                            <p className="text-sm text-muted-foreground">•••• {card.last4}</p>
                                        </div>
                                    </button>
                                ))}
                                </div>
                            </div>
                        )}

                        {linkedAccounts.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">Linked Accounts</h3>
                                <div className="space-y-3">
                                    {linkedAccounts.map(acc => (
                                        <button key={acc.id} onClick={() => handleSourceSelect(acc)} className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors">
                                            <MediaBubble
                                              src={acc.logoUrl}
                                              alt={acc.name}
                                              type="image"
                                              size={40}
                                              fit="contain"
                                              style={{ backgroundColor: '#ffffff', padding: '4px' }}
                                            />
                                            <div className="text-left">
                                                <p className="font-semibold text-card-foreground">{acc.name}</p>
                                                <p className="text-sm text-muted-foreground">{acc.number}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                );

            case 'enter_amount':
                return (
                     <form onSubmit={handleAmountSubmit}>
                        <h2 className="text-xl font-bold text-center text-foreground mb-6">Enter Amount</h2>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">৳</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                                className="w-full text-center text-4xl font-bold p-4 pl-12 bg-input border-2 border-border text-foreground rounded-lg focus:ring-ring focus:border-ring outline-none"
                            />
                        </div>
                        <div className="mt-6">
                            <button type="submit" disabled={!amount || parseFloat(amount) <= 0} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </form>
                );

            case 'confirm':
                const sourceName = selectedSource?.sourceType === 'card' ? `${selectedSource.brand.charAt(0).toUpperCase() + selectedSource.brand.slice(1)} •••• ${selectedSource.last4}` : `${(selectedSource as (LinkedAccount & {sourceType: 'account'}))?.name}`;
                return (
                    <div>
                        <h2 className="text-xl font-bold text-center text-foreground mb-2">Confirm {title}</h2>
                        <div className="bg-card rounded-lg p-4 my-6 space-y-3 text-sm border border-border">
                            <div className="flex justify-between text-muted-foreground">
                                <span>{mode === 'deposit' ? 'From' : 'To'}</span>
                                <span className="font-semibold text-card-foreground text-right">{sourceName}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-lg text-card-foreground">
                                <span>Amount</span>
                                <span>৳{parseFloat(amount).toLocaleString()}</span>
                            </div>
                        </div>
                        <button onClick={handleConfirm} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90">
                            Confirm
                        </button>
                    </div>
                );
        }
    };

    const recipient = mode === 'deposit' 
        ? { name: 'Your OUMAS Wallet' } 
        : { name: selectedSource?.sourceType === 'card' ? 'Credit Card' : (selectedSource as LinkedAccount)?.name, logoUrl: selectedSource?.sourceType === 'card' ? undefined : (selectedSource as LinkedAccount)?.logoUrl };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
             <PaymentGatewayModal
                isOpen={isPaymentGatewayOpen}
                onClose={() => setIsPaymentGatewayOpen(false)}
                onSubmit={handlePaymentGatewaySubmit} // Pass the centralized submit handler
                isLoading={isProcessingPayment}
                amount={parseFloat(amount || '0')}
                recipient={recipient}
            />
            <Header title={title} onBack={handleBack} />
            <main className="flex-1 p-6">
                {renderContent()}
            </main>
        </div>
    );
};

export default DepositWithdrawScreen;