import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Bus, Minus, Plus } from './icons';
import { useNavigate } from 'react-router-dom';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '../utils/currency';
import { useAppContext } from '../contexts/AppContext'; // Import useAppContext

interface BusTicketScreenProps {
    user: User;
    onPaymentSuccess: () => void;
}

type CoachType = 'AC' | 'Non-AC';

const DISTRICTS = ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Barisal', 'Coxs Bazar'];
const OPERATORS = ['Hanif Enterprise', 'Shohagh Paribahan', 'Green Line'];
const FARES: { [route: string]: { [c in CoachType]: number } } = {
    'Dhaka-Chittagong': { 'AC': 1200, 'Non-AC': 700 },
    'Dhaka-Sylhet': { 'AC': 1000, 'Non-AC': 600 },
    'Dhaka-Khulna': { 'AC': 1300, 'Non-AC': 750 },
    'Dhaka-Rajshahi': { 'AC': 1100, 'Non-AC': 650 },
    'Dhaka-Coxs Bazar': { 'AC': 2000, 'Non-AC': 1000 },
    'Chittagong-Coxs Bazar': { 'AC': 500, 'Non-AC': 300 },
};

const BusTicketScreen: React.FC<BusTicketScreenProps> = ({ user, onPaymentSuccess }) => {
    const [from, setFrom] = useState('Dhaka');
    const [to, setTo] = useState('Chittagong');
    const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);
    const [operator, setOperator] = useState(OPERATORS[0]);
    const [coachType, setCoachType] = useState<CoachType>('Non-AC');
    const [passengers, setPassengers] = useState(1);
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // New loading state for gateway
    const navigate = useNavigate();
    const { processPayment } = useAppContext(); // Get centralized processPayment

    const fare = useMemo(() => {
        const route = [from, to].sort().join('-');
        if (FARES[route]) {
            return FARES[route][coachType] * passengers;
        }
        return 0;
    }, [from, to, coachType, passengers]);

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        if (from === to) {
            toast.error("From and To destinations cannot be the same.");
            return;
        }
        if (fare <= 0) {
            toast.error("This route is not available.");
            return;
        }
        if (fare > user.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        setIsPaymentGatewayOpen(true);
    };

    // This function will now be passed to the PaymentGatewayModal
    const handlePaymentGatewaySubmit = async (pin: string) => {
        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'bus_ticket' as const,
            details: { from, to, operator, passengers },
            amount: fare,
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onPaymentSuccess();
            // Navigation to success screen is now handled by processPayment
        } else {
            // Error toast handled by processPayment
        }
    };

    return (
        <>
            <PaymentGatewayModal isOpen={isPaymentGatewayOpen} onClose={() => setIsPaymentGatewayOpen(false)} onSubmit={handlePaymentGatewaySubmit} isLoading={isProcessingPayment} amount={fare} recipient={{ name: operator, logoUrl: 'https://i.imgur.com/gY9v2YJ.png' }} />
            <div className="flex flex-col h-screen bg-background text-foreground">
                <Header title="Bus Tickets" onBack={() => navigate(-1)} />
                <form onSubmit={handlePay} className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="from" className="block text-sm font-medium text-muted-foreground">From</label><select id="from" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md">{DISTRICTS.map(s => <option key={s}>{s}</option>)}</select></div>
                            <div><label htmlFor="to" className="block text-sm font-medium text-muted-foreground">To</label><select id="to" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md">{DISTRICTS.filter(s => s !== from).map(s => <option key={s}>{s}</option>)}</select></div>
                        </div>
                        <div><label htmlFor="journeyDate" className="block text-sm font-medium text-muted-foreground">Journey Date</label><input id="journeyDate" type="date" value={journeyDate} onChange={e => setJourneyDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md" /></div>
                        <div><label htmlFor="operator" className="block text-sm font-medium text-muted-foreground">Operator</label><select id="operator" value={operator} onChange={e => setOperator(e.target.value)} className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md">{OPERATORS.map(s => <option key={s}>{s}</option>)}</select></div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Coach</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
                                    <button type="button" onClick={() => setCoachType('Non-AC')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${coachType === 'Non-AC' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Non-AC</button>
                                    <button type="button" onClick={() => setCoachType('AC')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${coachType === 'AC' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>AC</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground">Passengers</label>
                                <div className="mt-1 flex items-center justify-center gap-4">
                                    <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))} className="p-2 rounded-full bg-secondary text-secondary-foreground"><Minus size={16} /></button>
                                    <span className="text-xl font-bold w-10 text-center">{passengers}</span>
                                    <button type="button" onClick={() => setPassengers(p => Math.min(10, p + 1))} className="p-2 rounded-full bg-secondary text-secondary-foreground"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-card rounded-lg border border-border flex justify-between items-center">
                            <span className="font-semibold text-muted-foreground">Total Fare</span>
                            <span className="font-bold text-2xl text-card-foreground">{getCurrencySymbol('BDT')}{fare > 0 ? fare.toLocaleString('en-IN') : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-end">
                        <button type="submit" disabled={from === to || fare <= 0} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50">Pay Now</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default BusTicketScreen;