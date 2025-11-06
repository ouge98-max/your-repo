
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { ArrowDownTrayIcon, BuildingLibraryIcon } from './icons';
import { getCurrencySymbol } from '../utils/currency';

const TaxLedgerScreen: React.FC<{ user: User }> = ({ user }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const taxTransactions = useMemo(() => {
        return transactions.filter(tx => tx.taxDetails).sort((a,b) => b.timestamp - a.timestamp);
    }, [transactions]);

    useEffect(() => {
        setLoading(true);
        api.getTransactions().then(result => {
            setTransactions(result.transactions);
            setLoading(false);
        });
    }, []);

    const handleExport = () => {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Tax Ledger for ${user.name}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = ["Date", "Description", "Base Amount", "Tax Type", "Tax Amount", "Total"];
        const tableRows: any[][] = [];

        taxTransactions.forEach(tx => {
            const totalAmount = tx.amount + (tx.taxDetails?.amount || 0);
            const txData = [
                new Date(tx.timestamp).toLocaleDateString(),
                tx.title || `Payment to ${tx.peer.name}`,
                `${getCurrencySymbol(tx.currency)}${tx.amount.toLocaleString()}`,
                tx.taxDetails?.type || 'N/A',
                `${getCurrencySymbol(tx.currency)}${tx.taxDetails?.amount.toLocaleString()}`,
                `${getCurrencySymbol(tx.currency)}${totalAmount.toLocaleString()}`
            ];
            tableRows.push(txData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });
        
        doc.save(`tax_ledger_${user.name.replace(/\s/g, '_')}_${new Date().getFullYear()}.pdf`);
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header 
                title="Tax Ledger" 
                onBack={() => navigate(-1)}
                rightAction={
                    <button onClick={handleExport} disabled={taxTransactions.length === 0} className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50">
                        <ArrowDownTrayIcon className="h-6 w-6" />
                    </button>
                }
            />
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-md mx-auto">
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading tax records...</p>
                    ) : taxTransactions.length > 0 ? (
                        <ul className="divide-y divide-border bg-card rounded-lg border border-border">
                            {taxTransactions.map(tx => {
                                const totalAmount = tx.amount + (tx.taxDetails?.amount || 0);
                                return (
                                <li key={tx.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-card-foreground">{tx.title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{tx.taxDetails?.type} paid on payment to {tx.peer.name}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-4">
                                            <p className="font-bold text-destructive">- {getCurrencySymbol(tx.currency)}{totalAmount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">Tax: {getCurrencySymbol(tx.currency)}{tx.taxDetails?.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground">
                            <BuildingLibraryIcon className="h-16 w-16 mx-auto" />
                            <p className="font-semibold mt-4">No Tax Records</p>
                            <p className="text-sm">No transactions with tax deductions were found for this period.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TaxLedgerScreen;
