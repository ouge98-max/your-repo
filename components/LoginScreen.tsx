import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaBubble } from './MediaBubble';
import { User } from '../types';
import { api } from '../services/mockApi';
import { ArrowLeftIcon, WalletIcon, Briefcase, ShoppingBagIcon, ChevronRight, Fingerprint, Delete, Loader2Icon } from './icons';
import toast from 'react-hot-toast';
import { hapticFeedback } from '../utils/interaction';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

type Step = 'welcome' | 'login' | 'otp';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.06,4.72C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.317-11.28-7.946l-6.06,4.72C9.656,39.663,16.318,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.593,44,30.916,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
);

const MOCKUP_SCREENS = [
  'https://i.imgur.com/gGIc3oM.png', // Wallet
  'https://i.imgur.com/B9P31eD.png', // Chat
  'https://i.imgur.com/A6m32s8.png', // Discover
];

const PhoneMockup: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentScreen(prev => (prev + 1) % MOCKUP_SCREENS.length);
        }, 4000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div aria-hidden="true" className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background">
                 {MOCKUP_SCREENS.map((screen, index) => (
                    <img 
                        key={screen}
                        src={screen} 
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentScreen ? 'opacity-100' : 'opacity-0'}`} 
                        alt="App screen mockup"
                    />
                ))}
            </div>
        </div>
    );
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: number | undefined;
    if (step === 'otp' && countdown > 0) {
        timer = window.setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    }
    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    }
  }, [step, countdown]);
  
  const handleFinalLogin = useCallback(async (currentOtp: string) => {
    setLoading(true);
    setError('');
    const user = await api.login(phone, currentOtp);
    setLoading(false);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Invalid OTP code. Please try again.');
      setOtp(''); // Clear OTP on failure
    }
  }, [phone, onLoginSuccess]);

  useEffect(() => {
      if (otp.length === 4) {
          handleFinalLogin(otp);
      }
  }, [otp, handleFinalLogin]);


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const response = await api.sendOtp(phone);
    setLoading(false);
    if (response.success) {
      setStep('otp');
      setCountdown(60);
    } else {
      setError(response.message);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    const response = await api.sendOtp(phone);
    setLoading(false);

    if (response.success) {
      toast.success('A new OTP has been sent.');
      setCountdown(60);
      setOtp('');
    } else {
      setError(response.message);
    }
  };
  
  const handleGoogleLogin = async () => {
    toast.loading('Simulating Google Sign-In...');
    setLoading(true);
    const user = await api.login('+8801700000001', '1234');
    setLoading(false);
    toast.dismiss();
    if (user) {
        onLoginSuccess(user);
    } else {
        toast.error("Simulated Google Sign-In failed.");
    }
  };
  
  const handleBiometricLogin = async () => {
      toast('Using Face ID / Touch ID...', { icon: '🔒' });
      setLoading(true);
      const user = await api.login('+8801700000001', '1234');
      setLoading(false);
      toast.dismiss();
      if (user) {
          onLoginSuccess(user);
      } else {
          toast.error("Simulated Biometric Sign-In failed.");
      }
  };
  
  const renderContent = () => {
    switch (step) {
      case 'welcome':
          return (
             <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl mx-auto animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Column: Content */}
                        <div className="text-center md:text-left">
                            <MediaBubble
                              src="/logo.jpg"
                              alt="OumaGe Logo"
                              type="image"
                              size={64}
                              fit="contain"
                              className="mx-auto md:mx-0 mb-4 animate-slide-in-from-bottom shadow-lg shadow-primary/20 ring-1 ring-black/5 dark:ring-white/10"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 text-foreground animate-slide-in-from-bottom" style={{ animationDelay: '0.1s' }}>
                                The Future is One App.
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0 animate-slide-in-from-bottom" style={{ animationDelay: '0.2s' }}>
                                Chat with friends, pay your bills, and discover a world of services. All for free, all in OumaGe.
                            </p>

                            <ul className="mt-8 space-y-4 text-left max-w-md mx-auto md:mx-0">
                                <li className="flex items-start gap-4 p-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg animate-slide-in-from-bottom" style={{ animationDelay: '0.4s' }}>
                                    <div className="bg-primary/10 p-2.5 rounded-full text-primary mt-1">
                                        <WalletIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">Free Transfers</h3>
                                        <p className="text-muted-foreground text-sm">Send money to anyone, anytime, for free within the chat.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg animate-slide-in-from-bottom" style={{ animationDelay: '0.5s' }}>
                                    <div className="bg-primary/10 p-2.5 rounded-full text-primary mt-1">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">Service Marketplace</h3>
                                        <p className="text-muted-foreground text-sm">Hire professionals, find jobs, or offer your skills securely.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 p-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg animate-slide-in-from-bottom" style={{ animationDelay: '0.6s' }}>
                                    <div className="bg-primary/10 p-2.5 rounded-full text-primary mt-1">
                                        <ShoppingBagIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-card-foreground">Local Commerce</h3>
                                        <p className="text-muted-foreground text-sm">Buy and sell goods with people in your community.</p>
                                    </div>
                                </li>
                            </ul>

                            <footer className="mt-10 max-w-sm mx-auto md:mx-0 animate-slide-in-from-bottom" style={{ animationDelay: '0.8s' }}>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setStep('login')}
                                        className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-all flex items-center justify-center gap-2"
                                    >
                                        Get Started with Phone
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-colors disabled:opacity-50">
                                       <GoogleIcon /> Sign in with Google
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground pt-4 text-center">
                                    By continuing, you agree to our Terms & Privacy Policy.
                                </p>
                            </footer>
                        </div>

                        {/* Right Column: Phone Mockup */}
                        <div className="hidden md:flex justify-center items-center">
                          <PhoneMockup />
                        </div>
                    </div>
                </div>
            </div>
          );
      case 'login':
        return (
          <div className="min-h-screen flex flex-col justify-center items-center p-4 animate-fade-in">
            <div className="w-full max-w-sm">
                 <div className="text-center mb-6">
                    <MediaBubble
                      src="/logo.jpg"
                      alt="OumaGe Logo"
                      type="image"
                      size={64}
                      fit="contain"
                      className="mx-auto shadow-lg shadow-primary/20"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                </div>
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-8 relative">
                    <button onClick={() => setStep('welcome')} aria-label="Go back to welcome screen" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground p-2 rounded-full"><ArrowLeftIcon className="h-5 w-5"/></button>
                    <form onSubmit={handleSendOtp}>
                        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Enter Your Phone</h2>
                        <p className="text-muted-foreground mb-6 text-center">We'll send you a verification code.</p>
                        {error && <p role="alert" className="text-destructive text-center text-sm mb-4">{error}</p>}
                        <div className="mb-4">
                            <label htmlFor="phone" className="sr-only">Phone Number</label>
                            <input
                            id="phone" type="tel" value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-background border border-input text-foreground rounded-lg shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-lg"
                            placeholder="+8801XXXXXXXXX" required autoFocus
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </form>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink mx-4 text-xs text-muted-foreground">Or</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>
                     <div className="space-y-3">
                        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-colors disabled:opacity-50">
                           <GoogleIcon /> Sign in with Google
                        </button>
                        <button onClick={handleBiometricLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring transition-colors disabled:opacity-50">
                           <Fingerprint className="h-6 w-6" /> Use Face ID / Biometrics
                        </button>
                    </div>
                </div>
            </div>
          </div>
        );
        case 'otp':
            const handleKeypadClick = (key: string) => {
                if (loading) return;
                hapticFeedback();
                if (key === 'backspace') {
                    setOtp(prev => prev.slice(0, -1));
                } else if (otp.length < 4) {
                    setOtp(prev => prev + key);
                }
            };
            
            const keypadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

            return (
                 <div className="min-h-screen flex flex-col justify-center items-center p-4 animate-fade-in">
                    <div className="w-full max-w-sm">
                         <div className="text-center mb-6">
                            <MediaBubble
                              src="/logo.jpg"
                              alt="OumaGe Logo"
                              type="image"
                              size={64}
                              fit="contain"
                              className="mx-auto shadow-lg shadow-primary/20"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                        </div>
                        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl p-8 relative">
                            <button onClick={() => { setStep('login'); setError(''); setOtp('') }} aria-label="Go back to phone number entry" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground p-2 rounded-full"><ArrowLeftIcon className="h-5 w-5"/></button>
                            <div className="relative">
                                {loading && (
                                    <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
                                        <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                                        <p className="mt-2 text-muted-foreground">Verifying...</p>
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Verify Code</h2>
                                <p className="text-muted-foreground mb-6 text-center">Enter the code sent to {phone}</p>
                                {error && <p role="alert" className="text-destructive text-center text-sm mb-4">{error}</p>}
                                
                                <div className="flex justify-center gap-4 my-8 h-4 items-center">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < otp.length ? 'bg-primary scale-110' : 'bg-input'}`} />
                                    ))}
                                </div>
        
                                <div className="grid grid-cols-3 gap-4">
                                    {keypadLayout.map((key, index) => (
                                        <div key={index} className="flex items-center justify-center">
                                            {key === '' ? <div /> : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleKeypadClick(key)}
                                                    disabled={loading}
                                                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-light bg-secondary hover:bg-muted active:bg-accent transition-colors disabled:opacity-50"
                                                    aria-label={key === 'backspace' ? 'Delete last digit' : `Enter digit ${key}`}
                                                >
                                                    {key === 'backspace' ? <Delete className="h-7 w-7" /> : key}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 text-center text-sm">
                                {countdown > 0 ? (
                                    <p aria-live="polite" aria-atomic="true" className="text-muted-foreground">Resend code in {countdown}s</p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="font-semibold text-primary hover:text-primary/90 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
            );
    }
  }

  return (
    <div>
        {renderContent()}
    </div>
  );
};

export default LoginScreen;
