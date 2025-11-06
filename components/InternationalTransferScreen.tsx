import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './Header';
import { User, InternationalRecipient } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRightLeft, User as UserIcon, Mail, Loader2Icon } from 'lucide-react';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import toast from 'react-hot-toast';
import { api } from '../services/mockApi';
import { getCurrencySymbol } from '../utils/currency';
import { useAppContext } from '../contexts/AppContext';
import { CountrySelectModal, Country } from './CountrySelectModal';
import { Avatar } from './Avatar';
import { useDebounce } from '../utils/hooks';

const InternationalTransferScreen: React.FC<{ onTransferSuccess: () => void }> = ({ onTransferSuccess }) => {
    const { currentUser, processPayment } = useAppContext();
    const navigate = useNavigate();

    const [fromAmount, setFromAmount] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const [recentRecipients, setRecentRecipients] = useState<InternationalRecipient[]>([]);

    // New state for quotes
    const [quote, setQuote] = useState<{ fee: number; rate: number; toAmount: string } | null>(null);
    const [isFetchingQuote, setIsFetchingQuote] = useState(false);
    const debouncedFromAmount = useDebounce(fromAmount, 500);


    const internationalAccount = useMemo(() => 
        currentUser?.linkedAccounts?.find(acc => acc.type === 'international'), 
        [currentUser]
    );

    useEffect(() => {
        api.getRecentInternationalRecipients().then(setRecentRecipients);
    }, []);
    
    const fetchQuote = useCallback(async () => {
        const numAmount = parseFloat(debouncedFromAmount);
        if (!selectedCountry || !internationalAccount || isNaN(numAmount) || numAmount <= 0) {
            setQuote(null);
            return;
        }
        setIsFetchingQuote(true);
        try {
            const { fee, rate } = await api.getInternationalTransferFee(internationalAccount.name as any, numAmount, selectedCountry.currency);
            const toAmount = (numAmount / rate).toFixed(2);
            setQuote({ fee, rate, toAmount });
        } catch (error) {
            console.error("Failed to fetch quote", error);
            toast.error("Could not fetch transfer quote.");
        } finally {
            setIsFetchingQuote(false);
        }
    }, [debouncedFromAmount, selectedCountry, internationalAccount]);

    useEffect(() => {
        fetchQuote();
    }, [fetchQuote]);

    const totalPayable = (parseFloat(fromAmount) || 0) + (quote?.fee || 0);

    const handlePay = (e: React.FormEvent) => {
        e.preventDefault();
        const bdtAmount = parseFloat(fromAmount);
        if (bdtAmount <= 0) {
             toast.error("Please enter a valid amount.");
            return;
        }
        if (totalPayable > currentUser!.wallet.balance) {
            toast.error("Insufficient balance.");
            return;
        }
        if (!recipientName || !recipientEmail) {
            toast.error("Please enter recipient's name and email.");
            return;
        }
        setIsPaymentGatewayOpen(true);
    };
    
    const handlePaymentGatewaySubmit = async (pin: string) => {
        if (!selectedCountry) return;
        setIsProcessingPayment(true);
        const paymentDetails = {
            type: 'international_transfer' as const,
            amount: totalPayable,
            currency: selectedCountry.currency,
            recipientInfo: { 
                name: recipientName,
                email: recipientEmail,
                countryCode: selectedCountry.code,
                countryName: selectedCountry.name,
                countryFlag: selectedCountry.flag
            },
        };
        const transaction = await processPayment(pin, paymentDetails);
        
        setIsProcessingPayment(false);
        setIsPaymentGatewayOpen(false);

        if (transaction) {
            onTransferSuccess();
        }
    };

    const handleSelectRecipient = (recipient: InternationalRecipient) => {
        setRecipientName(recipient.name);
        setRecipientEmail(recipient.email);
        const country = { code: recipient.countryCode, name: recipient.countryName, currency: 'USD', flag: recipient.countryFlag }; // Assuming USD for now for mock
        setSelectedCountry(country);
    };
    
    if (!currentUser) return null;

    if (!internationalAccount) {
        return (
            <div className="flex flex-col h-screen bg-background text-foreground">
                <Header title="International Transfer" onBack={() => navigate(-1)} />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <img src={"https://i.imgur.com/5c2223s.png"} alt="International provider logo" className="h-16 w-auto mb-4"/>
                    <h2 className="text-xl font-bold">Link an Account to Start</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">To send money abroad, you need to link your international payment account first.</p>
                    <button onClick={() => navigate('/me/add-international-account')} className="mt-6 w-full max-w-xs bg-primary text-primary-foreground font-bold py-3 rounded-lg">
                        Link Account Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <CountrySelectModal 
            isOpen={isCountryModalOpen} 
            onClose={() => setIsCountryModalOpen(false)}
            onSelect={(country) => {
                setSelectedCountry(country);
                setIsCountryModalOpen(false);
            }}
        />
        <PaymentGatewayModal
            isOpen={isPaymentGatewayOpen}
            onClose={() => setIsPaymentGatewayOpen(false)}
            onSubmit={handlePaymentGatewaySubmit}
            isLoading={isProcessingPayment}
            amount={totalPayable}
            recipient={{ name: recipientName }}
            currency={'BDT'}
        />
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="International Transfer" onBack={() => navigate(-1)} />
            <form onSubmit={handlePay} className="flex-1 overflow-y-auto p-4 flex flex-col">
                <div className="space-y-6 flex-1">
                    
                    <button type="button" onClick={() => setIsCountryModalOpen(true)} className="w-full bg-card border border-border p-4 rounded-lg flex justify-between items-center text-left">
                        {selectedCountry ? (
                             <div className="flex items-center gap-3">
                                <span className="text-3xl">{selectedCountry.flag}</span>
                                <div>
                                    <p className="text-muted-foreground text-sm">Sending to</p>
                                    <p className="font-bold text-lg text-card-foreground">{selectedCountry.name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="font-semibold text-muted-foreground">Select Recipient Country</p>
                        )}
                        <ChevronDown className="text-muted-foreground"/>
                    </button>

                    {selectedCountry && (
                    <div className="space-y-4 animate-fade-in">
                         <AmountInput label="You send" currency="BDT" value={fromAmount} onChange={setFromAmount} />
                         <div className="flex justify-center text-muted-foreground items-center gap-2">
                             <div className="h-px flex-1 bg-border"></div>
                             <ArrowRightLeft size={16}/>
                             <div className="h-px flex-1 bg-border"></div>
                        </div>
                         <AmountInput label="They receive (approx.)" currency={selectedCountry.currency} value={quote?.toAmount || ''} readOnly />
                    </div>
                    )}

                    {isFetchingQuote ? (
                         <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-semibold">
                            <Loader2Icon className="h-4 w-4 animate-spin" /> Fetching best rate...
                        </div>
                    ) : quote && (
                         <div className="text-center text-sm text-muted-foreground font-semibold">
                             Live Rate: 1 {selectedCountry?.currency} ≈ {quote.rate.toFixed(2)} BDT
                        </div>
                    )}
                    
                    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-card-foreground">Recipient Details via <span className="font-bold text-primary">{internationalAccount.name}</span></h3>
                        <div>
                             <label htmlFor="recipientName" className="sr-only">Recipient's Full Name</label>
                             <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input id="recipientName" type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} required placeholder="Full Name" className="pl-9 w-full bg-input border-0 rounded-md" /></div>
                        </div>
                        <div>
                             <label htmlFor="recipientEmail" className="sr-only">Recipient's Email ({internationalAccount.name})</label>
                             <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input id="recipientEmail" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} required placeholder={`Email (${internationalAccount.name})`} className="pl-9 w-full bg-input border-0 rounded-md" /></div>
                        </div>
                    </div>
                    
                    {recentRecipients.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Recent Recipients</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                                {recentRecipients.map(r => (
                                    <button type="button" key={r.email} onClick={() => handleSelectRecipient(r)} className="flex flex-col items-center gap-2 text-center flex-shrink-0 w-20">
                                        <Avatar user={{
                                            id: r.email,
                                            name: r.name,
                                            avatarUrl: `https://i.pravatar.cc/150?u=${r.email}`,
                                            phone: '', // mock
                                            wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' }, // mock
                                            kycStatus: 'Verified', // mock
                                            statusMessage: '', // mock
                                            presence: 'offline', // mock
                                            isAi: false, // mock
                                            username: r.name.toLowerCase().replace(/\s/g, ''), // mock
                                            balances: {}, // mock
                                            joinedDate: new Date().toISOString(), // mock
                                        }} size="md" />
                                        <p className="text-xs text-muted-foreground truncate w-full">{r.name.split(' ')[0]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                </div>
                 <footer className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 -mx-4 -mb-4 mt-4">
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-muted-foreground"><span>Amount to convert</span><span>{getCurrencySymbol('BDT')}{parseFloat(fromAmount || '0').toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Fee (via {internationalAccount.name})</span><span>+ {getCurrencySymbol('BDT')}{(quote?.fee || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
                        <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border"><span>Total to pay</span><span>{getCurrencySymbol('BDT')}{totalPayable > 0 ? totalPayable.toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}</span></div>
                    </div>
                    <button type="submit" disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !recipientName || !recipientEmail || isProcessingPayment || isFetchingQuote} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50">
                        Continue
                    </button>
                </footer>
            </form>
        </div>
        </>
    );
}

const AmountInput: React.FC<{label: string, currency: string, value: string, onChange?: (val: string) => void, readOnly?: boolean}> = ({label, currency, value, onChange, readOnly}) => (
    <div>
        <label className="block text-sm font-medium text-muted-foreground">{label}</label>
        <div className="relative mt-1">
            <input type="number" step="0.01" value={value} onChange={e => onChange && onChange(e.target.value)}
                readOnly={readOnly}
                className={`w-full bg-card text-card-foreground pl-4 pr-24 py-3 text-2xl font-bold rounded-lg border border-input focus:ring-ring focus:border-ring outline-none ${readOnly ? 'opacity-70' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                <div className="h-full w-px bg-border mr-4"></div>
                <span className="font-bold text-lg text-muted-foreground pr-4">{currency}</span>
            </div>
        </div>
    </div>
);

export default InternationalTransferScreen;
