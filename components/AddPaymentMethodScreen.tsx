

import React from 'react';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { Banknote, CreditCardIcon, Globe } from './icons';

const AddPaymentMethodScreen: React.FC = () => {
    const navigate = useNavigate();

    const options = [
        { title: 'Link Bank or Mobile Account', subtitle: 'For local deposits & withdrawals', icon: <Banknote className="h-6 w-6 text-blue-500"/>, path: '/wallet/add' },
        { title: 'Add Credit/Debit Card', subtitle: 'For deposits & online payments', icon: <CreditCardIcon className="h-6 w-6 text-green-500"/>, path: '/wallet/add-card' },
        { title: 'Link International Account', subtitle: 'For international transfers (e.g., PayPal)', icon: <Globe className="h-6 w-6 text-purple-500"/>, path: '/me/add-international-account' },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header title="Add Payment Method" onBack={() => navigate(-1)} />
            <main className="flex-1 p-4">
                <ul className="space-y-3">
                    {options.map(opt => (
                        <li key={opt.path}>
                            <button onClick={() => navigate(opt.path)} className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left">
                                <div className="p-2 bg-gray-100 rounded-lg">{opt.icon}</div>
                                <div>
                                    <p className="font-semibold text-gray-900">{opt.title}</p>
                                    <p className="text-sm text-gray-500">{opt.subtitle}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

export default AddPaymentMethodScreen;
