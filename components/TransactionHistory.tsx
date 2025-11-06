import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction, User, TransactionAnalysisResult, TransactionType, FILTERABLE_TRANSACTION_TYPES } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { TransactionIcon } from './TransactionIcon';
import { isSentTransaction } from '../utils/transactions';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, Loader2Icon, Filter as FilterIcon, X } from './icons';
import { GoogleGenAI, Type } from '@google/genai';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TransactionSkeleton: React.FC = () => (
    <div className="flex-grow bg-card border border-border rounded-2xl overflow-hidden animate-pulse" role="status" aria-label="Loading transaction history">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center p-3 gap-3 h-[76px] border-b border-border last:border-b-0">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-muted rounded w-16"></div>
            </div>
        ))}
    </div>
);


const TransactionHistory: React.FC<{ user: User }> = ({ user }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysisResult, setAnalysisResult] = useState<TransactionAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Set<TransactionType>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // New state for infinite scroll
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchTransactions = useCallback(async (pageNum: number) => {
        // In a real app, filters would be sent to the API.
        // Here, we fetch and then filter client-side which is inefficient but necessary for the mock API.
        const result = await api.getTransactions(pageNum, 25);
        if (pageNum === 1) {
            setTransactions(result.transactions);
        } else {
            setTransactions(prev => [...prev, ...result.transactions]);
        }
        setHasMore(result.hasMore);
    }, []);

    // Initial load and filter changes
    useEffect(() => {
        setLoading(true);
        setTransactions([]);
        setPage(1);
        setHasMore(true);
        fetchTransactions(1).finally(() => setLoading(false));
    }, [activeFilters, fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        if (activeFilters.size === 0) {
            return transactions;
        }
        return transactions.filter(tx => activeFilters.has(tx.type));
    }, [transactions, activeFilters]);

    // Intersection Observer for infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastTransactionElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    // Effect to fetch more data when page changes
    useEffect(() => {
        if (page > 1) {
            setLoadingMore(true);
            fetchTransactions(page).finally(() => setLoadingMore(false));
        }
    }, [page, fetchTransactions]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const prompt = `Analyze these recent financial transactions and provide a summary, category breakdown, and a helpful tip. Transactions: ${JSON.stringify(transactions.slice(0, 30).map(t => ({ type: t.type, amount: t.amount, title: t.title })))}`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "A brief summary of spending habits." },
                            categories: {
                                type: Type.ARRAY,
                                description: "A breakdown of spending by category.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING },
                                        amount: { type: Type.NUMBER },
                                    },
                                    required: ['category', 'amount']
                                }
                            },
                            tip: { type: Type.STRING, description: "A short, actionable financial tip." }
                        },
                        required: ['summary', 'categories', 'tip']
                    }
                }
            });

            const text = response.text;
            if (!text) {
                toast.error("AI analysis returned an empty response.");
                return;
            }
            const result: TransactionAnalysisResult = JSON.parse(text);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Failed to analyze transactions:", error);
            toast.error("AI analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const toggleFilter = (type: TransactionType) => {
        setActiveFilters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header title="History" onBack={() => navigate(-1)} rightAction={
                 <button onClick={() => setShowFilters(true)} className="relative p-2 text-muted-foreground hover:text-foreground">
                    <FilterIcon className="h-6 w-6"/>
                    {activeFilters.size > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>}
                </button>
            } />
            
            {showFilters && (
                <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={() => setShowFilters(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-popover text-popover-foreground rounded-t-2xl p-4 animate-slide-in-bottom" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Filter by Type</h3>
                            <button onClick={() => setShowFilters(false)}><X/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {FILTERABLE_TRANSACTION_TYPES.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => toggleFilter(filter.key)}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${activeFilters.has(filter.key) ? 'bg-primary border-primary text-primary-foreground font-semibold' : 'bg-secondary border-border text-secondary-foreground'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                         <button onClick={() => { setActiveFilters(new Set()); setShowFilters(false); }} className="w-full mt-4 text-center text-sm font-semibold text-primary">
                           Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="max-w-md mx-auto p-4 space-y-4 flex flex-col flex-grow w-full">
                    <button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary font-semibold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50">
                        {isAnalyzing ? <Loader2Icon className="h-5 w-5 animate-spin"/> : <SparklesIcon className="h-5 w-5"/>}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Spending with AI'}
                    </button>
                    
                    {analysisResult && (
                        <div className="bg-card border border-border rounded-2xl p-4 animate-fade-in">
                             <h3 className="font-bold text-lg mb-2 text-card-foreground">Spending Analysis</h3>
                             <p className="text-sm text-muted-foreground italic">"{analysisResult.summary}"</p>
                             <div className="mt-2 text-sm text-muted-foreground"><strong>Tip:</strong> {analysisResult.tip}</div>
                        </div>
                    )}
                    
                    {loading ? (
                         <TransactionSkeleton />
                    ) : (
                        <div className="flex-grow bg-card border border-border rounded-2xl overflow-y-auto" role="list">
                            {filteredTransactions.length > 0 ? (
                                <ul>
                                    {filteredTransactions.map((tx, index) => {
                                        const isLastElement = index === filteredTransactions.length - 1;
                                        const isSent = isSentTransaction(tx.type);
                                        return (
                                            <li
                                                key={`${tx.id}-${index}`}
                                                ref={isLastElement ? lastTransactionElementRef : null}
                                            >
                                                <div
                                                    onClick={() => navigate(`/history/${tx.id}`)}
                                                    className="flex items-center p-3 gap-3 cursor-pointer hover:bg-muted border-b border-border h-[76px]"
                                                    role="listitem"
                                                >
                                                    <TransactionIcon type={tx.type} />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-card-foreground truncate">{tx.title || 'Transaction'}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className={`font-bold text-sm ${isSent ? 'text-destructive' : 'text-primary'}`}>
                                                        {isSent ? '-' : '+'} {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No transactions found.</p>
                            )}
                             {loadingMore && (
                                <div className="flex justify-center p-4">
                                    <Loader2Icon className="h-6 w-6 animate-spin text-primary"/>
                                </div>
                            )}
                            {!hasMore && filteredTransactions.length > 0 && (
                                <p className="text-center text-muted-foreground text-sm py-4">You've reached the end.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TransactionHistory;