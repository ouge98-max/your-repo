import React, { useState, useEffect } from 'react';
import { User, Transaction, SavingsGoalSuggestion } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, ArrowDownToLine, ArrowUpFromLine, X, SparklesIcon, Loader2Icon } from './icons';
import { TransactionIcon } from './TransactionIcon';
import { getCurrencySymbol } from '../utils/currency';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';
import { isSentTransaction } from '../utils/transactions';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface SavingsScreenProps {
    user: User;
    onInitiateTransfer: (amount: number, mode: 'deposit' | 'withdraw') => void;
}

const AmountModal: React.FC<{
    mode: 'deposit' | 'withdraw',
    onClose: () => void,
    onConfirm: (amount: number) => void,
    balance: number
}> = ({ mode, onClose, onConfirm, balance }) => {
    const [amount, setAmount] = useState('');
    const title = mode === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings';
    const maxAmount = mode === 'deposit' ? balance : (balance); // Simplified for now
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            if (numAmount > maxAmount) {
                alert(`Amount cannot exceed your ${mode === 'deposit' ? 'wallet' : 'savings'} balance of ${getCurrencySymbol('BDT')}${maxAmount.toLocaleString()}`);
                return;
            }
            onConfirm(numAmount);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-popover text-popover-foreground rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button type="button" onClick={onClose}><X/></button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">{getCurrencySymbol('BDT')}</span>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                               placeholder="0.00" autoFocus
                               className="w-full text-center text-4xl font-bold p-4 pl-12 bg-input border-2 border-border text-foreground rounded-lg"
                        />
                    </div>
                     <p className="text-xs text-muted-foreground text-center mt-2">Available: {getCurrencySymbol('BDT')}{maxAmount.toLocaleString()}</p>
                    <button type="submit" disabled={!amount || parseFloat(amount) <= 0} className="w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

const SavingsScreen: React.FC<SavingsScreenProps> = ({ user, onInitiateTransfer }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; mode: 'deposit' | 'withdraw' }>({ isOpen: false, mode: 'deposit' });
    const [suggestion, setSuggestion] = useState<SavingsGoalSuggestion | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.getTransactions().then(txsResult => {
            setTransactions(txsResult.transactions.filter(t => t.type === 'savings_deposit' || t.type === 'savings_withdraw').sort((a,b) => b.timestamp - a.timestamp));
            setLoading(false);
        });
    }, [user]);
    
    const handleAmountConfirm = (amount: number) => {
        onInitiateTransfer(amount, modalInfo.mode);
        setModalInfo({ isOpen: false, mode: 'deposit' });
    };

    const handleGetSuggestion = async () => {
        setIsSuggesting(true);
        setSuggestion(null);
        try {
            const allTxsResult = await api.getTransactions();
            const sentTransactions = allTxsResult.transactions.filter(tx => isSentTransaction(tx.type)).slice(0, 20);
            if (sentTransactions.length < 5) {
                toast.error("Not enough transaction data for a good suggestion.");
                return;
            }

            const prompt = `Based on the user's recent spending, suggest a realistic and helpful savings goal. The user's wallet balance is ${user.wallet.balance} BDT and current savings are ${user.savings?.balance || 0} BDT. Recent transactions: ${JSON.stringify(sentTransactions.map(t => ({ title: t.title, amount: t.amount })))}. Suggest a goal that seems achievable within 6-12 months.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            goal_name: { type: Type.STRING, description: "A catchy name for the savings goal (e.g., 'Emergency Fund Builder', 'Dream Gadget Fund')." },
                            target_amount: { type: Type.NUMBER, description: "The total amount to save for this goal in BDT." },
                            monthly_deposit: { type: Type.NUMBER, description: "A suggested monthly deposit amount in BDT." },
                            timeline_months: { type: Type.NUMBER, description: "The estimated number of months to reach the goal." },
                            reason: { type: Type.STRING, description: "A short, encouraging reason why this goal is suitable for the user based on their spending." }
                        },
                        required: ['goal_name', 'target_amount', 'monthly_deposit', 'timeline_months', 'reason']
                    }
                }
            });
            
            const result: SavingsGoalSuggestion = JSON.parse(response.text);
            setSuggestion(result);

        } catch (error) {
            console.error("Failed to get savings suggestion:", error);
            toast.error("AI suggestion failed. Please try again.");
        } finally {
            setIsSuggesting(false);
        }
    };


    return (
        <>
        {modalInfo.isOpen && (
            <AmountModal 
                mode={modalInfo.mode}
                onClose={() => setModalInfo({ isOpen: false, mode: 'deposit' })}
                onConfirm={handleAmountConfirm}
                balance={modalInfo.mode === 'deposit' ? user.wallet.balance : user.savings?.balance || 0}
            />
        )}
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="Savings Pot" onBack={() => navigate(-1)} />
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                 <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-sm opacity-80">Savings Balance</p>
                    <p className="text-4xl font-bold mt-1">{getCurrencySymbol('BDT')}{(user.savings?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 space-y-3">
                    <h3 className="font-semibold text-card-foreground">AI Savings Assistant</h3>
                    <button onClick={handleGetSuggestion} disabled={isSuggesting} className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary font-semibold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50">
                        {isSuggesting ? <Loader2Icon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
                        {isSuggesting ? 'Thinking...' : 'Suggest a Savings Goal'}
                    </button>
                    {suggestion && (
                        <div className="mt-4 pt-4 border-t border-border animate-fade-in-up">
                            <h4 className="font-bold text-lg text-card-foreground">{suggestion.goal_name}</h4>
                            <p className="text-sm text-muted-foreground italic mt-1">"{suggestion.reason}"</p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                <div className="bg-secondary p-2 rounded-md">
                                    <p className="text-xs font-semibold text-muted-foreground">Target</p>
                                    <p className="font-bold text-secondary-foreground">{getCurrencySymbol('BDT')}{suggestion.target_amount.toLocaleString()}</p>
                                </div>
                                <div className="bg-secondary p-2 rounded-md">
                                    <p className="text-xs font-semibold text-muted-foreground">Monthly</p>
                                    <p className="font-bold text-secondary-foreground">{getCurrencySymbol('BDT')}{suggestion.monthly_deposit.toLocaleString()}</p>
                                </div>
                                <div className="bg-secondary p-2 rounded-md">
                                    <p className="text-xs font-semibold text-muted-foreground">Timeline</p>
                                    <p className="font-bold text-secondary-foreground">~{suggestion.timeline_months} months</p>
                                </div>
                            </div>
                            <button onClick={() => toast.success('Goal started! (Feature coming soon)')} className="w-full mt-4 bg-primary text-primary-foreground font-bold py-2 rounded-lg">
                                Start this Goal
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setModalInfo({isOpen: true, mode: 'deposit'})} className="flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary/20">
                        <ArrowDownToLine size={20} /> Deposit
                    </button>
                    <button onClick={() => setModalInfo({isOpen: true, mode: 'withdraw'})} className="flex items-center justify-center gap-2 p-4 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary/20">
                        <ArrowUpFromLine size={20} /> Withdraw
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-foreground px-2 mb-2">Recent Savings Activity</h3>
                    {loading ? <p>Loading...</p> : transactions.length > 0 ? (
                        <ul className="bg-card border rounded-lg divide-y">
                            {transactions.map(tx => {
                                const isDeposit = tx.type === 'savings_deposit';
                                return (
                                    <li key={tx.id} className="flex items-center p-4">
                                        <TransactionIcon type={tx.type} />
                                        <div className="flex-1 ml-4">
                                            <p className="font-semibold text-card-foreground">{tx.title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                                        </div>
                                        <p className={`font-bold ${isDeposit ? 'text-primary' : 'text-destructive'}`}>
                                            {isDeposit ? '+' : '-'} {getCurrencySymbol('BDT')}{tx.amount.toLocaleString()}
                                        </p>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                         <div className="text-center py-16 text-muted-foreground">
                            <PiggyBank className="h-16 w-16 mx-auto" />
                            <p className="font-semibold mt-4">No Savings History</p>
                            <p className="text-sm">Deposit money to start building your savings!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
        </>
    );
};

export default SavingsScreen;