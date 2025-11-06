import React, { useState, useCallback, Suspense, lazy } from 'react';
import { MediaBubble } from './components/MediaBubble';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Transaction, Chat, PaymentDetails } from './types';
import { api } from './services/mockApi';
import { SendMoneyModal } from './components/SendMoneyModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import toast, { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { getCurrencySymbol } from './utils/currency';

const LoadingScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        {/* MediaBubble: circular logo */}
        <MediaBubble
          src="/logo.jpg"
          alt="Ouma-Ge Logo"
          type="image"
          size={96}
          fit="contain"
          className="shadow-lg shadow-primary/20 animate-bounce"
          style={{ backgroundColor: '#ffffff' }}
        />
        <p className="text-muted-foreground mt-4">Ouma-Ge</p>
    </div>
);

// Import Landing Page
const LandingPage = lazy(() => import('./components/LandingPage'));

// Lazy-load all screen components for code-splitting
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const RegisterScreen = lazy(() => import('./components/RegisterScreen'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const WalletTabScreen = lazy(() => import('./components/WalletTabScreen'));
const ChatLayout = lazy(() => import('./components/ChatLayout'));
const ChatScreen = lazy(() => import('./components/ChatScreen'));
const TransactionHistory = lazy(() => import('./components/TransactionHistory'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen'));
const DiscoverScreen = lazy(() => import('./components/DiscoverScreen'));
const MomentsDiscoveryScreen = lazy(() => import('./components/MomentsDiscoveryScreen'));
const MarketDiscoveryScreen = lazy(() => import('./components/MarketDiscoveryScreen'));
const ServiceDiscoveryScreen = lazy(() => import('./components/ServiceDiscoveryScreen'));
const ProfileEditScreen = lazy(() => import('./components/ProfileEditScreen'));
const InternationalTransferScreen = lazy(() => import('./components/InternationalTransferScreen'));
const CartScreen = lazy(() => import('./components/CartScreen'));
const ComingSoonScreen = lazy(() => import('./components/ComingSoonScreen'));
const GlobalSearchScreen = lazy(() => import('./components/GlobalSearchScreen'));
const SelectRecipientScreen = lazy(() => import('./components/SelectRecipientScreen'));
const TransactionDetailScreen = lazy(() => import('./components/TransactionDetailScreen'));
const PaymentMethodsScreen = lazy(() => import('./components/PaymentMethodsScreen'));
const AddPaymentMethodScreen = lazy(() => import('./components/AddPaymentMethodScreen'));
const AddInternationalAccountScreen = lazy(() => import('./components/AddInternationalAccountScreen'));
const KYCForm = lazy(() => import('./components/KYCForm'));
const BudgetScreen = lazy(() => import('./components/BudgetScreen'));
const RecurringTasksScreen = lazy(() => import('./components/RecurringTasksScreen'));
const TaxCenterScreen = lazy(() => import('./components/TaxCenterScreen'));
const TaxLedgerScreen = lazy(() => import('./components/TaxLedgerScreen'));
const SecurityScreen = lazy(() => import('./components/SecurityScreen'));
const ServiceProfileEditScreen = lazy(() => import('./components/ServiceProfileEditScreen'));
const MyJobsScreen = lazy(() => import('./components/MyJobsScreen'));
const MobileRechargeScreen = lazy(() => import('./components/MobileRechargeScreen'));
const BillPaymentScreen = lazy(() => import('./components/BillPaymentScreen'));
const PassportFeeScreen = lazy(() => import('./components/PassportFeeScreen'));
const TrainTicketScreen = lazy(() => import('./components/TrainTicketScreen'));
const BusTicketScreen = lazy(() => import('./components/BusTicketScreen'));
const VideoCallScreen = lazy(() => import('./components/VideoCallScreen'));
const AudioCallScreen = lazy(() => import('./components/AudioCallScreen'));
const QrScanner = lazy(() => import('./components/QrScanner'));
const CreateGroupChatScreen = lazy(() => import('./components/CreateGroupChatScreen'));
const CreateMomentScreen = lazy(() => import('./components/CreateMomentScreen'));
const DarkDhakaScreen = lazy(() => import('./components/DarkDhakaScreen'));
const CreateDDListingScreen = lazy(() => import('./components/CreateDDListingScreen'));
const DDListingDetailScreen = lazy(() => import('./components/DDListingDetailScreen'));
const ServiceRequestScreen = lazy(() => import('./components/ServiceRequestScreen'));
const ServiceProfileViewScreen = lazy(() => import('./components/ServiceProfileViewScreen'));
const CreateServiceRequestScreen = lazy(() => import('./components/CreateServiceRequestScreen'));
const ServiceRequestViewScreen = lazy(() => import('./components/ServiceRequestViewScreen'));
const SellItemScreen = lazy(() => import('./components/SellItemScreen'));
const ProductDetailScreen = lazy(() => import('./components/ProductDetailScreen'));
const ProfileViewScreen = lazy(() => import('./components/ProfileViewScreen'));
const GroupInfoScreen = lazy(() => import('./components/GroupInfoScreen'));
const AddAccountScreen = lazy(() => import('./components/AddAccountScreen'));
const AddCardScreen = lazy(() => import('./components/AddCardScreen'));
const DepositWithdrawScreen = lazy(() => import('./components/DepositWithdrawScreen'));
const GiftFlowScreen = lazy(() => import('./components/GiftFlowScreen'));
const LiveChatScreen = lazy(() => import('./components/LiveChatScreen'));
const SavingsScreen = lazy(() => import('./components/SavingsScreen'));
const TicketsScreen = lazy(() => import('./components/TicketsScreen'));
const PaymentSuccessScreen = lazy(() => import('./components/PaymentSuccessScreen'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen')); // NEW
const NewsScreen = lazy(() => import('./components/NewsScreen')); // NEW

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAppContext();
    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

// --- ROUTE WRAPPER COMPONENTS ---

const ProfileViewWrapper: React.FC = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { usersMap } = useAppContext();
    const userToView = usersMap.get(userId || '');
    if (!userToView) return <div className="p-4 text-muted-foreground">User not found.</div>;
    return <ProfileViewScreen user={userToView} onBack={() => navigate(-1)} />;
};

const ServiceProfileViewWrapper: React.FC = () => {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { usersMap, currentUser } = useAppContext();
    if (!profileId || !currentUser) return <div>Profile not found</div>
    return <ServiceProfileViewScreen profileId={profileId} usersMap={usersMap} onBack={() => navigate(-1)} currentUser={currentUser} />;
};

const ServiceRequestViewWrapper: React.FC = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { usersMap, currentUser } = useAppContext();
    if (!requestId || !currentUser) return <div>Request not found</div>
    return <ServiceRequestViewScreen requestId={requestId} usersMap={usersMap} currentUser={currentUser} onBack={() => navigate(-1)} />;
};

const ChatScreenWrapper: React.FC<{
    onInitiatePinProtectedPayment: (recipient: User, amount: number) => void,
}> = ({ onInitiatePinProtectedPayment }) => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { currentUser, usersMap, refreshData } = useAppContext();
    
    const handleViewProfile = (user: User, chat?: Chat | null) => {
        if (chat?.isGroup) {
            navigate(`/group/${chatId}`);
        } else {
            navigate(`/profile/view/${user.id}`);
        }
    };
    
    if (!chatId || !currentUser) return null;

    return <ChatScreen 
        chatId={chatId} 
        currentUser={currentUser} 
        onBack={() => navigate('/chats')} 
        onViewProfile={handleViewProfile} 
        usersMap={usersMap}
        onInitiatePinProtectedPayment={onInitiatePinProtectedPayment}
        onTransactionComplete={refreshData}
    />;
}

const GroupInfoScreenWrapper: React.FC = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAppContext();
    if (!chatId || !currentUser) return null;
    return <GroupInfoScreen chatId={chatId} currentUser={currentUser} onBack={() => navigate(-1)} />;
};

const GiftFlowScreenWrapper: React.FC = () => {
    const { currentUser, usersMap, refreshData, processPayment } = useAppContext();
    if (!currentUser) return null;
    return <GiftFlowScreen currentUser={currentUser} usersMap={usersMap} onTransactionComplete={refreshData} processPayment={processPayment} />;
};


type PaymentGatewayModalState = {
    isOpen: boolean;
    isLoading: boolean;
    paymentDetails: PaymentDetails | null;
    recipientInfo: {
      name: string;
      avatarUrl?: string;
      logoUrl?: string;
    } | null;
};

const AppRoutes: React.FC = () => {
  const { currentUser, isAuthenticated, usersMap, isLoading, handleLoginSuccess, handleLogout, refreshData, processPayment } = useAppContext();
  const navigate = useNavigate();
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
  const [modalRecipient, setModalRecipient] = useState<User | null>(null);
  
  const [paymentGatewayModalState, setPaymentGatewayModalState] = useState<PaymentGatewayModalState>({
    isOpen: false,
    isLoading: false,
    paymentDetails: null,
    recipientInfo: null,
  });
  
  const handlePaymentGatewaySubmit = useCallback(async (pin: string) => {
    if (!paymentGatewayModalState.paymentDetails) {
        toast.error('Payment details missing.');
        setPaymentGatewayModalState(prev => ({ ...prev, isLoading: false, isOpen: false, paymentDetails: null, recipientInfo: null }));
        return;
    }

    setPaymentGatewayModalState(prev => ({ ...prev, isLoading: true }));
    const transaction = await processPayment(pin, paymentGatewayModalState.paymentDetails);
    
    setPaymentGatewayModalState({ isOpen: false, isLoading: false, paymentDetails: null, recipientInfo: null }); // Close modal

    if (transaction) {
        navigate(`/payment/success/${transaction.id}`);
    } else {
        // Error toast already handled by processPayment
    }
  }, [paymentGatewayModalState.paymentDetails, processPayment, navigate]);


  const handleAmountConfirm = useCallback((amount: number, currency: string) => {
      setIsSendMoneyModalOpen(false);
      if (!modalRecipient) {
        toast.error("Recipient not found for payment.");
        return;
      }
      setPaymentGatewayModalState({
        isOpen: true,
        isLoading: false,
        paymentDetails: { type: 'send_money', recipientId: modalRecipient.id, amount, currency, createChatMessage: true },
        recipientInfo: { name: modalRecipient.name, avatarUrl: modalRecipient.avatarUrl },
    });
  }, [modalRecipient]);

  const handleInitiatePinProtectedPayment = useCallback((recipient: User, amount: number) => {
    setModalRecipient(recipient); // This is needed for SendMoneyModal, not the gateway directly.
    setPaymentGatewayModalState({
        isOpen: true,
        isLoading: false,
        paymentDetails: { type: 'send_money', recipientId: recipient.id, amount, currency: 'BDT', createChatMessage: true },
        recipientInfo: { name: recipient.name, avatarUrl: recipient.avatarUrl },
    });
  }, []);

  const handleInitiateSavingsTransfer = useCallback((amount: number, mode: 'deposit' | 'withdraw') => {
      setPaymentGatewayModalState({
        isOpen: true,
        isLoading: false,
        paymentDetails: { type: 'savings_transfer', amount, mode },
        recipientInfo: { name: mode === 'deposit' ? 'Savings Pot' : 'Main Wallet', avatarUrl: mode === 'deposit' ? '/logo.jpg' : currentUser?.avatarUrl },
      });
  }, [currentUser?.avatarUrl]);

  const handleScanSuccess = useCallback(async (data: string) => {
    navigate(-1);
    try {
        const url = new URL(data);
        if (url.protocol !== 'ouma-ge:') throw new Error("Not an OumaGe QR code.");
        if (url.pathname === '//contact') {
            const phone = url.searchParams.get('phone');
            if (phone) {
                const existingUser = await api.findUserByPhone(phone);
                if (existingUser) {
                    const chat = await api.getOrCreateChat(currentUser!.id, existingUser.id);
                    navigate(`/chats/${chat.id}`);
                } else {
                    toast.error("User not found. The QR code may be outdated or invalid.");
                }
            }
        } else if (url.pathname === '//pay') {
            const phone = url.searchParams.get('phone');
            if (!phone) { toast.error("Invalid payment QR code."); return; }
            const recipient = await api.findUserByPhone(phone);
            if (recipient) {
                setModalRecipient(recipient); // for send money modal which may pop up
                const amountStr = url.searchParams.get('amount');
                if (amountStr) {
                    setPaymentGatewayModalState({
                        isOpen: true,
                        isLoading: false,
                        paymentDetails: { type: 'send_money', recipientId: recipient.id, amount: parseFloat(amountStr), currency: url.searchParams.get('currency') || 'BDT', createChatMessage: true },
                        recipientInfo: { name: recipient.name, avatarUrl: recipient.avatarUrl },
                    });
                } else {
                    setIsSendMoneyModalOpen(true);
                }
            } else toast.error("Recipient not found in OumaGe network.");
        }
    } catch (e) { toast.error("Could not read QR code."); }
  }, [navigate, currentUser]);
  
  const handleHangUp = useCallback((chatId: string, duration: number, type: 'video'|'audio') => {
      if (!currentUser) return;
      api.logCallHistory(chatId, duration, currentUser.id, type, duration > 0 ? 'outgoing' : 'missed');
  }, [currentUser]);
  
  const handleInitiatePayment = useCallback((recipient: User) => {
    setModalRecipient(recipient);
    setIsSendMoneyModalOpen(true);
  }, []);
  
  if (isLoading && !isAuthenticated) return <LoadingScreen />;

  const paymentDetails = paymentGatewayModalState.paymentDetails;
  const paymentCurrency = paymentDetails && (paymentDetails.type === 'send_money' || paymentDetails.type === 'international_transfer')
      ? paymentDetails.currency
      : 'BDT';

  return (
    <div className="h-screen font-sans bg-background text-foreground">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ className: 'text-sm' }}/>
      {currentUser && (
        <>
         <SendMoneyModal isOpen={isSendMoneyModalOpen} onClose={() => setIsSendMoneyModalOpen(false)} recipient={modalRecipient!} onAmountConfirm={handleAmountConfirm} currentUser={currentUser} />
          {paymentGatewayModalState.isOpen && paymentDetails && paymentGatewayModalState.recipientInfo && (
            <PaymentGatewayModal
                isOpen={paymentGatewayModalState.isOpen}
                onClose={() => setPaymentGatewayModalState(prev => ({ ...prev, isOpen: false, paymentDetails: null, recipientInfo: null }))}
                onSubmit={handlePaymentGatewaySubmit}
                isLoading={paymentGatewayModalState.isLoading}
                amount={paymentDetails.amount}
                currency={paymentCurrency}
                recipient={paymentGatewayModalState.recipientInfo}
            />
          )}
        </>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/app" /> : <LoginScreen onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/app" /> : <RegisterScreen />} />
        
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/chats" replace />} />
            <Route path="wallet" element={<WalletTabScreen user={currentUser!} onUpdateUser={refreshData} />} />
            <Route path="chats" element={<ChatLayout />}>
                <Route path=":chatId" element={<ChatScreenWrapper onInitiatePinProtectedPayment={handleInitiatePinProtectedPayment} />} />
            </Route>
            <Route path="history" element={<TransactionHistory user={currentUser!} />} />
            <Route path="history/:transactionId" element={<TransactionDetailScreen usersMap={usersMap} />} />
            <Route path="explore" element={<DiscoverScreen currentUser={currentUser!} usersMap={usersMap} />} />
            <Route path="explore/moments" element={<MomentsDiscoveryScreen currentUser={currentUser!} />} />
            <Route path="explore/new" element={<CreateMomentScreen currentUser={currentUser!} />} />
            <Route path="explore/market" element={<MarketDiscoveryScreen />} />
            <Route path="explore/services" element={<ServiceDiscoveryScreen usersMap={usersMap} />} />
            <Route path="explore/dd" element={<DarkDhakaScreen currentUser={currentUser!} usersMap={usersMap} />} />
            <Route path="explore/dd/new" element={<CreateDDListingScreen currentUser={currentUser!} />} />
            <Route path="explore/dd/:listingId" element={<DDListingDetailScreen currentUser={currentUser!} usersMap={usersMap} />} />
            <Route path="explore/news" element={<NewsScreen />} />
            <Route path="me" element={<ProfileScreen user={currentUser!} onProfileUpdate={refreshData} onLogout={handleLogout} />} />
            <Route path="me/edit" element={<ProfileEditScreen user={currentUser!} onBack={() => navigate(-1)} onProfileUpdate={refreshData} />} />
            <Route path="me/budget" element={<BudgetScreen user={currentUser!} onBack={() => navigate(-1)} onBudgetUpdate={refreshData} />} />
            <Route path="me/recurring-tasks" element={<RecurringTasksScreen user={currentUser!} onBack={() => navigate(-1)} />} />
            <Route path="me/tax-center" element={<TaxCenterScreen user={currentUser!} onBack={() => navigate(-1)} />} />
            <Route path="me/tax-ledger" element={<TaxLedgerScreen user={currentUser!} />} />
            <Route path="me/security" element={<SecurityScreen onBack={() => navigate(-1)} />} />
            <Route path="me/jobs" element={<MyJobsScreen currentUser={currentUser!} onBack={() => navigate(-1)} usersMap={usersMap} />} />
            <Route path="me/service-profile/edit" element={<ServiceProfileEditScreen user={currentUser!} onBack={() => navigate(-1)} onProfileUpdate={refreshData} />} />
            <Route path="me/payment-methods" element={<PaymentMethodsScreen user={currentUser!} onUpdate={refreshData} />} />
            <Route path="me/add-payment-method" element={<AddPaymentMethodScreen />} />
            <Route path="me/add-international-account" element={<AddInternationalAccountScreen onAccountAdded={refreshData} currentUser={currentUser!} />} />
            <Route path="me/kyc" element={<KYCForm user={currentUser!} onBack={() => navigate(-1)} onVerificationComplete={refreshData} />} />
            <Route path="me/savings" element={<SavingsScreen user={currentUser!} onInitiateTransfer={handleInitiateSavingsTransfer} />} />
            <Route path="me/settings" element={<SettingsScreen />} />

            <Route path="wallet/add" element={<AddAccountScreen currentUser={currentUser!} onAccountAdded={refreshData} />} />
            <Route path="wallet/add-card" element={<AddCardScreen onCardAdded={refreshData} />} />
            <Route path="wallet/deposit" element={<DepositWithdrawScreen mode="deposit" user={currentUser!} onTransactionComplete={refreshData} />} />
            <Route path="wallet/withdraw" element={<DepositWithdrawScreen mode="withdraw" user={currentUser!} onTransactionComplete={refreshData} />} />

            <Route path="send" element={<SelectRecipientScreen currentUser={currentUser!} onSelectRecipient={handleInitiatePayment} />} />
            <Route path="scanner" element={<QrScanner onBack={() => navigate(-1)} onScanSuccess={handleScanSuccess} />} />
            <Route path="recharge" element={<MobileRechargeScreen user={currentUser!} onRechargeSuccess={refreshData} />} />
            <Route path="bill-payment" element={<BillPaymentScreen user={currentUser!} onPaymentSuccess={refreshData} />} />
            <Route path="passport-fee" element={<PassportFeeScreen user={currentUser!} onPaymentSuccess={refreshData} />} />
            <Route path="tickets" element={<TicketsScreen />} />
            <Route path="train-ticket" element={<TrainTicketScreen user={currentUser!} onPaymentSuccess={refreshData} />} />
            <Route path="bus-ticket" element={<BusTicketScreen user={currentUser!} onPaymentSuccess={refreshData} />} />
            
            <Route path="international-transfer" element={<InternationalTransferScreen onTransferSuccess={refreshData} />} />

            <Route path="chats/new" element={<CreateGroupChatScreen currentUser={currentUser!} onBack={() => navigate(-1)} onGroupCreated={(chat) => navigate(`/chats/${chat.id}`)} />} />
            <Route path="group/:chatId" element={<GroupInfoScreenWrapper />} />
            <Route path="profile/view/:userId" element={<ProfileViewWrapper />} />
            <Route path="product/:productId" element={<ProductDetailScreen currentUser={currentUser!} onBack={() => navigate(-1)} usersMap={usersMap} />} />
            <Route path="sell" element={<SellItemScreen currentUser={currentUser!} onBack={() => navigate(-1)} />} />
            <Route path="cart" element={<CartScreen currentUser={currentUser!} usersMap={usersMap} onSuccessfulCheckout={refreshData} />} />
            <Route path="gift/confirm/:productId/:recipientId" element={<GiftFlowScreenWrapper />} />
            <Route path="search" element={<GlobalSearchScreen usersMap={usersMap} currentUser={currentUser!} />} />

            <Route path="call/video/:chatId" element={<VideoCallScreen currentUser={currentUser!} onHangUp={(chatId, duration) => handleHangUp(chatId, duration, 'video')} />} />
            <Route path="call/audio/:chatId" element={<AudioCallScreen currentUser={currentUser!} onHangUp={(chatId, duration) => handleHangUp(chatId, duration, 'audio')} />} />
            
            <Route path="service-request/new" element={<CreateServiceRequestScreen currentUser={currentUser!} />} />
            <Route path="service-request/:requestId" element={<ServiceRequestViewWrapper />} />
            <Route path="service-provider/:profileId" element={<ServiceProfileViewWrapper />} />
            <Route path="service/:serviceId" element={<ServiceRequestScreen currentUser={currentUser!} onBack={() => navigate(-1)} />} />

            <Route path="*" element={<Navigate to="/app" />} />
        </Route>
        {/* Top-level routes for absolute paths */}
        <Route path="/live-chat" element={<LiveChatScreen />} />
        <Route path="/coming-soon" element={<ComingSoonScreen />} />
        <Route path="/payment/success/:transactionId" element={<PaymentSuccessScreen />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider storageKey="oumage-ui-theme" defaultTheme="dark">
        <CartProvider>
          <AppProvider>
            <Suspense fallback={<LoadingScreen />}>
              <AppRoutes />
            </Suspense>
          </AppProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}