import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface PassportFeeScreenProps {
    user: User;
    onPaymentSuccess: () => void;
}

type AppType = 'new' | 'renewal';
type DeliveryType = 'regular' | 'express';

const PASSPORT_FEES = {
    renewal: {
        regular: 4025,
        express: 6325,
    },
    new: {
        regular: 4025,
        express: 6325,
    }
};

const PassportFeeScreen: React.FC<PassportFeeScreenProps> = ({ user, onPaymentSuccess }) => {
    const [appType, setAppType] = useState<AppType>('renewal');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('regular');
    const [applicationId, setApplicationId] = useState('');
    
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    const amount = useMemo(() => PASSPORT_FEES[appType][deliveryType], [appType, deliveryType]);

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount > user.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'passport_fee' as const,
            applicationId: applicationId,
            amount: amount,
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onPaymentSuccess();
        }
    };

    return (
        <>
            <PaymentGatewayModal
                isOpen={isPaymentGatewayOpen}
                onClose={() => setIsPaymentGatewayOpen(false)}
                onSubmit={handlePaymentGatewaySubmit}
                isLoading={isProcessingPayment}
                amount={amount}
                recipient={{ name: 'Government Treasury', logoUrl: 'https://i.imgur.com/example4.png' }}
            />
            <div className="flex flex-col h-screen bg-background text-foreground">
                <Header title="Passport Fee" onBack={() => navigate(-1)} />
                <form onSubmit={handlePay} className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Application Type</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
                                <button type="button" onClick={() => setAppType('renewal')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${appType === 'renewal' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Renewal</button>
                                <button type="button" onClick={() => setAppType('new')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${appType === 'new' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>New Application</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Delivery Type</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
                                <button type="button" onClick={() => setDeliveryType('regular')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${deliveryType === 'regular' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Regular</button>
                                <button type="button" onClick={() => setDeliveryType('express')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${deliveryType === 'express' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Express</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="applicationId" className="block text-sm font-medium text-muted-foreground">Application ID</label>
                            <input
                                id="applicationId"
                                type="text"
                                value={applicationId}
                                onChange={e => setApplicationId(e.target.value)}
                                className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md"
                                placeholder="e.g., E1234567"
                                required
                            />
                        </div>
                        <div className="p-4 bg-card rounded-lg border border-border flex justify-between items-center">
                            <span className="font-semibold text-muted-foreground">Total Fee</span>
                            <span className="font-bold text-2xl text-card-foreground">{getCurrencySymbol('BDT')}{amount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end">
                        <button type="submit" disabled={!applicationId} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50">
                            Pay Now
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default PassportFeeScreen;