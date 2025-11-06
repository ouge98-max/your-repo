

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { BuildingLibraryIcon, FileText, Loader2Icon as Loader2, CheckCircleIcon } from './icons';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TaxLedgerData {
    transactions: Transaction[];
    totalVAT: number;
    totalAIT: number;
    grandTotal: number;
}

const groupTransactionsByMonth = (txns: Transaction[]) => {
    return txns.reduce((acc, txn) => {
        const date = new Date(txn.timestamp);
        const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(txn);
        return acc;
    }, {} as Record<string, Transaction[]>);
};

const TaxCenterScreen: React.FC<{ user: User; onBack: () => void; }> = ({ user, onBack }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [ledgerData, setLedgerData] = useState<TaxLedgerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFiling, setIsFiling] = useState(false);
    const [isFiled, setIsFiled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setIsFiled(false); // Reset filed status when year changes
        api.getTaxLedgerData(selectedYear)
            .then(data => {
                if(isMounted) {
                    setLedgerData(data as TaxLedgerData);
                }
            })
            .catch(err => {
                console.error("Failed to load tax ledger:", err);
                toast.error("Failed to load tax records.");
            })
            .finally(() => {
                 if(isMounted) setLoading(false);
            });
        return () => { isMounted = false };
    }, [selectedYear]);
    
    const handleFileNow = () => {
        setIsFiling(true);
        setTimeout(() => {
            setIsFiling(false);
            setIsFiled(true);
            toast.success("Tax return filed successfully!");
        }, 2000);
    }

    const groupedTransactions = useMemo(() => {
        if (!ledgerData?.transactions) return {};
        return groupTransactionsByMonth(ledgerData.transactions);
    }, [ledgerData]);
    
    const sortedMonths = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [groupedTransactions]);

    const renderContent = () => {
        if (loading) {
            return <div className="text-center text-muted-foreground py-16">Loading tax records for {selectedYear}...</div>;
        }
        if (!ledgerData || ledgerData.transactions.length === 0) {
             return <div className="text-center text-muted-foreground py-16">No tax transactions found for {selectedYear}.</div>;
        }

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/80 p-4 rounded-xl border border-border">
                        <p className="text-sm text-muted-foreground">Total VAT Paid</p>
                        <p className="text-2xl font-bold text-card-foreground">৳{ledgerData.totalVAT.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-card/80 p-4 rounded-xl border border-border">
                        <p className="text-sm text-muted-foreground">Total AIT Paid</p>
                        <p className="text-2xl font-bold text-card-foreground">৳{ledgerData.totalAIT.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                {selectedYear === currentYear && (
                     <div className="bg-card/80 p-4 rounded-xl border border-border flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-card-foreground">Tax Return Status: {isFiled ? <span className="text-green-500">Filed</span> : <span className="text-yellow-500">Due</span>}</p>
                            <p className="text-xs text-muted-foreground">Return for {currentYear} fiscal year</p>
                        </div>
                        {isFiled ? (
                             <div className="flex items-center gap-2 text-green-500">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="font-bold">Completed</span>
                            </div>
                        ) : (
                            <button onClick={handleFileNow} disabled={isFiling} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
                                {isFiling ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                {isFiling ? 'Filing...' : 'File Now'}
                            </button>
                        )}
                    </div>
                )}
                
                {selectedYear !== currentYear && (
                    <div className="bg-card/80 p-4 rounded-xl border border-border flex items-center justify-between">
                        <p className="font-semibold text-card-foreground">Tax Return Status: <span className="text-green-500">Filed</span></p>
                         <div className="flex items-center gap-2 text-green-500">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-bold">Completed</span>
                        </div>
                    </div>
                )}


                <div>
                    <h3 className="text-lg font-semibold text-foreground px-2 mb-2">Contribution Ledger (Summary)</h3>
                    {sortedMonths.length > 0 ? (
                        <div className="bg-card/80 border border-border rounded-2xl p-4">
                            <p className="text-sm text-muted-foreground">
                                Detailed records for {ledgerData.transactions.length} tax transaction{ledgerData.transactions.length > 1 ? 's' : ''} found for {selectedYear}.
                            </p>
                             <button onClick={() => navigate('/me/tax-ledger')} className="w-full mt-3 bg-secondary text-secondary-foreground font-semibold py-2 rounded-lg hover:bg-muted">
                                View Full Ledger
                            </button>
                        </div>
                    ) : <p className="text-muted-foreground text-center py-4">No transactions for this period.</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="Tax Center" onBack={onBack} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-md mx-auto p-4 space-y-6">
                    <div className="flex justify-center bg-card rounded-full border border-border p-1">
                        {[currentYear, currentYear - 1].map(year => (
                             <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`w-full px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${selectedYear === year ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    {!loading && ledgerData && (
                        <div className="bg-gradient-to-r from-primary to-teal-500 p-4 rounded-xl shadow-lg">
                             <p className="text-sm text-primary-foreground/80">Total Tax Paid ({selectedYear})</p>
                            <p className="text-3xl font-bold text-primary-foreground">৳{ledgerData.grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        </div>
                    )}
                    
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default TaxCenterScreen;
