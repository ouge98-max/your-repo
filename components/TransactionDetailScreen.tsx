

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Transaction, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';
import { isSentTransaction } from '../utils/transactions';

interface TransactionDetailScreenProps {
    usersMap: Map<string, User>;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ usersMap }) => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!transactionId) {
            setIsLoading(false);
            return;
        }
        api.getTransactionById(transactionId)
            .then(data => {
                if (data) {
                    setTransaction(data);
                }
            })
            .catch(err => {
                console.error("Failed to load transaction details:", err);
                toast.error("Could not load transaction details.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [transactionId]);

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-background">
                <Header title="Transaction Details" onBack={() => navigate(-1)} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="flex flex-col h-screen bg-background">
                <Header title="Transaction Not Found" onBack={() => navigate(-1)} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-destructive">Could not find this transaction.</p>
                </div>
            </div>
        );
    }

    const peerUser = transaction.peer;
    const isSent = isSentTransaction(transaction.type);
    const totalAmount = transaction.amount + (transaction.taxDetails?.amount || 0);

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header title="Transaction Details" onBack={() => navigate(-1)} />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-md mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <p className={`text-5xl font-bold ${isSent ? 'text-destructive' : 'text-primary'}`}>
                            {isSent ? '-' : '+'} {getCurrencySymbol(transaction.currency)}{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-lg text-foreground mt-2">{transaction.title}</p>
                        <p className="text-sm text-muted-foreground">{transaction.subtitle}</p>
                    </div>

                    <div className="mt-8 space-y-4 bg-card p-4 rounded-lg border border-border">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-semibold ${transaction.status === 'Completed' ? 'text-primary' : 'text-yellow-500'}`}>{transaction.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date & Time</span>
                            <span className="font-semibold text-foreground">{new Date(transaction.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Transaction ID</span>
                            <span className="font-mono text-xs text-foreground">{transaction.id}</span>
                        </div>
                        {transaction.taxDetails && (
                            <div className="flex justify-between pt-4 border-t border-border">
                                <span className="text-muted-foreground">{transaction.taxDetails.type} ({(transaction.taxDetails.rate * 100).toFixed(1)}%)</span>
                                <span className="font-semibold text-foreground">{getCurrencySymbol(transaction.currency)}{transaction.taxDetails.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-4 border-t border-border font-bold">
                            <span className="text-foreground">Total</span>
                            <span className="text-foreground">{getCurrencySymbol(transaction.currency)}{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-card p-4 rounded-lg border border-border">
                         <h3 className="text-sm font-semibold text-muted-foreground mb-3">{isSent ? 'To' : 'From'}</h3>
                         <Link to={`/profile/view/${peerUser.id}`} className="flex items-center gap-3 hover:bg-muted -m-4 p-4 rounded-lg transition-colors">
                            <Avatar user={peerUser} />
                            <div>
                                <p className="font-semibold text-foreground">{peerUser.name}</p>
                                <p className="text-sm text-muted-foreground">{peerUser.phone}</p>
                            </div>
                         </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TransactionDetailScreen;