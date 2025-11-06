
// A simple delay function to simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Imports and Mock Data Definitions ---
import { User, Chat, Message, Transaction, TaxDetails, RecurringTask, MobileOperator, MomentPost, Comment, Product, Story, StoryItem, DDListing, OumaGeService, LinkedAccount, CreditCard, SearchResult, BillSplitRequest, ServiceProviderProfile, ServiceRequest, Offer, Review, Biller, PaymentDetails, InternationalRecipient, TransactionType, NewsPost } from '../types';
import { GoogleGenAI } from '@google/genai';

// Helper to create a generic service user for transactions
const createServiceUser = (id: string, name: string, phone: string, avatarUrl: string, username: string, isMerchant: boolean = false, vatCategoryId?: string): User => ({
    id,
    name,
    phone,
    avatarUrl,
    wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' },
    kycStatus: 'Verified',
    statusMessage: 'Official Service Account',
    presence: 'online',
    isAi: false,
    isMerchant,
    vatCategoryId,
    username,
    balances: { 'BDT': 0 },
    joinedDate: '2023-01-01T00:00:00.000Z'
});

// --- Mock Data ---
// ... (rest of the mock data definitions are unchanged and omitted for brevity)
const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Zayn', phone: '+8801700000001', avatarUrl: 'https://i.imgur.com/gGIc3oM.png', wallet: { balance: 50000, currency: 'BDT', provider: 'Bkash' }, savings: { balance: 120000, currency: 'BDT' }, kycStatus: 'Verified', statusMessage: 'Exploring the digital world.', presence: 'online', isAi: false, monthlyBudget: 25000, username: 'zayn', balances: { 'BDT': 50000, 'USD': 200, 'INR': 15000 }, bio: 'Building the future, one line of code at a time. OumaGe creator.', joinedDate: '2023-01-15T12:00:00.000Z', linkedAccounts: [{ id: 'la-1', type: 'bank', name: 'City Bank', number: '**** 1234', logoUrl: 'https://i.imgur.com/E5J3W5p.png', isDefault: true }, { id: 'la-intl-1', type: 'international', name: 'PayPal', email: 'zayn@example.com', logoUrl: 'https://i.imgur.com/22S0hpx.png' }], creditCards: [{ id: 'cc-1', brand: 'visa', last4: '4242', expiryMonth: '12', expiryYear: '25' }] },
    { id: 'user-2', name: 'Nadia', phone: '+8801800000002', avatarUrl: 'https://i.imgur.com/B9P31eD.png', wallet: { balance: 75000, currency: 'BDT', provider: 'Nagad' }, kycStatus: 'Verified', statusMessage: 'Busy with work!', presence: 'busy', isAi: false, username: 'nadia', balances: { 'BDT': 75000 }, bio: 'Graphic designer and artist.', joinedDate: '2023-02-20T10:00:00.000Z' },
    { id: 'user-3', name: 'Fahim', phone: '+8801900000003', avatarUrl: 'https://i.imgur.com/A6m32s8.png', wallet: { balance: 12000, currency: 'BDT', provider: 'Bkash' }, kycStatus: 'Pending', statusMessage: 'At the movies.', presence: 'offline', isAi: false, isMerchant: true, vatCategoryId: 'vat-cat-1', username: 'fahim_store', balances: { 'BDT': 12000 }, bio: 'Running a small electronics shop. Check out my listings!', joinedDate: '2023-04-10T18:30:00.000Z', serviceProviderProfileId: 'spp-1' },
    { id: 'ai-assistant', name: 'Ouma-Ge AI', phone: '+8800000000000', avatarUrl: '/logo.jpg', wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' }, kycStatus: 'Verified', statusMessage: 'Your personal assistant.', presence: 'online', isAi: true, username: 'oumage_ai', balances: { 'BDT': 0 }, joinedDate: '2023-01-01T00:00:00.000Z' },
    { id: 'service-agent', name: 'Ouma-Ge Services', phone: '+8800000000001', avatarUrl: '/logo.jpg', wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' }, kycStatus: 'Verified', statusMessage: 'Official service agent.', presence: 'online', isAi: false, username: 'oumage_services', balances: { 'BDT': 0 }, joinedDate: '2023-01-01T00:00:00.000Z' },
];

const GOVT_TREASURY = createServiceUser('gov-treasury', 'Government Treasury', '+8800000000002', 'https://i.imgur.com/example4.png', 'govt_treasury');
const BANGLADESH_RAILWAY = createServiceUser('bd-railway', 'Bangladesh Railway', '+8800000000003', 'https://i.imgur.com/example5.png', 'bd_railway');
const BUS_COMPANY = createServiceUser('bus-company', 'Bus Service', '+8800000000004', 'https://i.imgur.com/example6.png', 'bus_service');

const MOCK_BANKS = [
    { id: 'bank-1', name: 'City Bank', logoUrl: 'https://i.imgur.com/E5J3W5p.png', type: 'bank' },
    { id: 'bank-2', name: 'Brac Bank', logoUrl: 'https://i.imgur.com/K0STg6V.png', type: 'bank' },
    { id: 'bank-3', name: 'Dutch-Bangla Bank', logoUrl: 'https://i.imgur.com/5V3h1E0.png', type: 'bank' },
    { id: 'bank-4', name: 'Eastern Bank', logoUrl: 'https://i.imgur.com/1n092yX.png', type: 'bank' },
];

const MOCK_MFS = [
    { id: 'mfs-1', name: 'bKash', logoUrl: 'https://i.imgur.com/m2Qd42w.png', type: 'mobile' },
    { id: 'mfs-2', name: 'Nagad', logoUrl: 'https://i.imgur.com/tZ2Vz7I.png', type: 'mobile' },
    { id: 'mfs-3', name: 'Rocket', logoUrl: 'https://i.imgur.com/PPUg8j2.png', type: 'mobile' },
];


const MOCK_MESSAGES: Message[] = [
    { id: 'msg-1', senderId: 'user-2', text: 'Hey, how is it going?', timestamp: Date.now() - 5 * 60 * 1000, type: 'text', status: 'read' },
    { id: 'msg-2', senderId: 'user-1', text: 'All good! Just working on the new UI.', timestamp: Date.now() - 4 * 60 * 1000, type: 'text', status: 'read' },
    { id: 'msg-3', senderId: 'user-3', text: 'Can you check out this product?', timestamp: Date.now() - 10 * 60 * 1000, type: 'text', status: 'delivered' },
    { id: 'msg-4', senderId: 'ai-assistant', text: 'Hello! I am Ouma-Ge AI. I can help you with local information and payments. How can I assist you today?', timestamp: Date.now() - 60 * 1000, type: 'text', status: 'sent' },
];

const MOCK_CHATS: Chat[] = [
    { id: 'chat-1', participants: [MOCK_USERS[0], MOCK_USERS[1]], messages: MOCK_MESSAGES.slice(0, 2), unreadCount: 0 },
    { id: 'chat-2', participants: [MOCK_USERS[0], MOCK_USERS[2]], messages: [MOCK_MESSAGES[2]], unreadCount: 1, isGroup: true, name: 'Project Alpha' },
    { id: 'chat-ai', participants: [MOCK_USERS[0], MOCK_USERS.find(u => u.id === 'ai-assistant')!], messages: [MOCK_MESSAGES[3]], unreadCount: 0 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn-1', type: 'sent', amount: 500, currency: 'BDT', peer: MOCK_USERS[1], timestamp: Date.now() - 1000000, status: 'Completed', title: 'Lunch' },
    { id: 'txn-2', type: 'received', amount: 2000, currency: 'BDT', peer: MOCK_USERS[2], timestamp: Date.now() - 2000000, status: 'Completed', title: 'Project Payment' },
    { id: 'txn-3', type: 'bill_payment', amount: 1200, currency: 'BDT', peer: createServiceUser('desco', 'DESCO', '', '', 'desco'), timestamp: Date.now() - 3000000, status: 'Completed', title: 'Electricity Bill', taxDetails: { amount: 60, rate: 0.05, type: 'VAT' } },
];

const MOCK_MOMENTS: MomentPost[] = [
    {
        id: 'moment-1',
        author: MOCK_USERS[1], // Nadia
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        text: 'Beautiful sunset at Cox\'s Bazar! 🌅 #sunset #bangladesh',
        imageUrls: ['https://i.imgur.com/3fJ6uV0.jpeg'],
        likes: 125,
        isLiked: false,
        comments: [
            { user: MOCK_USERS[0], text: 'Wow, amazing shot!' },
            { user: MOCK_USERS[2], text: 'So beautiful!' },
        ],
    },
    {
        id: 'moment-2',
        author: MOCK_USERS[0], // Zayn
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        text: 'Check out this cool drone footage I captured. The city looks so different from above!',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        likes: 340,
        isLiked: true,
        comments: [
            { user: MOCK_USERS[1], text: 'This is incredible! You have some serious skills.' },
        ],
    },
     {
        id: 'moment-3',
        author: MOCK_USERS[2], // Fahim
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        text: 'Just unboxed the latest gadget for my shop. It\'s a beast! #tech #unboxing',
        imageUrls: ['https://i.imgur.com/E5J3W5p.png', 'https://i.imgur.com/K0STg6V.png'],
        likes: 88,
        isLiked: false,
        comments: [],
    },
];


const MOCK_PRODUCTS: Product[] = [
    { id: 'prod-1', name: 'Vintage Leather Watch', price: 2500, imageUrl: 'https://i.imgur.com/example_watch.jpg', category: 'Fashion', sellerId: 'user-3', location: { latitude: 23.8103, longitude: 90.4125, address: 'Dhaka, Bangladesh' } },
    { id: 'prod-2', name: 'Wireless Earbuds', price: 3500, imageUrl: 'https://i.imgur.com/example_earbuds.jpg', category: 'Electronics', sellerId: 'user-2' },
];

const MOCK_NEWS_POSTS: NewsPost[] = [
    { id: 'news-1', title: 'Exploring the Sundarbans: A Journey into the Mangrove Forest', source: 'BD Explorer', timestamp: new Date(Date.now() - 3600000).toISOString(), videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://i.imgur.com/Qh6A1Yy.jpeg', views: 1250000 },
    { id: 'news-2', title: 'Dhaka\'s Tech Scene: The Rise of a New Digital Hub', source: 'Tech Today BD', timestamp: new Date(Date.now() - 86400000).toISOString(), videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnailUrl: 'https://i.imgur.com/0I2X2I7.jpeg', views: 890000 },
    { id: 'news-3', title: 'Traditional Bangladeshi Cuisine: A Taste of History', source: 'Foodie Trails', timestamp: new Date(Date.now() - 172800000).toISOString(), videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnailUrl: 'https://i.imgur.com/8zU3cpl.jpeg', views: 2300000 },
];

const MOCK_INTERNATIONAL_RECIPIENTS: InternationalRecipient[] = [
    { name: 'John Doe', email: 'john.d@example.com', countryCode: 'USA', countryName: 'United States', countryFlag: '🇺🇸' },
    { name: 'Jane Smith', email: 'jane.s@example.co.uk', countryCode: 'GBR', countryName: 'United Kingdom', countryFlag: '🇬🇧' },
];

const MOCK_EXCHANGE_RATES: { [key: string]: number } = { USD: 117.5, GBP: 145.2, CAD: 85.3, INR: 1.4, AUD: 77.8, EUR: 127.1, JPY: 0.75, AED: 32.0, SGP: 86.5, MYR: 24.8, SGD: 86.5 };


const MOCK_SERVICE_PROVIDER_PROFILES: ServiceProviderProfile[] = [
    { id: 'spp-1', userId: 'user-3', title: 'Expert Smartphone Repair', category: 'Handyman', description: 'Fast and reliable repair for all smartphone brands. Specializing in screen and battery replacements.', skills: ['iPhone Repair', 'Samsung Repair', 'Screen Replacement'], pricing: 'Starts from ৳500', portfolioImages: ['https://i.imgur.com/example7.jpg', 'https://i.imgur.com/example8.jpg'], rating: 4.8, reviewCount: 25, jobsCompleted: 42 },
];
const MOCK_SERVICE_REQUESTS: ServiceRequest[] = [];
const MOCK_DD_LISTINGS: DDListing[] = [
    { id: 'dd-1', title: 'Urgent package delivery to Gulshan', description: 'Need to send a small box from Dhanmondi to Gulshan-2 by 5 PM today. It contains documents.', price: '300', category: 'Delivery', imageUrl: 'https://i.imgur.com/lJkOqD0.jpeg', sellerId: 'user-2', location: { latitude: 23.7509, longitude: 90.3754, address: 'Dhanmondi, Dhaka' }},
    { id: 'dd-2', title: 'Graphic Designer for a quick logo fix', description: 'My company logo needs a small color correction. Need it done in 1-2 hours. Budget is fixed.', price: '500', category: 'Service', imageUrl: 'https://i.imgur.com/m2a7qJ8.png', sellerId: 'user-1' },
    { id: 'dd-3', title: 'Selling used bicycle', description: 'Phoenix bicycle, 2 years used but in good condition. No issues. Price is slightly negotiable.', price: '4500', category: 'Goods', imageUrl: 'https://i.imgur.com/ZtL8TfX.jpeg', sellerId: 'user-3', location: { latitude: 23.7932, longitude: 90.4132, address: 'Banani, Dhaka' }},
];
// ... more mock data

// --- API Implementation ---
export const api = {
    login: async (phone: string, otp: string): Promise<User | null> => {
        await delay(500);
        if (otp === '1234') { // Mock OTP
            const user = MOCK_USERS.find(u => u.phone === phone);
            return user || MOCK_USERS[0]; // Fallback to first user for demo
        }
        return null;
    },
    sendOtp: async (phone: string): Promise<{ success: boolean; message: string }> => {
        await delay(500);
        if (phone) {
            return { success: true, message: 'OTP sent successfully.' };
        }
        return { success: false, message: 'Invalid phone number.' };
    },
    getTransactions: async (page = 1, limit = 20): Promise<{ transactions: Transaction[], hasMore: boolean }> => {
        await delay(500);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = MOCK_TRANSACTIONS.slice(start, end);
        return { transactions: paginated, hasMore: end < MOCK_TRANSACTIONS.length };
    },
    getChatById: async (chatId: string): Promise<Chat | null> => {
        await delay(100);
        return MOCK_CHATS.find(c => c.id === chatId) || null;
    },
    sendMessage: async (chatId: string, text: string, senderId: string, replyTo?: string): Promise<Message> => {
        await delay(300);
        const newMessage: Message = { id: `msg-${Date.now()}`, senderId, text, timestamp: Date.now(), type: 'text', status: 'sent', replyTo, chatId };
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push(newMessage);
        }
        return newMessage;
    },
    editMessage: async (chatId: string, messageId: string, newText: string): Promise<boolean> => {
        await delay(300);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        const message = chat?.messages.find(m => m.id === messageId);
        if (message) {
            message.text = newText;
            message.isEdited = true;
            return true;
        }
        return false;
    },
    findUserByName: async (name: string): Promise<User | null> => {
        await delay(300);
        return MOCK_USERS.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
    },
    getChats: async (): Promise<Chat[]> => {
        await delay(200);
        return MOCK_CHATS;
    },
    getCurrentUser: async (): Promise<User> => {
        await delay(100);
        return MOCK_USERS[0];
    },
    getAllUsers: async (): Promise<User[]> => {
        await delay(100);
        return MOCK_USERS;
    },
    findUserByPhone: async (phone: string): Promise<User | null> => {
        await delay(300);
        return MOCK_USERS.find(u => u.phone === phone) || null;
    },
    getOrCreateChat: async (userId1: string, userId2: string): Promise<Chat> => {
        await delay(200);
        let chat = MOCK_CHATS.find(c => !c.isGroup && c.participants.every(p => [userId1, userId2].includes(p.id)));
        if (!chat) {
            const user1 = MOCK_USERS.find(u => u.id === userId1);
            const user2 = MOCK_USERS.find(u => u.id === userId2);
            if (user1 && user2) {
                chat = { id: `chat-${Date.now()}`, participants: [user1, user2], messages: [], unreadCount: 0 };
                MOCK_CHATS.push(chat);
            }
        }
        return chat!;
    },
    // Add many other missing functions with mock implementations
    logCallHistory: async (chatId: string, duration: number, senderId: string, type: 'video' | 'audio', status: 'missed' | 'outgoing') => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            const message: Message = { id: `call-${Date.now()}`, senderId, timestamp: Date.now(), type: 'call_history', status: 'sent', callHistoryData: { type, duration, status } };
            chat.messages.push(message);
        }
    },
    sendVoiceMessage: async (chatId: string, senderId: string, audioUrl: string, duration: number): Promise<void> => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push({ id: `voice-${Date.now()}`, senderId, timestamp: Date.now(), type: 'voice', status: 'sent', voiceUrl: audioUrl, duration });
        }
    },
    sendImageMessage: async (chatId: string, senderId: string, imageUrl: string): Promise<void> => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push({ id: `img-${Date.now()}`, senderId, timestamp: Date.now(), type: 'image', status: 'sent', imageUrl });
        }
    },
    reactToMessage: async (chatId: string, messageId: string, emoji: string, userId: string): Promise<boolean> => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        const message = chat?.messages.find(m => m.id === messageId);
        if (message) {
            if (!message.reactions) message.reactions = {};
            if (!message.reactions[emoji]) message.reactions[emoji] = [];
            const userIndex = message.reactions[emoji].indexOf(userId);
            if (userIndex > -1) {
                message.reactions[emoji].splice(userIndex, 1);
            } else {
                message.reactions[emoji].push(userId);
            }
            return true;
        }
        return false;
    },
    deleteMessage: async (chatId: string, messageId: string): Promise<boolean> => {
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        const message = chat?.messages.find(m => m.id === messageId);
        if (message) {
            message.isDeleted = true;
            message.text = undefined;
            return true;
        }
        return false;
    },
    submitKyc: async (userId: string, nidNumber: string, nidPhoto: File): Promise<boolean> => {
        await delay(1500);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            user.kycStatus = 'Pending';
            return true;
        }
        return false;
    },
    getVatCategoryInfo: async (categoryId: string): Promise<{ name: string; rate: number } | null> => {
        await delay(100);
        if (categoryId === 'vat-cat-1') {
            return { name: 'General Goods', rate: 0.05 };
        }
        return null;
    },
    updateMonthlyBudget: async (userId: string, budget: number): Promise<boolean> => {
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            user.monthlyBudget = budget;
            return true;
        }
        return false;
    },
    getRecurringTasks: async (): Promise<RecurringTask[]> => {
        await delay(300);
        return [];
    },
    saveRecurringTask: async (taskData: any): Promise<boolean> => {
        await delay(500);
        return true;
    },
    toggleTaskCompletion: async (taskId: string): Promise<RecurringTask | null> => {
        await delay(300);
        return null;
    },
    createGroupChat: async (creatorId: string, participantIds: string[], groupName: string): Promise<Chat> => {
        await delay(500);
        const participants = MOCK_USERS.filter(u => participantIds.includes(u.id));
        const newChat: Chat = {
            id: `chat-${Date.now()}`,
            name: groupName,
            isGroup: true,
            creatorId,
            participants,
            messages: [],
            unreadCount: 0,
        };
        MOCK_CHATS.push(newChat);
        return newChat;
    },
    addParticipantToGroup: async (chatId: string, userIds: string[], actorId: string): Promise<Chat | null> => { 
        await delay(400);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (!chat || !chat.isGroup) return null;
        
        const actor = MOCK_USERS.find(u => u.id === actorId);
        const usersToAdd = MOCK_USERS.filter(u => userIds.includes(u.id) && !chat.participants.some(p => p.id === u.id));

        if (usersToAdd.length > 0 && actor) {
            chat.participants.push(...usersToAdd);
            const names = usersToAdd.map(u => u.name).join(', ');
            const systemMessage: Message = {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                text: `${actor.name} added ${names} to the group.`,
                timestamp: Date.now(),
                type: 'system',
                status: 'sent',
            };
            chat.messages.push(systemMessage);
        }
        return chat;
    },
    removeParticipantFromGroup: async (chatId: string, userId: string, actorId: string): Promise<Chat | null> => { 
        await delay(400);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (!chat || !chat.isGroup) return null;

        const actor = MOCK_USERS.find(u => u.id === actorId);
        const userToRemove = MOCK_USERS.find(u => u.id === userId);

        const participantIndex = chat.participants.findIndex(p => p.id === userId);
        if (participantIndex > -1 && actor && userToRemove) {
            chat.participants.splice(participantIndex, 1);
            
            let text = '';
            if (actorId === userId) {
                text = `${actor.name} left the group.`;
            } else {
                text = `${actor.name} removed ${userToRemove.name} from the group.`;
            }

            const systemMessage: Message = {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                text: text,
                timestamp: Date.now(),
                type: 'system',
                status: 'sent',
            };
            chat.messages.push(systemMessage);
        }
        return chat;
    },
    renameGroupChat: async (chatId: string, newName: string, actorId: string): Promise<Chat | null> => { 
        await delay(300);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (!chat || !chat.isGroup) return null;
        
        const actor = MOCK_USERS.find(u => u.id === actorId);
        if (actor) {
            chat.name = newName;
            const systemMessage: Message = {
                id: `msg-sys-${Date.now()}`,
                senderId: 'system',
                text: `${actor.name} renamed the group to "${newName}".`,
                timestamp: Date.now(),
                type: 'system',
                status: 'sent',
            };
            chat.messages.push(systemMessage);
        }
        return chat;
    },
    getStories: async (): Promise<Story[]> => { await delay(400); return []; },
    markStoryAsSeen: async (userId: string): Promise<boolean> => { return true; },
    getMobileOperators: async (): Promise<MobileOperator[]> => {
        await delay(200);
        return [
            { id: 'gp', name: 'Grameenphone', logoUrl: 'https://i.imgur.com/example_gp.png' },
            { id: 'bl', name: 'Banglalink', logoUrl: 'https://i.imgur.com/example_bl.png' },
            { id: 'robi', name: 'Robi', logoUrl: 'https://i.imgur.com/example_robi.png' },
            { id: 'airtel', name: 'Airtel', logoUrl: 'https://i.imgur.com/example_airtel.png' },
        ];
    },
    getMoments: async (page: number, limit: number): Promise<{ posts: MomentPost[], hasMore: boolean }> => {
        await delay(800);
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = MOCK_MOMENTS.slice(start, end);
        return { posts: paginated, hasMore: end < MOCK_MOMENTS.length };
    },
    likeMoment: async (postId: string, like: boolean): Promise<boolean> => {
        await delay(150);
        const moment = MOCK_MOMENTS.find(p => p.id === postId);
        if (moment) {
            moment.isLiked = like;
            moment.likes += like ? 1 : -1;
            return true;
        }
        return false;
    },
    addCommentToMoment: async (postId: string, userId: string, text: string): Promise<Comment | null> => {
        await delay(400);
        const moment = MOCK_MOMENTS.find(p => p.id === postId);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (moment && user) {
            const newComment: Comment = { user, text };
            moment.comments.push(newComment);
            return newComment;
        }
        return null;
    },
    createMoment: async (authorId: string, text: string, imageUrls?: string[], videoUrl?: string): Promise<MomentPost | null> => {
        await delay(1000);
        const author = MOCK_USERS.find(u => u.id === authorId);
        if (!author) return null;

        const newMoment: MomentPost = {
            id: `moment-${Date.now()}`,
            author,
            timestamp: new Date().toISOString(),
            text,
            imageUrls,
            videoUrl,
            likes: 0,
            isLiked: false,
            comments: [],
        };
        MOCK_MOMENTS.unshift(newMoment);
        return newMoment;
    },
    getProducts: async (): Promise<Product[]> => { await delay(500); return MOCK_PRODUCTS; },
    getProductById: async (productId: string): Promise<Product | null> => { await delay(200); return MOCK_PRODUCTS.find(p => p.id === productId) || null; },
    listProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
        const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
        MOCK_PRODUCTS.push(newProduct);
        return newProduct;
    },
    getNewsPosts: async (): Promise<NewsPost[]> => {
        await delay(600);
        return MOCK_NEWS_POSTS;
    },
    createDDListing: async (listingData: any): Promise<boolean> => { return true; },
    getOumaGeServiceById: async (serviceId: string): Promise<OumaGeService | null> => { return null; },
    getAvailableInstitutions: async (): Promise<{ banks: any[], mfs: any[] }> => { 
        await delay(300);
        return { banks: MOCK_BANKS, mfs: MOCK_MFS }; 
    },
    initiateAccountLink: async (institutionId: string, accountNumber: string): Promise<{ success: boolean, message?: string, accountHolderName?: string }> => { 
        await delay(1000);
        return { success: true, accountHolderName: MOCK_USERS[0].name }; 
    },
    verifyAccountLinkOtp: async (userId: string, institutionId: string, accountNumber: string, otp: string): Promise<LinkedAccount | null> => { 
        await delay(800);
        if (otp !== '1234') return null; // Mock OTP check

        const user = MOCK_USERS.find(u => u.id === userId);
        const allInstitutions = [...MOCK_BANKS, ...MOCK_MFS];
        const institution = allInstitutions.find(i => i.id === institutionId);

        if (user && institution) {
            if (!user.linkedAccounts) user.linkedAccounts = [];
            
            const newAccount: LinkedAccount = {
                id: `la-${Date.now()}`,
                type: institution.type as 'bank' | 'mobile' | 'international',
                name: institution.name,
                number: `**** ${accountNumber.slice(-4)}`,
                logoUrl: institution.logoUrl,
                isDefault: user.linkedAccounts.filter(acc => acc.type !== 'international').length === 0, // Make first local account default
            };
            user.linkedAccounts.push(newAccount);
            return newAccount;
        }
        return null;
    },
    linkCreditCard: async (userId: string, cardData: any): Promise<boolean> => { 
        await delay(600);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            if (!user.creditCards) user.creditCards = [];
            const newCard: CreditCard = {
                id: `cc-${Date.now()}`,
                brand: cardData.brand,
                last4: cardData.number.slice(-4),
                expiryMonth: cardData.expiry.split('/')[0].trim(),
                expiryYear: cardData.expiry.split('/')[1].trim(),
            };
            user.creditCards.push(newCard);
            return true;
        }
        return false;
    },
    getTaxLedgerData: async (year: number): Promise<any> => { return { transactions: [], totalVAT: 0, totalAIT: 0, grandTotal: 0 }; },
    getAllServiceProviderProfiles: async (): Promise<ServiceProviderProfile[]> => { return MOCK_SERVICE_PROVIDER_PROFILES; },
    getServiceProviderProfileById: async (profileId: string): Promise<ServiceProviderProfile | null> => { return MOCK_SERVICE_PROVIDER_PROFILES.find(p => p.id === profileId) || null; },
    createOrUpdateServiceProviderProfile: async (userId: string, profileData: any): Promise<boolean> => { return true; },
    getReviewsForProvider: async (providerId: string): Promise<Review[]> => { return []; },
    requestBooking: async (clientId: string, providerId: string, details: any): Promise<Chat> => { return MOCK_CHATS[0]; },
    getServiceRequests: async (): Promise<ServiceRequest[]> => { return MOCK_SERVICE_REQUESTS; },
    getServiceRequestById: async (requestId: string): Promise<ServiceRequest | null> => { return MOCK_SERVICE_REQUESTS.find(r => r.id === requestId) || null; },
    getOffersForRequest: async (requestId: string): Promise<Offer[]> => { return []; },
    hasUserReviewed: async (requestId: string, userId: string): Promise<boolean> => { return false; },
    acceptOffer: async (offerId: string): Promise<boolean> => { return true; },
    markJobComplete: async (requestId: string, userId: string): Promise<ServiceRequest | null> => { return null; },
    confirmCompletionAndPay: async (requestId: string, userId: string): Promise<Transaction | null> => { return null; },
    getServiceRequestsForUser: async (userId: string): Promise<{ asClient: ServiceRequest[], asProvider: ServiceRequest[] }> => {
        const asClient = MOCK_SERVICE_REQUESTS.filter(r => r.clientId === userId);
        const asProvider: ServiceRequest[] = []; // This would be more complex in a real app
        return { asClient, asProvider };
    },
    createOffer: async (offerData: any): Promise<boolean> => { return true; },
    getBillers: async (): Promise<Biller[]> => { return []; },
    getTransactionById: async (transactionId: string): Promise<Transaction | null> => { return MOCK_TRANSACTIONS.find(t => t.id === transactionId) || null; },
    globalSearch: async (term: string, currentUserId: string): Promise<SearchResult> => { return { users: [], chats: [], products: [], moments: [] }; },
    reverseGeocode: async (lat: number, lng: number): Promise<string> => { return 'Mock Address, Dhaka'; },
    getDDListings: async (): Promise<DDListing[]> => { await delay(400); return MOCK_DD_LISTINGS; },
    getDDListingById: async (listingId: string): Promise<DDListing | null> => { await delay(200); return MOCK_DD_LISTINGS.find(l => l.id === listingId) || null; },
    deleteDDListing: async (listingId: string, userId: string): Promise<boolean> => { return true; },
    linkInternationalAccount: async function(this: typeof api, userId: string, account: any): Promise<boolean> {
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            if (!user.linkedAccounts) user.linkedAccounts = [];

            // Remove existing international accounts to enforce one at a time for simplicity
            user.linkedAccounts = user.linkedAccounts.filter(acc => acc.type !== 'international');

            let logoUrl = '';
            if (account.providerName === 'PayPal') {
                logoUrl = 'https://i.imgur.com/22S0hpx.png';
            } else if (account.providerName === 'Wise') {
                logoUrl = 'https://i.imgur.com/5c2223s.png';
            }

            const newAccount: LinkedAccount = {
                id: `intl-${Date.now()}`,
                type: 'international',
                name: account.providerName,
                email: account.email,
                logoUrl,
            };
            user.linkedAccounts.push(newAccount);
            return true;
        }
        return false;
    },
    getRecentInternationalRecipients: async (): Promise<InternationalRecipient[]> => {
        await delay(300);
        return MOCK_INTERNATIONAL_RECIPIENTS;
    },
    getLiveExchangeRate: async (currency: string): Promise<number> => {
        await delay(150);
        const baseRate = MOCK_EXCHANGE_RATES[currency as keyof typeof MOCK_EXCHANGE_RATES] || 0;
        const fluctuation = (Math.random() - 0.5) * 0.5; // Fluctuation of +/- 0.25
        return baseRate + fluctuation;
    },
     getInternationalTransferFee: async function(this: typeof api, provider: 'PayPal' | 'Wise' | string, amountBDT: number, targetCurrency: string): Promise<{ fee: number; rate: number }> {
        await delay(350); // Simulate API call for quote
        const baseRate = await this.getLiveExchangeRate(targetCurrency);
        let fee = 0;
        // Simulate different fee structures
        if (provider === 'Wise') {
            // Wise: ~0.5% variable fee + 50 BDT fixed fee
            fee = (amountBDT * 0.005) + 50;
        } else { // Default to PayPal-like fees
            // PayPal: ~1.5% variable fee + 100 BDT fixed fee
            fee = (amountBDT * 0.015) + 100;
        }
        return { fee: parseFloat(fee.toFixed(2)), rate: baseRate };
    },
    updateUserAvatar: async (userId: string, avatarUrl: string): Promise<boolean> => {
        await delay(300);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            user.avatarUrl = avatarUrl;
            return true;
        }
        return false;
    },
    updateUserProfile: async (userId: string, name: string, phone: string, status: string, bio: string): Promise<boolean> => {
        await delay(400);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
            user.name = name;
            user.phone = phone;
            user.statusMessage = status;
            user.bio = bio;
            return true;
        }
        return false;
    },
    deleteCreditCard: async (userId: string, cardId: string): Promise<boolean> => { 
        await delay(400);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user && user.creditCards) {
            const initialLength = user.creditCards.length;
            user.creditCards = user.creditCards.filter(card => card.id !== cardId);
            return user.creditCards.length < initialLength;
        }
        return false;
    },
    unlinkAccount: async (userId: string, accountId: string): Promise<boolean> => {
        await delay(400);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user && user.linkedAccounts) {
            const accountToUnlink = user.linkedAccounts.find(acc => acc.id === accountId);
            if (!accountToUnlink) return false;

            const initialLength = user.linkedAccounts.length;
            user.linkedAccounts = user.linkedAccounts.filter(acc => acc.id !== accountId);
            
            // If the unlinked account was default, make another one default
            if (accountToUnlink.isDefault && user.linkedAccounts.length > 0) {
                const firstLocalAccount = user.linkedAccounts.find(acc => acc.type !== 'international');
                if(firstLocalAccount) {
                    firstLocalAccount.isDefault = true;
                }
            }

            return user.linkedAccounts.length < initialLength;
        }
        return false;
    },
    setAsDefaultAccount: async (userId: string, accountId: string): Promise<User | null> => {
        await delay(300);
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user && user.linkedAccounts) {
            let found = false;
            user.linkedAccounts.forEach(acc => {
                if(acc.type !== 'international') {
                     if (acc.id === accountId) {
                        acc.isDefault = true;
                        found = true;
                    } else {
                        acc.isDefault = false;
                    }
                }
            });
            return found ? user : null;
        }
        return null;
    },
    sendMoney: async (senderId: string, recipientId: string, amount: number, currency: string, createChatMessage?: boolean): Promise<Transaction | null> => {
        const recipient = MOCK_USERS.find(u => u.id === recipientId);
        if (!recipient) return null;
        return { id: `txn-${Date.now()}`, type: 'sent' as const, amount, currency, peer: recipient, timestamp: Date.now(), status: 'Completed', title: `Sent to ${recipient.name}` };
    },
    depositToSavings: async (userId: string, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'savings_deposit' as const, amount, currency: 'BDT', peer: MOCK_USERS.find(u => u.id === userId)!, timestamp: Date.now(), status: 'Completed', title: `Savings Deposit` }; },
    withdrawFromSavings: async (userId: string, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'savings_withdraw' as const, amount, currency: 'BDT', peer: MOCK_USERS.find(u => u.id === userId)!, timestamp: Date.now(), status: 'Completed', title: `Savings Withdrawal` }; },
    performMobileRecharge: async (userId: string, operatorName: string, phone: string, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'mobile_recharge' as const, amount, currency: 'BDT', peer: { ...MOCK_USERS[0], name: operatorName, phone }, timestamp: Date.now(), status: 'Completed', title: `Recharge to ${phone}` }; },
    performBillPayment: async (userId: string, biller: Biller, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'bill_payment' as const, amount, currency: 'BDT', peer: { ...MOCK_USERS[0], name: biller.name }, timestamp: Date.now(), status: 'Completed', title: `${biller.name} Bill` }; },
    performPassportFeePayment: async (userId: string, applicationId: string, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'govt_fee' as const, amount, currency: 'BDT', peer: GOVT_TREASURY, timestamp: Date.now(), status: 'Completed', title: `Passport Fee: ${applicationId}` }; },
    performTrainTicketPurchase: async (userId: string, details: any, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'train_ticket' as const, amount, currency: 'BDT', peer: BANGLADESH_RAILWAY, timestamp: Date.now(), status: 'Completed', title: `Train Ticket: ${details.from} to ${details.to}` }; },
    performBusTicketPurchase: async (userId: string, details: any, amount: number): Promise<Transaction | null> => { return { id: `txn-${Date.now()}`, type: 'bus_ticket' as const, amount, currency: 'BDT', peer: BUS_COMPANY, timestamp: Date.now(), status: 'Completed', title: `Bus Ticket: ${details.operator}` }; },
    performInternationalTransfer: async (userId: string, amount: number, currency: string, recipientInfo: any): Promise<Transaction | null> => { 
        const newTx: Transaction = { id: `txn-${Date.now()}`, type: 'exchange', amount, currency: 'BDT', peer: { ...MOCK_USERS[0], name: recipientInfo.name }, timestamp: Date.now(), status: 'Completed', title: `Transfer to ${recipientInfo.name}` };
        MOCK_TRANSACTIONS.unshift(newTx);
        
        // Add to recent recipients
        if (!MOCK_INTERNATIONAL_RECIPIENTS.find(r => r.email === recipientInfo.email)) {
            MOCK_INTERNATIONAL_RECIPIENTS.unshift({
                name: recipientInfo.name,
                email: recipientInfo.email,
                countryCode: recipientInfo.countryCode,
                countryName: recipientInfo.countryName,
                countryFlag: recipientInfo.countryFlag,
            });
            if (MOCK_INTERNATIONAL_RECIPIENTS.length > 5) { MOCK_INTERNATIONAL_RECIPIENTS.pop(); }
        }

        return newTx;
    },
    buyProduct: async (userId: string, productId: string, deliveryAddress: string): Promise<Transaction | null> => {
        const product = MOCK_PRODUCTS.find(p => p.id === productId);
        if (!product) return null;
        const seller = MOCK_USERS.find(u => u.id === product.sellerId);
        if (!seller) return null;
        return { id: `txn-${Date.now()}`, type: 'order_placed' as const, amount: product.price, currency: 'BDT', peer: seller, timestamp: Date.now(), status: 'Completed', title: product.name };
    },
    purchaseAsGift: async (senderId: string, recipientId: string, productId: string, deliveryAddress: string, giftMessage?: string): Promise<Transaction | null> => {
        const product = MOCK_PRODUCTS.find(p => p.id === productId);
        if (!product) return null;
        const seller = MOCK_USERS.find(u => u.id === product.sellerId);
        if (!seller) return null;
        const recipient = MOCK_USERS.find(u => u.id === recipientId);
        if (!recipient) return null;
        // In a real app, you would also create a gift message in the chat
        return { id: `txn-${Date.now()}`, type: 'order_placed' as const, amount: product.price, currency: 'BDT', peer: seller, timestamp: Date.now(), status: 'Completed', title: `Gift for ${recipient.name}` };
    },
    // ... all other api functions
    
    // Example of a function that was cleaned up
    submitReview: async (reviewData: Omit<Review, 'id' | 'timestamp' | 'authorId'>): Promise<Review> => {
        await delay(700);
        const newReview: Review = {
            id: `review-${Date.now()}`,
            timestamp: Date.now(),
            authorId: MOCK_USERS[0].id, // Assuming current user is always the author for this mock
            ...reviewData,
        };
        // In a real DB, you'd add this to a reviews table.
        return newReview;
    },

    createServiceRequest: async (requestData: Omit<ServiceRequest, 'id' | 'timestamp' | 'status'>): Promise<ServiceRequest> => {
        await delay(500);
        const newRequest: ServiceRequest = {
            id: `sr-${Date.now()}`,
            timestamp: Date.now(),
            status: 'Open',
            ...requestData,
        };
        MOCK_SERVICE_REQUESTS.unshift(newRequest);
        return newRequest;
    },
    sendRedEnvelope: async (chatId: string, senderId: string, amount: number, greeting: string): Promise<Message | null> => {
        await delay(400);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            const newMessage: Message = {
                id: `re-${Date.now()}`,
                senderId,
                timestamp: Date.now(),
                type: 'red_envelope',
                status: 'sent',
                redEnvelopeData: { amount, greeting, isOpened: false },
            };
            chat.messages.push(newMessage);
            return newMessage;
        }
        return null;
    },
    openRedEnvelope: async (chatId: string, messageId: string, userId: string): Promise<boolean> => {
        await delay(600);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        const message = chat?.messages.find(m => m.id === messageId);
        if (message && message.redEnvelopeData && !message.redEnvelopeData.isOpened) {
            message.redEnvelopeData.isOpened = true;
            return true;
        }
        return false;
    },
    payBillSplitRequest: async (chatId: string, messageId: string, userId: string): Promise<boolean> => {
        await delay(700);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        const message = chat?.messages.find(m => m.id === messageId);
        if (message && message.billSplitRequestData) {
            const participant = message.billSplitRequestData.participants.find(p => p.userId === userId);
            if (participant && !participant.paid) {
                participant.paid = true;
                return true;
            }
        }
        return false;
    },
    sendBillSplitRequest: async (chatId: string, requestData: Omit<BillSplitRequest, 'id'>): Promise<Message | null> => {
        await delay(400);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            const newBillSplitRequest: BillSplitRequest = {
                id: `bsr-${Date.now()}`,
                ...requestData
            };
            const newMessage: Message = {
                id: `bsr-msg-${Date.now()}`,
                senderId: requestData.creatorId,
                timestamp: Date.now(),
                type: 'bill_split_request',
                status: 'sent',
                billSplitRequestData: newBillSplitRequest,
            };
            chat.messages.push(newMessage);
            return newMessage;
        }
        return null;
    },
    markChatAsRead: async (chatId: string, currentUserId: string): Promise<boolean> => {
        await delay(300);
        const chat = MOCK_CHATS.find(c => c.id === chatId);
        if (chat) {
            // Only update if the last message was from someone else
            const lastMessage = chat.messages[chat.messages.length - 1];
            if (lastMessage && lastMessage.senderId !== currentUserId) {
                chat.unreadCount = 0;
            }

            let statusChanged = false;
            chat.messages.forEach(msg => {
                if (msg.senderId !== currentUserId && msg.status !== 'read' && msg.status !== 'seen') {
                    msg.status = 'read';
                    statusChanged = true;
                }
            });
            return statusChanged;
        }
        return false;
    },
};
