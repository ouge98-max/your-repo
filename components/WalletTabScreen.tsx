import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Transaction } from '../types';
import { Header } from './Header';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/mockApi';
import toast from 'react-hot-toast';
import { TransactionIcon } from './TransactionIcon';
import { isSentTransaction, SENT_TRANSACTION_TYPES } from '../utils/transactions';
import { ScanIcon, SparklesIcon, ArrowDownToLine, ArrowUpFromLine, Send, DevicePhoneMobileIcon, Receipt, BookUserIcon, Globe, TrainFront, Bus, BarChart2, Phone, PiggyBank, CreditCardIcon, ChevronDown, Loader2Icon, ChevronRight } from './icons';
import { WalletCard } from './WalletCard';
import { Avatar } from './Avatar';
import { getCurrencySymbol } from '../utils/currency';

interface WalletTabScreenProps {
    user: User;
    onUpdateUser: () => void;
}

const QuickActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }> = ({ icon, label, onClick, disabled }) => (
    <button
        type="button" 
        onClick={onClick} 
        disabled={disabled}
        className="flex flex-col items-center space-y-2 text-center disabled:opacity-50 group"
        aria-label={label}
    >
        <div className="rounded-full p-4 bg-secondary group-hover:bg-muted transition-colors">
            {icon}
        </div>
        <span className="text-xs text-muted-foreground font-semibold">{label}</span>
    </button>
);

const ServiceButton: React.FC<{ icon: React.ReactNode, label: string, onClick?: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted transition-colors space-y-2">
        {icon}
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </button>
);

type SpendingCategory = 'Food & Drinks' | 'Bills & Utilities' | 'Services' | 'Transfers' | 'Shopping' | 'Travel' | 'Other';
const CATEGORY_COLORS: Record<SpendingCategory, string> = {
    'Food & Drinks': 'bg-yellow-400',
    'Bills & Utilities': 'bg-blue-400',
    'Services': 'bg-indigo-400',
    'Transfers': 'bg-red-400',
    'Shopping': 'bg-purple-400',
    'Travel': 'bg-orange-400',
    'Other': 'bg-gray-400',
};

const getCategory = (tx: Transaction): SpendingCategory => {
  const title = (tx.title || tx.subtitle || '').toLowerCase();
  const type = tx.type;

  if (title.includes('cafe') || title.includes('food')) return 'Food & Drinks';
  if (type === 'bill_payment' || title.includes('bill')) return 'Bills & Utilities';
  if (type === 'service') return 'Services';
  if (type === 'order_placed') return 'Shopping';
  if (type === 'train_ticket' || type === 'bus_ticket') return 'Travel';
  if (type === 'sent' || type === 'out') return 'Transfers';

  return 'Other';
};

const SUPPORTED_CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'INR'];


const WalletTabScreen: React.FC<WalletTabScreenProps> = ({ user, onUpdateUser }) => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [financialTip, setFinancialTip] = useState<string | null>(null);
    const [smartRecipient, setSmartRecipient] = useState<User | null>(null);
    const [spendingSummary, setSpendingSummary] = useState<{ total: number; categories: { name: SpendingCategory; amount: number; color: string; percentage: number }[] } | null>(null);
    
    const [displayCurrency, setDisplayCurrency] = useState('BDT');
    const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({ BDT: 1 });
    const [isRatesLoading, setIsRatesLoading] = useState(true);
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
    const currencyDropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const [txsResult, allUsers] = await Promise.all([
                    api.getTransactions(),
                    api.getAllUsers(),
                ]);

                if (!isMounted) return;
                
                const allTxs = txsResult.transactions;
                setTransactions(allTxs);

                // --- Calculations for new dashboard features ---
                const sentTxs = allTxs.filter(tx => isSentTransaction(tx.type));

                // 1. Smart Recipient Calculation
                if (sentTxs.length > 0) {
                    const peerFrequency = sentTxs.reduce((acc, tx) => {
                        if (tx.peer.id !== user.id) { // Exclude self-transactions if any
                            acc[tx.peer.id] = (acc[tx.peer.id] || 0) + 1;
                        }
                        return acc;
                    }, {} as Record<string, number>);

                    const mostFrequentPeerId = Object.keys(peerFrequency).length > 0
                        // FIX: Explicitly type sort parameters to resolve potential type inference issues.
                        ? Object.entries(peerFrequency).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0][0]
                        : null;

                    if (mostFrequentPeerId) {
                        setSmartRecipient(allUsers.find(u => u.id === mostFrequentPeerId) || null);
                    }
                }

                // 2. Spending Summary Calculation
                const now = new Date();
                // FIX: Refactored date comparison for clarity and efficiency.
                const startOfMonthTimestamp = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                const spendingTxs = sentTxs.filter(tx => tx.timestamp >= startOfMonthTimestamp);
                const totalSpending = spendingTxs.reduce((sum, tx) => sum + (tx.amount || 0) + (tx.taxDetails?.amount || 0), 0);

                if (totalSpending > 0) {
                    const categories = spendingTxs.reduce((acc, tx) => {
                        const categoryName = getCategory(tx);
                        const amount = (tx.amount || 0) + (tx.taxDetails?.amount || 0);

                        let existing = acc.find(c => c.name === categoryName);
                        if (existing) {
                            existing.amount += amount;
                        } else {
                            acc.push({ name: categoryName, amount, color: CATEGORY_COLORS[categoryName], percentage: 0 });
                        }
                        return acc;
                    }, [] as { name: SpendingCategory; amount: number; color: string; percentage: number }[]);
                    
                    categories.forEach(c => c.percentage = (c.amount / totalSpending) * 100);
                    setSpendingSummary({ total: totalSpending, categories: categories.sort((a, b) => b.amount - a.amount) });
                }


                // 3. AI Financial Tip
                if (sentTxs.length > 3) {
                    try {
                        const prompt = `Based on these recent transactions, provide a very short, single-sentence financial tip or observation for the user. The tone should be encouraging and friendly, like a helpful assistant. Keep it under 15 words. Transactions: ${JSON.stringify(sentTxs.slice(0, 15).map(t => ({ title: t.title, amount: t.amount, type: t.type })))}.`;
                        const resp = await fetch('/api/gemini', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ model: 'gemini-2.5-flash', prompt }),
                        });
                        if (resp.ok) {
                            const data = await resp.json();
                            const text = (data?.text || '').trim();
                            if (isMounted && text) setFinancialTip(text);
                        } else {
                            console.error('Failed to get financial tip', await resp.text());
                        }
                    } catch (e) { console.error("Failed to get financial tip", e); }
                } else {
                    if (isMounted) setFinancialTip("Start making transactions to see personalized financial tips here!");
                }
                
            } catch (error) {
                console.error("Failed to fetch wallet data", error);
                toast.error("Could not load all wallet data.");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [user.id]);

    useEffect(() => {
        const fetchRates = async () => {
            setIsRatesLoading(true);
            const ratesToFetch = SUPPORTED_CURRENCIES.filter(c => c !== 'BDT');
            try {
                const ratePromises = ratesToFetch.map(c => api.getLiveExchangeRate(c));
                const resolvedRates = await Promise.all(ratePromises);
                const newRates = ratesToFetch.reduce((acc, currency, index) => {
                    acc[currency] = resolvedRates[index];
                    return acc;
                }, {} as { [key: string]: number });
                setExchangeRates(prev => ({ ...prev, ...newRates }));
            } catch (error) {
                toast.error("Could not load exchange rates.");
            } finally {
                setIsRatesLoading(false);
            }
        };
        fetchRates();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
                setIsCurrencyDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSmartPay = async (recipient: User) => {
        if (!recipient) return;
        toast.loading(`Opening chat with ${recipient.name}...`);
        try {
            const chat = await api.getOrCreateChat(user.id, recipient.id);
            toast.dismiss();
            navigate(`/chats/${chat.id}`);
        } catch(e) {
            toast.dismiss();
            toast.error("Could not open chat.");
        }
    };

    const rate = exchangeRates[displayCurrency] || 1;
    const displayBalance = user.wallet.balance / rate;
    const displaySavings = (user.savings?.balance || 0) / rate;

    const renderHeaderRightAction = () => (
        <div className="relative" ref={currencyDropdownRef}>
            <button
                onClick={() => setIsCurrencyDropdownOpen(prev => !prev)}
                disabled={isRatesLoading}
                className="flex items-center gap-1 font-semibold text-primary p-2 rounded-md hover:bg-muted disabled:opacity-50"
            >
                {isRatesLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : displayCurrency}
                <ChevronDown size={16} />
            </button>
            {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-popover rounded-md shadow-lg z-20 border border-border animate-fade-in-up">
                    <ul className="py-1">
                        {SUPPORTED_CURRENCIES.map(c => (
                            <li key={c}>
                                <button
                                    onClick={() => {
                                        setDisplayCurrency(c);
                                        setIsCurrencyDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted"
                                >
                                    {c}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header
                title="My Wallet"
                rightAction={renderHeaderRightAction()}
            />
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="animate-balance-pop-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <WalletCard user={user} displayBalance={displayBalance} displayCurrency={displayCurrency} />
                </div>

                {/* Savings Pot Card */}
                 <Link to="/me/savings" className="block bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-0.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <PiggyBank className="h-6 w-6 text-white"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Savings Pot</h3>
                                <p className="text-xs text-white/80">Set money aside</p>
                            </div>
                        </div>
                        <p className="text-xl font-bold text-white">{getCurrencySymbol(displayCurrency)}{displaySavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </Link>

                {/* Quick Actions Card */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4">
                     <div className="grid grid-cols-5 gap-2 text-foreground">
                        <QuickActionButton icon={<Send className="h-6 w-6 text-primary"/>} label="Send" onClick={() => navigate('/send')} />
                        <QuickActionButton icon={<ScanIcon className="h-6 w-6 text-primary"/>} label="Scan" onClick={() => navigate('/scanner')} />
                        <QuickActionButton icon={<ArrowDownToLine className="h-6 w-6 text-primary"/>} label="Deposit" onClick={() => navigate('/wallet/deposit')} />
                        <QuickActionButton icon={<ArrowUpFromLine className="h-6 w-6 text-primary"/>} label="Withdraw" onClick={() => navigate('/wallet/withdraw')} />
                        {smartRecipient ? (
                            <button onClick={() => handleSmartPay(smartRecipient)} className="flex flex-col items-center space-y-2 text-center group">
                                <div className="relative">
                                     <Avatar user={smartRecipient} size="md" className="h-16 w-16" />
                                     <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-card">
                                        <Send size={12} className="text-primary-foreground"/>
                                     </div>
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold">Pay Again</span>
                            </button>
                        ) : (
                           <div className="flex flex-col items-center space-y-2 text-center opacity-50">
                                <div className="rounded-full h-16 w-16 bg-secondary flex items-center justify-center">
                                     <Send size={24} className="text-muted-foreground"/>
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold">Pay Again</span>
                           </div>
                        )}
                    </div>
                </div>

                {/* Payment Methods Card */}
                <Link to="/me/payment-methods" className="block bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-sm hover:bg-muted transition-colors">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary rounded-full">
                                <CreditCardIcon className="h-6 w-6 text-secondary-foreground"/>
                            </div>
                            <div>
                                <h3 className="font-bold text-card-foreground">Payment Methods</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage linked accounts & cards
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                </Link>

                {/* Live AI Assistant Card */}
                <div 
                    onClick={() => navigate('/live-chat')}
                    className="group relative block p-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-indigo-600 to-purple-700"
                >
                    <div className="absolute inset-0 bg-repeat opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}} />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Live AI Assistant</h2>
                            <p className="text-white/80 text-sm mt-1">Talk to your personal assistant</p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <SparklesIcon className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>

                {/* Spending Summary Card */}
                {spendingSummary && (
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-card-foreground flex items-center gap-2"><BarChart2 size={16}/> This Month's Spending</h3>
                            <Link to="/me/budget" className="text-sm font-semibold text-primary hover:text-primary/90">Details</Link>
                        </div>
                        <p className="text-3xl font-bold text-card-foreground">৳{spendingSummary.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        <div className="mt-3 space-y-2">
                            {spendingSummary.categories.slice(0, 3).map(cat => (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                                        <span>{cat.name}</span>
                                        <span>{Math.round(cat.percentage)}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* AI Financial Tip Card */}
                {(financialTip || loading) && (
                     <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4">
                        <h3 className="font-semibold text-card-foreground mb-2">AI Financial Tip</h3>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-full mt-1">
                                <SparklesIcon className="h-5 w-5 text-indigo-400" />
                            </div>
                            {loading && !financialTip ? (
                                <div className="space-y-2 flex-1 pt-1"><div className="h-4 bg-muted rounded w-full animate-pulse"></div><div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div></div>
                            ) : financialTip ? (
                                <p className="text-muted-foreground text-sm italic">"{financialTip}"</p>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Services Card */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4">
                     <h3 className="font-semibold text-card-foreground mb-3">Services</h3>
                     <div className="grid grid-cols-4 gap-4">
                        <ServiceButton icon={<DevicePhoneMobileIcon className="h-6 w-6 text-cyan-400"/>} label="Recharge" onClick={() => navigate('/recharge')} />
                        <ServiceButton icon={<Receipt className="h-6 w-6 text-yellow-400"/>} label="Pay Bill" onClick={() => navigate('/bill-payment')} />
                        <ServiceButton icon={<TrainFront className="h-6 w-6 text-orange-400"/>} label="Train" onClick={() => navigate('/train-ticket')} />
                        <ServiceButton icon={<Bus className="h-6 w-6 text-lime-400"/>} label="Bus" onClick={() => navigate('/bus-ticket')} />
                        <ServiceButton icon={<BookUserIcon className="h-6 w-6 text-purple-400"/>} label="Passport" onClick={() => navigate('/passport-fee')} />
                        <ServiceButton icon={<Globe className="h-6 w-6 text-teal-400"/>} label="Global" onClick={() => navigate('/international-transfer')} />
                    </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                    <div className="flex justify-between items-center p-4">
                        <h3 className="font-semibold text-card-foreground">Recent Activity</h3>
                        <Link to="/history" className="text-sm font-semibold text-primary hover:text-primary/90">View all</Link>
                    </div>
                    {transactions.length > 0 ? (
                        <ul className="divide-y divide-border">
                            {transactions.slice(0, 4).map(tx => {
                                const isSent = isSentTransaction(tx.type);
                                return (
                                    <li key={tx.id}>
                                        <Link to={`/history/${tx.id}`} className="flex items-center p-3 gap-3 cursor-pointer hover:bg-muted">
                                            <TransactionIcon type={tx.type} />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-card-foreground truncate">{tx.title || 'Transaction'}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <p className={`font-bold text-sm ${isSent ? 'text-destructive' : 'text-primary'}`}>
                                                {isSent ? '-' : '+'} {tx.amount.toLocaleString('en-IN')} {tx.currency}
                                            </p>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-6 px-4">No recent transactions.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WalletTabScreen;
