

import React, { useState, useEffect } from 'react';
import { MediaBubble } from './MediaBubble';
import { User, Biller, BillerCategory, Transaction } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { CheckCircleIcon, XCircleIcon, Bolt, Flame, Droplets, Wifi, Phone } from './icons';
import toast from 'react-hot-toast';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface BillPaymentScreenProps {
    user: User;
    onPaymentSuccess: () => void;
}

type Step = 'category' | 'biller' | 'form' | 'confirm';

const categoryIcons: { [key in BillerCategory]: React.FC<{className?: string}> } = {
    Electricity: Bolt,
    Gas: Flame,
    Water: Droplets,
    Internet: Wifi,
    Telephone: Phone,
};

const BillPaymentScreen: React.FC<BillPaymentScreenProps> = ({ user, onPaymentSuccess }) => {
    const [step, setStep] = useState<Step>('category');
    const [billers, setBillers] = useState<Biller[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<BillerCategory | null>(null);
    const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [amount, setAmount] = useState('');
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    useEffect(() => {
        api.getBillers().then(setBillers);
    }, []);

    const handleBack = () => {
        if (step === 'confirm') setStep('form');
        else if (step === 'form') {
            setStep('biller');
            setFormData({});
            setAmount('');
        }
        else if (step === 'biller') setStep('category');
        else navigate(-1);
    };

    const handleCategorySelect = (category: BillerCategory) => {
        setSelectedCategory(category);
        setStep('biller');
    };

    const handleBillerSelect = (biller: Biller) => {
        setSelectedBiller(biller);
        setStep('form');
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('confirm');
    };
    
    const triggerPaymentGateway = () => {
        if (parseFloat(amount) > user.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        if (!selectedBiller || !amount) return; // Should not happen if validation passed

        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'bill_payment' as const,
            biller: selectedBiller,
            amount: parseFloat(amount),
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onPaymentSuccess();
            // Navigation to success screen is now handled by processPayment
        } else {
            // Error toast handled by processPayment
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'category':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(categoryIcons) as BillerCategory[]).map(cat => {
                            const Icon = categoryIcons[cat];
                            return (
                                <button key={cat} onClick={() => handleCategorySelect(cat)} className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:bg-muted transition-colors aspect-square shadow-sm">
                                    <Icon className="h-10 w-10 text-primary mb-3" />
                                    <p className="font-semibold text-card-foreground">{cat}</p>
                                </button>
                            )
                        })}
                    </div>
                );
            
            case 'biller':
                const filteredBillers = billers.filter(b => b.category === selectedCategory);
                return (
                    <div className="space-y-3">
                        {filteredBillers.map(biller => (
                            <button key={biller.id} onClick={() => handleBillerSelect(biller)} className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors">
                                <MediaBubble
                                  src={biller.logoUrl}
                                  alt={biller.name}
                                  type="image"
                                  size={40}
                                  fit="contain"
                                  style={{ backgroundColor: '#ffffff', padding: '4px' }}
                                />
                                <p className="font-semibold text-card-foreground">{biller.name}</p>
                            </button>
                        ))}
                    </div>
                );

            case 'form':
                return (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="flex flex-col items-center text-center mb-6">
                            <MediaBubble
                              src={selectedBiller?.logoUrl || ''}
                              alt={selectedBiller?.name || 'Biller'}
                              type="image"
                              size={64}
                              fit="contain"
                              className="mb-3"
                              style={{ backgroundColor: '#ffffff', padding: '8px' }}
                            />
                            <h2 className="text-xl font-bold text-foreground">{selectedBiller?.name}</h2>
                        </div>
                        {selectedBiller?.fields.map(field => (
                            <div key={field.id}>
                                <label htmlFor={field.id} className="block text-sm font-medium text-muted-foreground">{field.label}</label>
                                <input id={field.id} type={field.type} value={formData[field.id] || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                                    className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring"
                                    placeholder={field.placeholder} required
                                />
                            </div>
                        ))}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground">Amount (BDT)</label>
                            <input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring"
                                placeholder="0.00" required
                            />
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90">
                                Proceed to Pay
                            </button>
                        </div>
                    </form>
                );
            case 'confirm':
                return (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold text-center text-foreground mb-2">Confirm Payment</h2>
                        <div className="bg-card rounded-lg p-4 my-6 space-y-3 text-sm border border-border">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Biller</span>
                                <span className="font-semibold text-card-foreground text-right">{selectedBiller?.name}</span>
                            </div>
                            {Object.entries(formData).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-muted-foreground">
                                    <span className="capitalize">{selectedBiller?.fields.find(f => f.id === key)?.label || key}</span>
                                    <span className="font-semibold text-card-foreground text-right">{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-3 border-t border-border font-bold text-lg text-foreground">
                                <span>Amount</span>
                                <span>৳{parseFloat(amount).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="button" onClick={triggerPaymentGateway} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90">
                                Pay Now
                            </button>
                        </div>
                    </div>
                );
        }
    };

    const getTitle = () => {
        switch(step) {
            case 'category': return 'Pay Bill';
            case 'biller': return selectedCategory;
            case 'form':
            case 'confirm':
                return selectedBiller?.name || 'Pay Bill';
            default: return 'Pay Bill';
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <PaymentGatewayModal
                isOpen={isPaymentGatewayOpen}
                onClose={() => setIsPaymentGatewayOpen(false)}
                onSubmit={handlePaymentGatewaySubmit} // Pass the centralized submit handler
                isLoading={isProcessingPayment}
                amount={parseFloat(amount || '0')}
                recipient={{ name: selectedBiller?.name || 'Biller', logoUrl: selectedBiller?.logoUrl }}
            />
            <Header title={getTitle() || 'Pay Bill'} onBack={handleBack} />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col">
                {renderContent()}
            </main>
        </div>
    );
};

export default BillPaymentScreen;