

import React, { useState, useEffect } from 'react';
import { MediaBubble } from './MediaBubble';
import { Header } from './Header';
import { api } from '../services/mockApi';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CheckCircleIcon, ArrowLeftIcon, Loader2Icon as Loader2 } from './icons';
import toast from 'react-hot-toast';
import { User } from '../types';

interface AddAccountScreenProps {
    currentUser: User;
    onAccountAdded: () => void;
}

type Institution = {
    id: string;
    name: string;
    logoUrl: string;
    type: 'bank' | 'mobile';
};

type Step = 'selectInstitution' | 'enterDetails' | 'confirmHolder' | 'verifyOtp' | 'success';

const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ currentUser, onAccountAdded }) => {
    const [step, setStep] = useState<Step>('selectInstitution');
    const [banks, setBanks] = useState<Institution[]>([]);
    const [mfs, setMfs] = useState<Institution[]>([]);
    const [activeTab, setActiveTab] = useState<'banks' | 'mfs'>('banks');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        api.getAvailableInstitutions().then(data => {
            setBanks(data.banks);
            setMfs(data.mfs);
        });
    }, []);

    const handleBack = () => {
        setError('');
        switch (step) {
            case 'success':
                onAccountAdded();
                navigate(-1);
                break;
            case 'verifyOtp':
                setStep('confirmHolder');
                break;
            case 'confirmHolder':
                setStep('enterDetails');
                break;
            case 'enterDetails':
                setStep('selectInstitution');
                setSelectedInstitution(null);
                break;
            default:
                navigate(-1);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await api.initiateAccountLink(selectedInstitution!.id, accountNumber);
            if (res.success && res.accountHolderName) {
                setAccountHolderName(res.accountHolderName);
                setStep('confirmHolder');
            } else {
                setError(res.message || 'Could not find this account.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const newAccount = await api.verifyAccountLinkOtp(currentUser.id, selectedInstitution!.id, accountNumber, otp);
            if (newAccount) {
                setStep('success');
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('An error occurred during verification.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'selectInstitution':
                const list = activeTab === 'banks' ? banks : mfs;
                const filteredList = list.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
                return (
                    <div className="flex flex-col h-full max-w-md mx-auto w-full">
                        <div className="p-4 border-b border-border">
                            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
                                <button onClick={() => setActiveTab('banks')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${activeTab === 'banks' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Banks</button>
                                <button onClick={() => setActiveTab('mfs')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${activeTab === 'mfs' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Mobile Banking</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="relative">
                                <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-card border-input text-card-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                        </div>
                        <main className="flex-1 overflow-y-auto px-4">
                            <div className="grid grid-cols-2 gap-3">
                                {filteredList.map(inst => (
                                    <button key={inst.id} onClick={() => { setSelectedInstitution(inst); setStep('enterDetails'); }} className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors aspect-square shadow-sm">
                                        <MediaBubble
                                          src={inst.logoUrl}
                                          alt={inst.name}
                                          type="image"
                                          size={48}
                                          fit="contain"
                                          style={{ backgroundColor: '#ffffff', padding: '6px' }}
                                        />
                                        <p className="text-sm font-semibold text-card-foreground mt-3 text-center">{inst.name}</p>
                                    </button>
                                ))}
                            </div>
                        </main>
                    </div>
                );

            case 'enterDetails':
                return (
                    <form onSubmit={handleDetailsSubmit} className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
                        <div className="flex flex-col items-center text-center">
                            <MediaBubble
                              src={selectedInstitution!.logoUrl}
                              alt={selectedInstitution!.name}
                              type="image"
                              size={64}
                              fit="contain"
                              className="mb-4"
                              style={{ backgroundColor: '#ffffff', padding: '8px' }}
                            />
                            <p className="text-muted-foreground">Enter your account number for {selectedInstitution!.name}.</p>
                        </div>
                        <div className="my-6">
                            <label htmlFor="accountNumber" className="block text-sm font-medium text-muted-foreground">Account Number</label>
                            <input id="accountNumber" type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                                className="mt-1 block w-full bg-card text-card-foreground px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring"
                                placeholder="e.g. 1234567890" required autoFocus />
                            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                        </div>
                        <div className="flex-1 flex items-end">
                            <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center">
                                {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                                {isLoading ? 'Verifying...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                );

            case 'confirmHolder':
                return (
                    <div className="flex-1 flex flex-col p-6 text-center max-w-md mx-auto w-full">
                        <h2 className="text-xl font-bold text-foreground">Confirm Account Holder</h2>
                        <p className="text-muted-foreground mt-2">Does this name match your account?</p>
                        <div className="my-8 p-6 bg-card rounded-lg border border-border">
                            <p className="text-sm text-muted-foreground">Account Holder</p>
                            <p className="text-2xl font-bold text-foreground tracking-wider">{accountHolderName}</p>
                        </div>
                        <div className="flex-1 flex flex-col justify-end gap-3">
                            <button onClick={() => setStep('verifyOtp')} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90">Yes, Continue</button>
                            <button onClick={handleBack} className="w-full bg-secondary text-secondary-foreground font-bold py-3 px-4 rounded-lg hover:bg-accent">No, Go Back</button>
                        </div>
                    </div>
                );

            case 'verifyOtp':
                return (
                    <form onSubmit={handleOtpSubmit} className="flex-1 flex flex-col p-6 text-center max-w-md mx-auto w-full">
                        <h2 className="text-xl font-bold text-foreground">Enter OTP</h2>
                        <p className="text-muted-foreground mt-2">An OTP has been sent to your registered mobile number.</p>
                        <div className="my-8">
                            <label htmlFor="otp" className="sr-only">OTP</label>
                            <input id="otp" type="tel" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={4} autoFocus
                                className="w-full text-center text-3xl tracking-[1em] p-3 bg-card border-2 border-input rounded-lg focus:ring-ring focus:border-ring outline-none" />
                             {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                        </div>
                        <div className="flex-1 flex items-end">
                            <button type="submit" disabled={isLoading || otp.length < 4} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center">
                                {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                                {isLoading ? 'Verifying...' : 'Verify & Link'}
                            </button>
                        </div>
                    </form>
                );

            case 'success':
                 return (
                    <div className="flex-1 flex flex-col p-6 text-center justify-center items-center max-w-md mx-auto w-full">
                        <CheckCircleIcon className="h-20 w-20 text-primary mb-4" />
                        <h2 className="text-2xl font-bold text-foreground">Account Linked!</h2>
                        <p className="text-muted-foreground mt-2">Your {selectedInstitution?.name} account has been successfully linked.</p>
                        <div className="w-full mt-8">
                            <button onClick={handleBack} className="w-full max-w-xs bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90">Done</button>
                        </div>
                    </div>
                );
        }
    };
    
    const getTitle = () => {
        switch(step) {
            case 'selectInstitution': return 'Add New Account';
            case 'enterDetails': return `Link ${selectedInstitution?.name}`;
            case 'confirmHolder': return 'Confirm Account';
            case 'verifyOtp': return 'Verify OTP';
            case 'success': return 'Success';
            default: return 'Add Account';
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title={getTitle()} onBack={handleBack} />
            {renderContent()}
        </div>
    );
};

export default AddAccountScreen;