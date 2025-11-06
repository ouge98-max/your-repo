

import React, { useState } from 'react';
import { Header } from './Header';
import { api } from '../services/mockApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { User } from '../types';

const AddInternationalAccountScreen: React.FC<{ onAccountAdded: () => void, currentUser: User }> = ({ onAccountAdded, currentUser }) => {
    const [provider, setProvider] = useState<'PayPal' | 'Wise'>('PayPal');
    const [email, setEmail] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLinking(true);
        try {
            await api.linkInternationalAccount(currentUser.id, { email, providerName: provider });
            toast.success(`${provider} account linked successfully!`);
            onAccountAdded();
            navigate('/me/payment-methods'); // Navigate to payment methods to see the new account
        } catch (error) {
            toast.error(`Failed to link ${provider} account.`);
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="Link International Account" onBack={() => navigate(-1)} />
            <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Select Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setProvider('PayPal')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${provider === 'PayPal' ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                                <img src="https://i.imgur.com/22S0hpx.png" alt="PayPal" className="h-6"/>
                            </button>
                            <button type="button" onClick={() => setProvider('Wise')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${provider === 'Wise' ? 'bg-primary/10 border-primary' : 'bg-card border-border'}`}>
                                 <img src="https://i.imgur.com/5c2223s.png" alt="Wise" className="h-6"/>
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Account Email</label>
                        <input
                            id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-ring focus:border-ring"
                            placeholder={`Your ${provider} email address`} required
                        />
                    </div>
                </div>
                 <div className="flex-1 flex items-end">
                    <button type="submit" disabled={isLinking || !email} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isLinking && <Loader2 className="h-5 w-5 animate-spin" />}
                        {isLinking ? 'Linking...' : 'Link Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddInternationalAccountScreen;
