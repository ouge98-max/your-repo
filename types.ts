
export type PaymentDetails = 
  { type: 'send_money', recipientId: string, amount: number, currency: string, createChatMessage?: boolean } |
  { type: 'savings_transfer', amount: number, mode: 'deposit' | 'withdraw' } |
  { type: 'mobile_recharge', operatorName: string, phone: string, amount: number } |
  { type: 'bill_payment', biller: Biller, amount: number } |
  { type: 'passport_fee', applicationId: string, amount: number } |
  { type: 'train_ticket', details: { from: string, to: string, passengers: number }, amount: number } |
  { type: 'bus_ticket', details: { from: string, to: string, operator: string, passengers: number }, amount: number } |
  { type: 'international_transfer', amount: number, currency: string, recipientInfo: any } |
  { type: 'buy_product', productId: string, deliveryAddress: string, amount: number } | // For single product purchase
  { type: 'buy_cart_items', items: { productId: string, deliveryAddress?: string }[], grandTotal: number, amount: number } | // For cart checkout
  { type: 'purchase_as_gift', recipientId: string, productId: string, deliveryAddress: string, giftMessage?: string, amount: number };

export type Status = 'sending' | 'sent' | 'delivered' | 'read' | 'seen' | 'failed';

export type User = {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  wallet: {
    balance: number;
    currency: string;
    provider: 'Bkash' | 'Nagad';
  };
  savings?: {
    balance: number;
    currency: string;
  };
  kycStatus: 'Not Verified' | 'Pending' | 'Verified';
  statusMessage: string;
  presence: 'online' | 'offline' | 'busy';
  isAi: boolean;
  isMerchant?: boolean;
  vatCategoryId?: string;
  monthlyBudget?: number;
  username: string;
  balances: { [currency: string]: number };
  bio?: string;
  joinedDate: string;
  linkedAccounts?: LinkedAccount[];
  creditCards?: CreditCard[];
  serviceProviderProfileId?: string;
};

export type Chat = {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
  isGroup?: boolean;
  name?: string;
  creatorId?: string;
};

export type Message = {
  id: string;
  senderId: string;
  text?: string; // Optional for image/voice/payment messages
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'payment' | 'system' | 'ai_action_request' | 'red_envelope' | 'ai_service_request_confirmation' | 'booking_request' | 'bill_split_request' | 'gift' | 'call_history';
  status: Status;
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number; // For voice messages in seconds
  paymentDetails?: {
    amount: number;
    currency: string;
    baseAmount?: number;
    taxAmount?: number;
  };
  aiActionRequest?: AiActionRequest;
  aiServiceRequestData?: AiServiceRequestData;
  redEnvelopeData?: { amount: number; greeting: string; isOpened: boolean; };
  giftDetails?: GiftDetails;
  callHistoryData?: CallHistoryData;
  billSplitRequestData?: BillSplitRequest; 
  bookingRequestData?: { serviceTitle: string; date: string; time: string; note: string; }; // Added for booking requests
  reactions?: { [emoji: string]: string[] }; // NEW: Emojis and list of user IDs who reacted
  isStreaming?: boolean; // For AI responses that stream text
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: string; // ID of the message this message is replying to
  chatId?: string; // Used for offline queue messages (denormalized)
  groundingChunks?: GroundingChunk[];
};

export type GroundingChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
        uri: string;
      }[];
    };
  };
}

export type GiftDetails = {
  productId: string;
  productName: string;
  productImageUrl: string;
  message?: string;
}

export type CallHistoryData = {
  type: 'video' | 'audio';
  duration: number; // in seconds
  status: 'outgoing' | 'incoming' | 'missed';
}

export type BillSplitParticipant = {
  userId: string;
  amount: number;
  paid: boolean;
}

export type BillSplitRequest = {
  id: string;
  creatorId: string;
  title: string;
  totalAmount: number;
  participants: BillSplitParticipant[];
}

export type TransactionType =
  | 'sent'
  | 'received'
  | 'in'
  | 'out'
  | 'salary'
  | 'topup'
  | 'withdraw'
  | 'service'
  | 'order_placed'
  | 'bill_payment'
  | 'mobile_recharge'
  | 'exchange'
  | 'savings_deposit'
  | 'savings_withdraw'
  | 'investment_buy'
  | 'loan_repayment'
  | 'interest_earned'
  | 'cashback'
  | 'mission_reward'
  | 'referral_bonus'
  | 'staking_deposit'
  | 'staking_withdraw'
  | 'staking_interest'
  | 'booking_payment'
  | 'govt_fee'
  | 'train_ticket'
  | 'bus_ticket'

export const FILTERABLE_TRANSACTION_TYPES: { key: TransactionType; label: string }[] = [
  { key: 'sent', label: 'Sent Money' },
  { key: 'received', label: 'Received Money' },
  { key: 'topup', label: 'Deposits' },
  { key: 'withdraw', label: 'Withdrawals' },
  { key: 'bill_payment', label: 'Bills' },
  { key: 'mobile_recharge', label: 'Recharge' },
  { key: 'order_placed', label: 'Shopping' },
  { key: 'service', label: 'Services' },
  { key: 'savings_deposit', label: 'Savings Deposit' },
  { key: 'savings_withdraw', label: 'Savings Withdraw' },
  { key: 'govt_fee', label: 'Govt. Fees' },
  { key: 'train_ticket', label: 'Train Tickets' },
  { key: 'bus_ticket', label: 'Bus Tickets' },
  { key: 'exchange', label: 'International' },
  { key: 'salary', label: 'Salary' },
  { key: 'loan_repayment', label: 'Loan Repayment' },
];

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  peer: User;
  timestamp: number;
  status: 'Pending' | 'Completed' | 'Failed';
  title?: string;
  subtitle?: string;
  taxDetails?: TaxDetails;
};

export type TaxDetails = {
  amount: number;
  rate: number;
  type: 'VAT' | 'AIT';
};

export type RecurringTask = {
  id: string;
  recipient: User;
  amount: number;
  recurrence: 'daily' | 'weekly' | 'monthly' | null; // null for one-time
  notes?: string;
  createdAt: number;
  nextDueDate: number;
  isCompleted?: boolean;
};

export type MobileOperator = {
  id: string;
  name: string;
  logoUrl: string;
};

export type MomentPost = {
  id: string;
  author: User;
  timestamp: string;
  text: string;
  imageUrls?: string[];
  videoUrl?: string; // NEW: Added videoUrl field
  likes: number;
  isLiked: boolean;
  comments: Comment[];
};

export type Comment = {
  user: User;
  text: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  sellerId: string;
  location?: { latitude: number; longitude: number; address: string };
};

export type StoryItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  timestamp: string;
};

export type Story = {
  userId: string;
  user: User;
  items: StoryItem[];
  seen: boolean;
};

export type DDListing = {
  id: string;
  title: string;
  description?: string;
  price: string; // Can be a number or "Inquire"
  category: 'Goods' | 'Delivery' | 'Service';
  imageUrl: string;
  sellerId: string;
  location?: { latitude: number; longitude: number; address: string };
};

export type OumaGeService = {
  id: string;
  name: string;
  description: string;
  iconName: string; // Name of Lucide icon
};

export type LinkedAccount = {
  id: string;
  type: 'bank' | 'mobile' | 'international';
  name: string;
  number?: string; // For bank/mobile
  email?: string; // For international (e.g., PayPal)
  logoUrl: string;
  isDefault?: boolean;
};

export type CreditCard = {
  id: string;
  brand: 'visa' | 'mastercard' | 'unknown';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
};

export type ServiceCategory = 'Creative & Design' | 'Tech & Development' | 'Handyman' | 'Tutoring' | 'Cleaning' | 'Other';
export const ALL_SERVICE_CATEGORIES: ServiceCategory[] = ['Creative & Design', 'Tech & Development', 'Handyman', 'Tutoring', 'Cleaning', 'Other'];

export type SearchResult = {
  users: User[];
  chats: (Chat & { matchedMessage?: Message })[];
  products: Product[];
  moments?: MomentPost[]; // NEW: Added moments to search result
};

export type ServiceProviderProfile = {
  id: string;
  userId: string;
  title: string;
  category: ServiceCategory;
  description: string;
  skills: string[];
  pricing: string;
  portfolioImages: string[];
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
};

export type ServiceRequest = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  budget?: string;
  location?: { latitude: number; longitude: number; address: string; };
  status: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  timestamp: number;
  hiredOfferId?: string;
  providerCompletedTimestamp?: number;
  clientConfirmedCompletionTimestamp?: number;
};

export type Offer = {
  id: string;
  serviceRequestId: string;
  providerId: string;
  price: number;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  timestamp: number;
};

export type Review = {
  id: string;
  authorId: string;
  reviewForId: string;
  serviceRequestId: string;
  rating: number;
  text: string;
  timestamp: number;
};

export type BillerCategory = 'Electricity' | 'Gas' | 'Water' | 'Internet' | 'Telephone';

export type BillerField = {
  id: string;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
};

export type Biller = {
  id: string;
  name: string;
  category: BillerCategory;
  logoUrl: string;
  fields: BillerField[];
};

export type AiActionRequest = {
  id: string;
  type: 'send_money';
  recipient: User;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type AiServiceRequestData = {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  budget: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};

export type WebSecurityCheckResult = {
  safetyLevel: 'safe' | 'suspicious' | 'unsafe';
  summary: string;
  threats: string[];
};

export interface CartItem {
  productId: string;
  quantity: number;
  deliveryAddress?: string;
}

export type TransactionAnalysisResult = {
    summary: string;
    categories: {
        category: string;
        amount: number;
    }[];
    tip: string;
};

export type SavingsGoalSuggestion = {
  goal_name: string;
  target_amount: number;
  monthly_deposit: number;
  timeline_months: number;
  reason: string;
};

export type InternationalRecipient = {
  name: string;
  email: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
};

// NEW: Added NewsPost type for news videos
export type NewsPost = {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
};
