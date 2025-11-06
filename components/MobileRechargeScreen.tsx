

import React, { useState, useEffect } from 'react';
import { User, MobileOperator, Transaction } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { CheckCircleIcon } from './icons';
import toast from 'react-hot-toast';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { getCurrencySymbol } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface MobileRechargeScreenProps {
    user: User;
    onRechargeSuccess: () => void;
}

const amountPresets = [20, 50, 100, 200, 500, 1000];

const MobileRechargeScreen: React.FC<MobileRechargeScreenProps> = ({ user, onRechargeSuccess }) => {
    const [operators, setOperators] = useState<MobileOperator[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<MobileOperator | null>(null);
    const [phone, setPhone] = useState(user.phone);
    const [amount, setAmount] = useState('');
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    useEffect(() => {
        api.getMobileOperators().catch(err => {
            console.error("Failed to load mobile operators:", err);
            toast.error("Couldn't load mobile operators.");
        }).then(ops => {
            if(ops) setOperators(ops);
        });
    }, []);

    const handleRecharge = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOperator || !phone || !amount || parseFloat(amount) <= 0) return;
        if (parseFloat(amount) > user.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        if (!selectedOperator || !phone || !amount) return; // Should not happen if validation passed

        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'mobile_recharge' as const,
            operatorName: selectedOperator.name,
            phone: phone,
            amount: parseFloat(amount),
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onRechargeSuccess();
            // Navigation to success screen is now handled by processPayment
        } else {
            // Error toast handled by processPayment
        }
    };
    
    return (
        <>
        <PaymentGatewayModal
            isOpen={isPaymentGatewayOpen}
            onClose={() => setIsPaymentGatewayOpen(false)}
            onSubmit={handlePaymentGatewaySubmit} // Pass the centralized submit handler
            isLoading={isProcessingPayment}
            amount={parseFloat(amount || '0')}
            recipient={{ name: selectedOperator?.name || 'Mobile Recharge', logoUrl: selectedOperator?.logoUrl }}
        />
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header title="Mobile Recharge" onBack={() => navigate(-1)} />
            <form onSubmit={handleRecharge} className="flex-1 flex flex-col p-6 space-y-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-card border border-input text-card-foreground rounded-lg shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="+8801XXXXXXXXX"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Select Operator</label>
                    <div className="grid grid-cols-4 gap-3">
                        {operators.map(op => (
                            <button
                                type="button"
                                key={op.id}
                                onClick={() => setSelectedOperator(op)}
                                className={`p-2 rounded-lg border-2 transition-colors ${selectedOperator?.id === op.id ? 'bg-primary/20 border-primary' : 'bg-card border-border hover:border-muted-foreground'}`}
                            >
                                <img src={op.logoUrl} alt={op.name} className="h-8 w-full object-contain" />
                            </button>
                        ))}
                    </div>
                </div>

                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground">Amount (BDT)</label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 bg-card border border-input text-card-foreground rounded-lg shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter amount"
                        required
                    />
                     <div className="grid grid-cols-3 gap-2 mt-2">
                        {amountPresets.map(preset => (
                            <button
                                type="button"
                                key={preset}
                                onClick={() => setAmount(preset.toString())}
                                className="py-2 bg-card border border-border rounded-md text-sm text-card-foreground hover:bg-muted"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex items-end">
                     <button
                        type="submit"
                        disabled={isProcessingPayment || !selectedOperator || !phone || !amount}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
                    >
                        {`Recharge ${amount ? getCurrencySymbol('BDT') + amount : ''}`}
                    </button>
                </div>
            </form>
        </div>
        </>
    );
};

export default MobileRechargeScreen;