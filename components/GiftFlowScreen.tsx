

import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { getCurrencySymbol } from '../utils/currency';
import { Avatar } from './Avatar';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface GiftFlowScreenProps {
    currentUser: User;
    onTransactionComplete: () => void;
    usersMap: Map<string, User>;
    processPayment: ReturnType<typeof useAppContext>['processPayment']; // Pass processPayment
}

const GiftFlowScreen: React.FC<GiftFlowScreenProps> = ({ currentUser, onTransactionComplete, usersMap, processPayment }) => {
    const { productId, recipientId } = useParams<{ productId: string, recipientId: string }>();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [recipient, setRecipient] = useState<User | null>(null);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [giftMessage, setGiftMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway

    useEffect(() => {
        if (!productId || !recipientId) {
            toast.error("Missing gift details.");
            navigate('/');
            return;
        }

        Promise.all([
            api.getProductById(productId),
        ]).then(([productData]) => {
            setProduct(productData || null);
            setRecipient(usersMap.get(recipientId) || null);
            if (!productData || !usersMap.has(recipientId)) {
                toast.error("Could not find product or recipient.");
                navigate('/');
            }
            setIsLoading(false);
        });
    }, [productId, recipientId, usersMap, navigate]);

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliveryAddress.trim()) {
            toast.error("Please enter a delivery address.");
            return;
        }
        if (product && product.price > currentUser.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        setIsPaymentOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        if (!product || !recipientId || !productId) return; // Should not happen

        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'purchase_as_gift' as const,
            recipientId: recipientId,
            productId: productId,
            deliveryAddress: deliveryAddress,
            giftMessage: giftMessage,
            amount: product.price, // Add amount to match the updated PaymentDetails type
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentOpen(false);

        if (transaction) {
            toast.success(`Gift sent to ${recipient!.name}!`); // Toast moved here for consistency
            onTransactionComplete();
            const chat = await api.getOrCreateChat(currentUser.id, recipientId);
            navigate(`/chats/${chat.id}`);
            // Navigation to success screen is now handled by processPayment
        } else {
            // Error toast handled by processPayment
        }
    };
    
    if (isLoading || !product || !recipient) {
        return (
            <div className="flex flex-col h-screen bg-background">
                <Header title="Preparing Gift" onBack={() => navigate(-1)} />
                <p className="text-center p-8 text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <>
        <PaymentGatewayModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onSubmit={handlePaymentGatewaySubmit} // Pass the centralized submit handler
            isLoading={isProcessingPayment}
            amount={product.price}
            recipient={recipient}
        />
        <div className="flex flex-col h-screen bg-background">
            <Header title="Confirm Gift" onBack={() => navigate(-1)} />
            <form onSubmit={handleConfirm} className="flex-1 overflow-y-auto p-4">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Recipient Info */}
                    <div className="bg-card p-4 rounded-lg border flex items-center gap-4">
                        <Avatar user={recipient} />
                        <div>
                            <p className="text-sm text-muted-foreground">Sending to</p>
                            <p className="font-semibold text-card-foreground">{recipient.name}</p>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-card p-4 rounded-lg border flex items-center gap-4">
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                        <div className="flex-1">
                             <p className="font-semibold text-card-foreground">{product.name}</p>
                             <p className="font-bold text-primary">{getCurrencySymbol('BDT')}{product.price.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-card p-4 rounded-lg border space-y-4">
                        <div>
                            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-muted-foreground">Recipient's Delivery Address</label>
                            <textarea id="deliveryAddress" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required rows={3}
                                className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm" placeholder="e.g., House 123, Road 4, Banani, Dhaka" />
                        </div>
                        <div>
                            <label htmlFor="giftMessage" className="block text-sm font-medium text-muted-foreground">Gift Message (Optional)</label>
                            <textarea id="giftMessage" value={giftMessage} onChange={e => setGiftMessage(e.target.value)} rows={2}
                                className="mt-1 block w-full border-input bg-background text-foreground rounded-md shadow-sm" placeholder="Write a personal message..." />
                        </div>
                    </div>

                    <button type="submit" disabled={isProcessingPayment} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50">
                        {isProcessingPayment ? 'Processing...' : `Confirm & Pay ${getCurrencySymbol('BDT')}${product.price.toLocaleString()}`}
                    </button>
                </div>
            </form>
        </div>
        </>
    );
}

export default GiftFlowScreen;