

import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { api } from '../services/mockApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard } from '../types';

interface AddCardScreenProps {
    onCardAdded: () => void;
}

// Luhn algorithm check
const luhnCheck = (val: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = val.length - 1; i >= 0; i--) {
        let digit = parseInt(val.charAt(i));
        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

const AddCardScreen: React.FC<AddCardScreenProps> = ({ onCardAdded }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const navigate = useNavigate();

    const cardBrand = useMemo(() => {
        if (cardNumber.startsWith('4')) return 'visa';
        if (cardNumber.startsWith('5')) return 'mastercard';
        return 'unknown';
    }, [cardNumber]);

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const matches = cleaned.match(/(\d{1,4})/g);
        return matches ? matches.join(' ') : '';
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 3) {
            return `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };
    
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        const cleanedCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanedCardNumber.length < 16 || !luhnCheck(cleanedCardNumber)) {
            newErrors.cardNumber = "Invalid card number.";
        }
        if (!cardName.trim()) {
            newErrors.cardName = "Cardholder name is required.";
        }
        const [month, year] = expiry.split(' / ');
        if (!month || !year || month.length !== 2 || year.length !== 2) {
             newErrors.expiry = "Invalid expiry date.";
        } else {
            const expMonth = parseInt(month);
            const expYear = parseInt(year);
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear() % 100;
            if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
                newErrors.expiry = "Card has expired.";
            }
        }
        if (cvv.length < 3) {
            newErrors.cvv = "Invalid CVV.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLinkCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsLinking(true);
        try {
            await api.linkCreditCard('user-1', {
                number: cardNumber.replace(/\s/g, ''),
                expiry: expiry.replace(' / ', '/'),
                brand: cardBrand,
            });
            toast.success("Card linked successfully!");
            onCardAdded();
            navigate(-1);
        } catch (error) {
            toast.error("Failed to link card.");
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="Add New Card" onBack={() => navigate(-1)} />
            <main className="flex-1 overflow-y-auto p-6">
                {/* Card Display */}
                <div className="relative p-4 bg-card rounded-xl border border-border shadow-lg text-card-foreground font-mono mb-8">
                    <div className="flex justify-between items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        {cardBrand !== 'unknown' && <img src={cardBrand === 'visa' ? 'https://i.imgur.com/gTUMp3A.png' : 'https://i.imgur.com/MAuz2i7.png'} alt={cardBrand} className="h-8" />}
                    </div>
                    <p className="text-xl tracking-widest mt-6 h-7">{cardNumber || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between items-end mt-2 text-xs">
                        <div>
                            <p className="text-muted-foreground">CARDHOLDER</p>
                            <p className="font-semibold tracking-wider h-4">{cardName || 'YOUR NAME'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">EXPIRES</p>
                            <p className="font-semibold tracking-wider h-4">{expiry || 'MM/YY'}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleLinkCard} className="space-y-4">
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-muted-foreground">Card Number</label>
                        <input id="cardNumber" type="tel" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} maxLength={19}
                            className={`mt-1 block w-full bg-input text-foreground px-3 py-2 border rounded-md shadow-sm ${errors.cardNumber ? 'border-destructive' : 'border-border'}`} required />
                        {errors.cardNumber && <p className="text-destructive text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div>
                        <label htmlFor="cardName" className="block text-sm font-medium text-muted-foreground">Cardholder Name</label>
                        <input id="cardName" type="text" value={cardName} onChange={e => setCardName(e.target.value)}
                            className={`mt-1 block w-full bg-input text-foreground px-3 py-2 border rounded-md shadow-sm ${errors.cardName ? 'border-destructive' : 'border-border'}`} required />
                        {errors.cardName && <p className="text-destructive text-xs mt-1">{errors.cardName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiry" className="block text-sm font-medium text-muted-foreground">Expiry Date</label>
                            <input id="expiry" type="tel" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" maxLength={7}
                                className={`mt-1 block w-full bg-input text-foreground px-3 py-2 border rounded-md shadow-sm ${errors.expiry ? 'border-destructive' : 'border-border'}`} required />
                             {errors.expiry && <p className="text-destructive text-xs mt-1">{errors.expiry}</p>}
                        </div>
                         <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-muted-foreground">CVV</label>
                            <input id="cvv" type="tel" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} maxLength={4}
                                className={`mt-1 block w-full bg-input text-foreground px-3 py-2 border rounded-md shadow-sm ${errors.cvv ? 'border-destructive' : 'border-border'}`} required />
                            {errors.cvv && <p className="text-destructive text-xs mt-1">{errors.cvv}</p>}
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={isLinking} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                            {isLinking ? 'Linking Card...' : 'Link Card'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default AddCardScreen;