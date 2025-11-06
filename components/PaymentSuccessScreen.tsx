import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Transaction, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { CheckCircleIcon, FileText, Loader2Icon } from './icons';
import { getCurrencySymbol } from '../utils/currency';
import { isSentTransaction } from '../utils/transactions';

const PaymentSuccessScreen: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!transactionId) {
            setIsLoading(false);
            return;
        }
        api.getTransactionById(transactionId).then(data => {
            setTransaction(data || null);
            setIsLoading(false);
        });
    }, [transactionId]);

    if (isLoading) {
        return (
             <div className="flex flex-col h-screen bg-background">
                <Header title="" onBack={() => navigate('/')} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!transaction) {
         return (
            <div className="flex flex-col h-screen bg-background">
                <Header title="Error" onBack={() => navigate('/')} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-destructive">Transaction not found.</p>
                </div>
            </div>
        );
    }

    const isSent = isSentTransaction(transaction.type);
    const totalAmount = transaction.amount + (transaction.taxDetails?.amount || 0);
    const peerUser = transaction.peer;
    
    let title = 'Transaction Successful';
    let summary = `Transaction of ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} completed.`;
    
    switch (transaction.type) {
        case 'sent':
            title = 'Payment Successful';
            summary = `You sent ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to ${peerUser.name}`;
            break;
        case 'mobile_recharge':
            title = 'Recharge Successful';
            summary = `You recharged ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} for ${peerUser.phone}`;
            break;
        case 'bill_payment':
            title = 'Bill Paid';
            summary = `You paid ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to ${peerUser.name}`;
            break;
        case 'govt_fee':
            title = 'Fee Paid';
            summary = `You paid ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to ${peerUser.name}`;
            break;
        case 'train_ticket':
            title = 'Ticket Booked';
            summary = `Train ticket purchase of ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} was successful.`;
            break;
        case 'bus_ticket':
            title = 'Ticket Booked';
            summary = `Bus ticket purchase of ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} was successful.`;
            break;
        case 'exchange':
            title = 'Transfer Successful';
            summary = `You sent ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to ${peerUser.name}`;
            break;
        case 'topup':
            title = 'Deposit Successful';
            summary = `You deposited ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} from ${peerUser.name}`;
            break;
        case 'withdraw':
            title = 'Withdrawal Successful';
            summary = `You withdrew ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to ${peerUser.name}`;
            break;
        case 'savings_deposit':
            title = 'Deposit Successful';
            summary = `You moved ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} to your Savings Pot`;
            break;
        case 'savings_withdraw':
             title = 'Withdrawal Successful';
            summary = `You moved ${getCurrencySymbol(transaction.currency)}${totalAmount.toLocaleString()} from your Savings Pot`;
            break;
    }


    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="" onBack={() => navigate('/')} />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-md text-center">
                    <CheckCircleIcon className="h-20 w-20 text-primary mx-auto mb-4 animate-check-pop" />
                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                    <p className="text-muted-foreground mt-2 text-lg">{summary}</p>
                
                    <div className="mt-8 text-left bg-card p-4 rounded-lg border border-border space-y-3">
                         <div className="flex items-center gap-3">
                            <Avatar user={peerUser} />
                            <div>
                                <p className="text-sm text-muted-foreground">{isSent ? 'To' : 'From'}</p>
                                <p className="font-semibold text-card-foreground">{peerUser.name}</p>
                            </div>
                         </div>
                        <div className="flex justify-between items-center pt-3 border-t border-border">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-bold text-lg text-card-foreground">{getCurrencySymbol(transaction.currency)}{transaction.amount.toLocaleString()}</span>
                        </div>
                        {transaction.taxDetails && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{transaction.taxDetails.type}</span>
                                <span className="font-semibold text-card-foreground">{getCurrencySymbol(transaction.currency)}{transaction.taxDetails.amount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center font-bold pt-3 border-t border-border">
                            <span className="text-card-foreground">Total</span>
                            <span className="text-card-foreground">{getCurrencySymbol(transaction.currency)}{totalAmount.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm pt-3 border-t border-border">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-semibold text-card-foreground">{new Date(transaction.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Transaction ID</span>
                            <span className="font-mono text-xs text-card-foreground">{transaction.id}</span>
                        </div>
                    </div>
                </div>
            </main>
             <footer className="p-4 border-t border-border bg-background/80 backdrop-blur-lg">
                <div className="max-w-md mx-auto flex gap-3">
                    <button onClick={() => navigate(`/history/${transaction.id}`)} className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold py-3 rounded-lg hover:bg-muted">
                        <FileText size={16} /> View Receipt
                    </button>
                    <button onClick={() => navigate('/')} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90">
                        Done
                    </button>
                </div>
            </footer>
        </div>
    );
};
export default PaymentSuccessScreen;