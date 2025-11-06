import React, { useState } from 'react';
import { Header } from './Header';
import { ResultDisplay } from './ResultDisplay';
import { GoogleGenAI, Type } from '@google/genai';
import { WebSecurityCheckResult } from '../types';
import { SparklesIcon, GlobeAltIcon, ShieldCheckIcon as ShieldCheck, KeyRound, DevicePhoneMobileIcon as Smartphone, Laptop, ArrowRightOnRectangleIcon as LogOut, ChevronDown } from './icons';
import toast from 'react-hot-toast';
import { ToggleSwitch } from './ToggleSwitch';


interface SecurityScreenProps {
    onBack: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ActiveSession {
  id: string;
  deviceType: 'desktop' | 'mobile';
  name: string;
  location: string;
  lastActive: string;
  isCurrent?: boolean;
}

const initialSessions: ActiveSession[] = [
  {
    id: 'session-1',
    deviceType: 'desktop',
    name: 'Chrome on macOS',
    location: 'Dhaka, BD',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'session-2',
    deviceType: 'mobile',
    name: 'OumaGe for Android',
    location: 'Chittagong, BD',
    lastActive: '2 days ago',
  },
   {
    id: 'session-3',
    deviceType: 'desktop',
    name: 'Firefox on Windows',
    location: 'Sylhet, BD',
    lastActive: '1 week ago',
  },
];


const AccordionItem: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ title, description, icon, isOpen, onToggle, children }) => {
    return (
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-lg">{icon}</div>
                    <div>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>
            <div
                className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-4 pb-4 border-t border-border">{children}</div>
            </div>
        </div>
    );
};

const SecurityScreen: React.FC<SecurityScreenProps> = ({ onBack }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<WebSecurityCheckResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>('web');
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(initialSessions);


    const handleToggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const handleCheckUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the URL "${url}" for security threats. Categorize it as 'safe', 'suspicious', or 'unsafe'. Provide a brief, user-friendly summary and a list of up to 3 potential threats found (like "Potential phishing attempt", "Contains malware links", "Suspicious redirects", etc.).`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            safetyLevel: {
                                type: Type.STRING,
                                description: "The security category: 'safe', 'suspicious', or 'unsafe'.",
                                enum: ['safe', 'suspicious', 'unsafe'],
                            },
                            summary: {
                                type: Type.STRING,
                                description: "A one-sentence summary of the security analysis.",
                            },
                            threats: {
                                type: Type.ARRAY,
                                description: "A list of potential threats identified.",
                                items: { type: Type.STRING },
                            },
                        },
                        required: ['safetyLevel', 'summary', 'threats'],
                    },
                },
            });

            const jsonString = response.text.trim();
            const parsedResult: WebSecurityCheckResult = JSON.parse(jsonString);
            setResult(parsedResult);
        } catch (e) {
            console.error("Gemini API error:", e);
            setError("Could not analyze the URL. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setUrl('');
        setResult(null);
        setError(null);
    };

    const handleToggle2FA = () => {
        const newState = !isTwoFactorEnabled;
        setIsTwoFactorEnabled(newState);
        toast.success(`Two-Factor Authentication ${newState ? 'Enabled' : 'Disabled'}`);
    };

    const handleLogoutDevice = (sessionId: string, deviceName: string) => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 500)), // Simulate network delay
            {
                loading: `Logging out from ${deviceName}...`,
                success: () => {
                    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
                    return `Successfully logged out from ${deviceName}.`;
                },
                error: 'Could not log out device.',
            }
        );
    }
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <Header title="Security Center" onBack={onBack} focusOnMount />
            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                <AccordionItem
                    title="Web Security Check"
                    description="Analyze URLs for threats"
                    icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                    isOpen={openAccordion === 'web'}
                    onToggle={() => handleToggleAccordion('web')}
                >
                    <div className="pt-4">
                        <form onSubmit={handleCheckUrl} className="mb-4">
                            <label htmlFor="url-input" className="sr-only">URL to check</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
                                    <GlobeAltIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="url-input" type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full bg-card border border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring pl-10 pr-4 py-3"
                                    required
                                />
                            </div>
                            <button
                                type="submit" disabled={isLoading}
                                className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="h-5 w-5" />
                                {isLoading ? 'Analyzing...' : 'Check URL with AI'}
                            </button>
                        </form>
                        {error && <p className="text-center text-destructive" role="alert">{error}</p>}
                        {result && <ResultDisplay result={result} url={url} onReset={handleReset} />}
                    </div>
                </AccordionItem>

                <AccordionItem
                    title="Account Security"
                    description="PIN, 2FA, and more"
                    icon={<KeyRound className="h-5 w-5 text-yellow-600" />}
                    isOpen={openAccordion === 'account'}
                    onToggle={() => handleToggleAccordion('account')}
                >
                    <ul className="divide-y divide-border pt-2">
                        <li className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                            </div>
                            <ToggleSwitch checked={isTwoFactorEnabled} onChange={handleToggle2FA} />
                        </li>
                         <li className="flex items-center justify-between py-4">
                            <div>
                                <p className="font-medium text-foreground">Change PIN</p>
                                <p className="text-sm text-muted-foreground">Update your 4-digit security PIN</p>
                            </div>
                             <button className="text-sm font-semibold text-primary hover:text-primary/90">Change</button>
                        </li>
                    </ul>
                </AccordionItem>
                
                 <AccordionItem
                    title="Linked Devices"
                    description="Manage active sessions"
                    icon={<Smartphone className="h-5 w-5 text-blue-600" />}
                    isOpen={openAccordion === 'devices'}
                    onToggle={() => handleToggleAccordion('devices')}
                >
                    <ul className="divide-y divide-border pt-2">
                        {activeSessions.map(session => (
                            <li key={session.id} className="flex items-center gap-4 py-4">
                                {session.deviceType === 'desktop' ? <Laptop className="h-6 w-6 text-muted-foreground flex-shrink-0" /> : <Smartphone className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{session.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {session.location} · 
                                        {session.isCurrent ? <span className="text-primary font-semibold"> Active now</span> : ` ${session.lastActive}`}
                                    </p>
                                </div>
                                {!session.isCurrent && (
                                    <button onClick={() => handleLogoutDevice(session.id, session.name)} className="flex items-center gap-1 text-sm font-semibold text-destructive hover:text-destructive/90">
                                        <LogOut size={14} /> Log out
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </AccordionItem>
            </main>
        </div>
    );
};

export default SecurityScreen;