import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Chat, Message, PaymentDetails, Transaction } from '../types';
import { api } from '../services/mockApi';
import * as db from '../utils/db';
import toast from 'react-hot-toast';
import { subscribeUserToPush } from '../utils/notifications';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  usersMap: Map<string, User>;
  chats: Chat[];
  totalUnreadCount: number;
  refreshData: () => Promise<void>;
  refreshChats: () => Promise<void>;
  handleLoginSuccess: (user: User) => Promise<void>;
  handleLogout: () => Promise<void>;
  // Centralized payment processing function
  processPayment: (pin: string, payment: PaymentDetails) => Promise<Transaction | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, User>>(new Map());
  const navigate = useNavigate();

  const refreshChats = useCallback(async () => {
    if (!navigator.onLine) {
        console.log("Offline, skipping chats refresh.");
        return;
    }
    try {
        const chatsData = await api.getChats();
        setChats(chatsData);
        await db.saveData('chats', chatsData);
    } catch (e) {
        console.log("Polling for chats failed, likely offline.", e);
    }
  }, []);

  const refreshData = useCallback(async () => {
      if (!navigator.onLine) {
        console.log("Offline, skipping data refresh.");
        return;
      }
      try {
        const [user, allUsers, chatsData] = await Promise.all([api.getCurrentUser(), api.getAllUsers(), api.getChats()]);
        setCurrentUser(user);
        setUsersMap(new Map(allUsers.map(u => [u.id, u])));
        setChats(chatsData);
        await Promise.all([
            db.saveData('currentUser', user),
            db.saveData('allUsers', allUsers),
            db.saveData('chats', chatsData),
        ]);
      } catch (e) {
        console.error("Failed to refresh and cache user data", e);
        throw e;
      }
  }, []);

  // Centralized payment processing logic
  const processPayment = useCallback(async (pin: string, payment: PaymentDetails): Promise<Transaction | null> => {
    if (pin !== '1234') { // Mock PIN validation
        toast.error('Incorrect PIN!');
        return null;
    }
    if (!currentUser) {
        toast.error('User not authenticated for payment.');
        return null;
    }

    let transaction: Transaction | null = null;
    try {
        switch (payment.type) {
            case 'send_money':
                transaction = await api.sendMoney(currentUser.id, payment.recipientId, payment.amount, payment.currency, payment.createChatMessage);
                break;
            case 'savings_transfer':
                const apiCall = payment.mode === 'deposit' ? api.depositToSavings : api.withdrawFromSavings;
                transaction = await apiCall(currentUser.id, payment.amount);
                break;
            case 'mobile_recharge':
                transaction = await api.performMobileRecharge(currentUser.id, payment.operatorName, payment.phone, payment.amount);
                break;
            case 'bill_payment':
                transaction = await api.performBillPayment(currentUser.id, payment.biller, payment.amount);
                break;
            case 'passport_fee':
                transaction = await api.performPassportFeePayment(currentUser.id, payment.applicationId, payment.amount);
                break;
            case 'train_ticket':
                transaction = await api.performTrainTicketPurchase(currentUser.id, payment.details, payment.amount);
                break;
            case 'bus_ticket':
                transaction = await api.performBusTicketPurchase(currentUser.id, payment.details, payment.amount);
                break;
            case 'international_transfer':
                transaction = await api.performInternationalTransfer(currentUser.id, payment.amount, payment.currency, payment.recipientInfo);
                break;
            case 'buy_product':
                transaction = await api.buyProduct(currentUser.id, payment.productId, payment.deliveryAddress);
                break;
            case 'buy_cart_items':
                 // This type handles multiple product purchases for the cart
                let allSuccessful = true;
                for (const item of payment.items) {
                    if (!item.deliveryAddress) {
                        toast.error(`Please set a delivery address for one of your cart items. You can do this by removing it and adding it from the product's detail page.`);
                        allSuccessful = false;
                        break;
                    }
                    const singlePurchaseTx = await api.buyProduct(currentUser.id, item.productId, item.deliveryAddress);
                    if (!singlePurchaseTx) {
                        allSuccessful = false;
                        // Log error for specific item, but try to continue with others if possible or break
                        console.error(`Failed to purchase product ${item.productId}`);
                    }
                }
                if (!allSuccessful) {
                    toast.error('One or more purchases failed. Please check your balance and try again.');
                    return null; // Indicate overall failure for cart
                }
                // For cart checkout, return a dummy transaction or the first one.
                // In a real app, you'd have a single checkout transaction ID.
                const firstItem = payment.items[0];
                if (firstItem) {
                    const product = await api.getProductById(firstItem.productId);
                    if (product) {
                        transaction = {
                            id: `txn-cart-${Date.now()}`,
                            type: 'order_placed',
                            amount: payment.grandTotal, // Use grandTotal for the summary transaction
                            currency: 'BDT',
                            peer: usersMap.get(product.sellerId) || currentUser, // Peer to first item's seller or self
                            timestamp: Date.now(),
                            status: 'Completed',
                            title: 'Cart Checkout',
                            subtitle: `${payment.items.length} items purchased`
                        }
                    }
                }
                break;
            case 'purchase_as_gift':
                transaction = await api.purchaseAsGift(currentUser.id, payment.recipientId, payment.productId, payment.deliveryAddress, payment.giftMessage);
                break;
            default:
                toast.error('Unknown payment type.');
                return null;
        }

        if (transaction) {
            await refreshData(); // Refresh all user/chat/transaction data
            return transaction;
        } else {
            toast.error('Transaction failed. Please check your balance.');
            return null;
        }
    } catch (error: any) {
        console.error("Payment processing error:", error);
        toast.error(error.message || 'An unexpected error occurred during payment.');
        return null;
    }
  }, [currentUser, refreshData, usersMap]);


  useEffect(() => {
    const initializeApp = async () => {
      let isCacheLoaded = false;
      try {
        const cachedUser = await db.loadData('currentUser');
        if (cachedUser) {
          setCurrentUser(cachedUser);
          setIsAuthenticated(true);
          const [cachedAllUsers, cachedChats] = await Promise.all([
            db.loadData('allUsers'),
            db.loadData('chats'),
          ]);
          if (cachedAllUsers) setUsersMap(new Map(cachedAllUsers.map((u: User) => [u.id, u])));
          if (cachedChats) setChats(cachedChats);
          isCacheLoaded = true;
          setIsLoading(false);
        }
      } catch (e) { console.error("Failed to load cached data", e); }

      try {
        await refreshData();
        const freshUser = await db.loadData('currentUser');
        if (freshUser) setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to fetch fresh data:", err);
        if (!isCacheLoaded) {
          setError("Could not connect to services. Please check your internet connection and try again.");
        }
      } finally {
        if (!isCacheLoaded) setIsLoading(false);
      }
    };
    initializeApp();
  }, [refreshData]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    const interval = setInterval(refreshChats, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser, refreshChats]);

  useEffect(() => {
    const handleOnline = () => {
        toast.success("You are back online!", { id: 'network-status' });
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(sw => (sw as any).sync.register('sync-new-messages'));
        }
    };
    const handleOffline = () => toast.error("You are offline. Messages will be sent when you're back online.", { id: 'network-status', duration: 6000 });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline',handleOffline);

    const handleSWMessage = async (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_MESSAGES') {
            toast.loading('Syncing offline messages...', { id: 'sync-messages' });
            try {
                const messages = await db.getQueuedMessages() as Message[];
                for (const msg of messages) {
                    await api.sendMessage(msg.chatId!, msg.text!, msg.senderId!, msg.replyTo);
                    await db.deleteQueuedMessage(msg.id);
                }
                if ((await db.getQueuedMessages()).length === 0) {
                  toast.success('All messages sent!', { id: 'sync-messages' });
                  refreshData();
                }
            } catch (error) {
                toast.error('Failed to send some messages.', { id: 'sync-messages' });
            }
        }
    };
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline',handleOffline);
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
    };
  }, [refreshData]);

  const handleLoginSuccess = useCallback(async (user: User) => {
    try {
        setCurrentUser(user);
        setIsAuthenticated(true);
        await refreshData();
        navigate('/');
        setTimeout(async () => {
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') subscribeUserToPush();
          }
        }, 3000);
    } catch (error) { toast.error("Failed to load your data after login."); }
  }, [navigate, refreshData]);

  const handleLogout = useCallback(async () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
        await db.saveData('currentUser', null);
        await db.saveData('allUsers', null);
        await db.saveData('chats', null);
    } catch (error) { console.error("Failed to clear cache on logout:", error); }
    navigate('/login');
  }, [navigate]);

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    usersMap,
    chats,
    totalUnreadCount,
    refreshData,
    refreshChats,
    handleLoginSuccess,
    handleLogout,
    processPayment,
  };

  if (error) return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">{error}</div>;

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
