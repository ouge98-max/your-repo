import React, { useState, useEffect } from 'react';
import { Transaction, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { CreditCardIcon, Loader2Icon } from './icons';
import { TransactionIcon } from './TransactionIcon';
import { SENT_TRANSACTION_TYPES } from '../utils/transactions';
import { getCurrencySymbol } from '../utils/currency';

interface BudgetScreenProps {
  user: User;
  onBack: () => void;
  onBudgetUpdate: () => void;
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ user, onBack, onBudgetUpdate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(user.monthlyBudget?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getTransactions().then(result => {
      const allTransactions = result.transactions;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

      const filtered = allTransactions.filter(tx => 
        SENT_TRANSACTION_TYPES.includes(tx.type) &&
        tx.peer.id !== 'gov-treasury' && // Exclude tax payments from personal budget
        tx.timestamp >= startOfMonth &&
        tx.timestamp <= endOfMonth
      );

      setTransactions(filtered.sort((a,b) => b.timestamp - a.timestamp));
      setLoading(false);
    });
  }, [user]);

  const handleSaveBudget = async () => {
    const budgetValue = parseFloat(newBudget);
    if (!isNaN(budgetValue) && budgetValue > 0) {
        setIsSaving(true);
        await api.updateMonthlyBudget(user.id, budgetValue);
        onBudgetUpdate();
        setIsSaving(false);
        setIsEditing(false);
    }
  };

  const totalSpent = transactions.reduce((sum, tx) => sum + (tx.taxDetails ? tx.amount + tx.taxDetails.amount : tx.amount), 0);
  const budget = user.monthlyBudget || 0;
  const remaining = budget - totalSpent;
  const progress = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header title="Monthly Budget" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Budget Summary Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold text-card-foreground">Spending This Month</h3>
                 <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-semibold text-primary hover:text-primary/90">
                    {isEditing ? 'Cancel' : (budget > 0 ? 'Edit Budget' : 'Set Budget')}
                 </button>
            </div>
            {isEditing ? (
                 <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        className="w-full text-lg p-2 bg-input border-2 border-border text-foreground rounded-lg focus:ring-ring focus:border-ring outline-none"
                        placeholder="e.g. 50000"
                        autoFocus
                    />
                    <button onClick={handleSaveBudget} disabled={isSaving} className="bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center w-20">
                        {isSaving ? <Loader2Icon className="animate-spin" /> : 'Save'}
                    </button>
                </div>
            ) : (
              <>
                {budget > 0 ? (
                    <div>
                        <div className="flex justify-between items-baseline mb-2 text-card-foreground">
                           <p><span className="text-3xl font-bold">{getCurrencySymbol('BDT')}{totalSpent.toLocaleString('en-IN')}</span> spent</p>
                           <p className="text-muted-foreground text-sm">of {getCurrencySymbol('BDT')}{budget.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <p className={`mt-2 font-semibold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
                             {remaining >= 0 ? `${getCurrencySymbol('BDT')}${remaining.toLocaleString('en-IN')} left` : `${getCurrencySymbol('BDT')}${Math.abs(remaining).toLocaleString('en-IN')} over budget`}
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <CreditCardIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2"/>
                        <p className="text-foreground">You haven't set a budget yet.</p>
                        <p className="text-sm text-muted-foreground">Set one to start tracking your spending.</p>
                    </div>
                )}
              </>
            )}
          </div>
          
          {/* Transaction List */}
          <div>
            <h3 className="text-lg font-semibold text-foreground px-2 mb-2">Spending History (This Month)</h3>
             {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading transactions...</p>
             ) : transactions.length > 0 ? (
                <ul className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-sm divide-y divide-border">
                    {transactions.map(tx => {
                        const totalAmount = tx.taxDetails ? tx.amount + tx.taxDetails.amount : tx.amount;
                        return (
                            <li key={tx.id} className="flex items-center p-4">
                                <TransactionIcon type={tx.type} />
                                <div className="flex-1 ml-4">
                                    <p className="font-semibold text-card-foreground">{tx.title || `To ${tx.peer.name}`}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-destructive">
                                        - {getCurrencySymbol(tx.currency)}{totalAmount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
             ) : (
                <p className="text-center text-muted-foreground py-8">No spending this month yet.</p>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BudgetScreen;