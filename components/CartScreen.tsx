


import React, { useState, useEffect, useMemo } from 'react';
import { User, Product } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { Avatar } from './Avatar';
import { Minus, Plus, Trash2, MapPinIcon as MapPin } from './icons';
import { ShoppingBagIcon as ShoppingBag } from './icons';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { getCurrencySymbol } from '../utils/currency';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface CartScreenProps {
    currentUser: User;
    usersMap: Map<string, User>;
    onSuccessfulCheckout: () => void;
}

type CartItemWithProduct = {
    product: Product;
    quantity: number;
    deliveryAddress?: string;
}

const CartScreen: React.FC<CartScreenProps> = ({ currentUser, usersMap, onSuccessfulCheckout }) => {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    useEffect(() => {
        api.getProducts().then(products => {
            setAllProducts(products);
            setIsLoading(false);
        });
    }, []);

    const cartItemsWithDetails: CartItemWithProduct[] = useMemo(() => {
        if (isLoading) return [];
        return (cartItems as any[]).reduce((acc: CartItemWithProduct[], item) => {
            const product = allProducts.find(p => p.id === item.productId);
            if (product) {
                acc.push({ product, quantity: item.quantity, deliveryAddress: item.deliveryAddress });
            }
            return acc;
        }, []);
    }, [cartItems, allProducts, isLoading]);
    
    const itemsBySeller = useMemo(() => {
        return cartItemsWithDetails.reduce((acc, item) => {
            const sellerId = item.product.sellerId;
            if (!acc[sellerId]) {
                acc[sellerId] = [];
            }
            acc[sellerId].push(item);
            return acc;
        }, {} as { [sellerId: string]: CartItemWithProduct[] });
    }, [cartItemsWithDetails]);

    const grandTotal = useMemo(() => {
        return cartItemsWithDetails.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cartItemsWithDetails]);

    const handleCheckout = () => {
        if (grandTotal <= 0) {
            toast.error("Cart is empty or total is zero.");
            return;
        }
        if (grandTotal > currentUser.wallet.balance) {
            toast.error("Insufficient balance to complete this purchase.");
            return;
        }
        // Check if all items have delivery addresses
        const missingAddress = cartItemsWithDetails.some(item => !item.deliveryAddress);
        if (missingAddress) {
            toast.error("Please set a delivery address for all items in your cart.");
            return;
        }

        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        setIsProcessingPayment(true);
        // Prepare cart items for the centralized payment
        const itemsToPurchase = cartItemsWithDetails.map(item => ({
            productId: item.product.id,
            deliveryAddress: item.deliveryAddress,
        }));

        const paymentDetails = {
            type: 'buy_cart_items' as const,
            items: itemsToPurchase,
            grandTotal: grandTotal,
            amount: grandTotal,
        };
        
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            toast.success('All purchases successful!'); // Toast moved here for consistency
            clearCart();
            onSuccessfulCheckout(); // Refresh user data
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
                amount={grandTotal}
                recipient={{ name: 'OumaGe Marketplace', logoUrl: '/logo.jpg' }} // Use /logo.jpg for OumaGe
            />
            <div className="flex flex-col h-screen bg-gray-50">
                <Header title="My Cart" onBack={() => navigate(-1)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-md mx-auto p-4 pb-32">
                        {isLoading ? (
                            <p className="text-center text-gray-500">Loading cart...</p>
                        ) : cartItemsWithDetails.length === 0 ? (
                            <div className="text-center py-24 text-gray-400">
                                <ShoppingBag size={64} className="mx-auto" />
                                <h2 className="mt-4 text-xl font-bold text-gray-700">Your cart is empty</h2>
                                <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(itemsBySeller).map(([sellerId, items]) => {
                                    const seller = usersMap.get(sellerId);
                                    const subtotal = (items as CartItemWithProduct[]).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                                    return (
                                        <div key={sellerId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                                                {seller && <Avatar user={seller} size="sm" className="h-8 w-8" />}
                                                <span className="font-semibold text-gray-800">{seller?.name || 'Unknown Seller'}</span>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                                {(items as CartItemWithProduct[]).map((item) => {
                                                    const { product, quantity } = item;
                                                    return (
                                                    <div key={product.id} className="p-3 flex items-center gap-4">
                                                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1 bg-gray-200 rounded-full"><Minus size={14} /></button>
                                                                <span className="font-bold w-6 text-center">{quantity}</span>
                                                                <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1 bg-gray-200 rounded-full"><Plus size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-800">{getCurrencySymbol('BDT')}{(product.price * quantity).toLocaleString()}</p>
                                                            <button onClick={() => removeFromCart(product.id)} className="text-xs text-gray-500 hover:text-red-500 mt-1">Remove</button>
                                                        </div>
                                                    </div>
                                                );
                                                })}
                                            </div>
                                            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                                                <p className="text-sm">Subtotal: <span className="font-bold">{getCurrencySymbol('BDT')}{subtotal.toLocaleString()}</span></p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
                <footer className="fixed bottom-0 left-0 right-0 md:relative bg-white/80 backdrop-blur-lg border-t border-gray-200 p-4">
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold text-gray-800">Grand Total</span>
                            <span className="text-2xl font-bold text-gray-900">{getCurrencySymbol('BDT')}{grandTotal.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={handleCheckout} 
                            disabled={cartItems.length === 0 || isLoading}
                            className="w-full bg-brandGreen-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            Proceed to Checkout ({cartItems.length})
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default CartScreen;
