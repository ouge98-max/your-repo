import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Chat, Message, AiActionRequest, AiServiceRequestData, ServiceCategory, ALL_SERVICE_CATEGORIES, BillSplitRequest, BillSplitParticipant, GiftDetails, GroundingChunk } from '../types';
import { api } from '../services/mockApi';
// FIX: Replaced non-existent `VideoCameraIcon` with the correct `VideoIcon`.
import { PaperAirplaneIcon, ReadReceiptIcon, ArrowLeftIcon, MicrophoneIcon, PaperclipIcon, CameraIcon, WalletIcon, VideoIcon, GiftIcon, ImageIcon, SparklesIcon, Phone, Send, Reply, X, Trash2, MapPinIcon, Receipt, PencilIcon, CurrencyDollarIcon, AlertTriangle, PhoneOffIcon, Globe, CalendarDays } from './icons';
import { Avatar } from './Avatar';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse, Chat as GenAiChat } from '@google/genai';
import { AiActionCard } from './AiActionCard';
import toast from 'react-hot-toast';
import { SendRedEnvelopeModal } from './SendRedEnvelopeModal';
import { useSwipeToReply } from '../hooks/useSwipeToReply';
import { AiServiceRequestCard } from './AiServiceRequestCard';
import MarkdownIt from 'markdown-it';
import * as db from '../utils/db';
import { RedEnvelopeBubble } from './RedEnvelopeBubble';
import { CameraView } from './CameraView';
import { MessageActions } from './MessageActions';
import { getCurrencySymbol } from '../utils/currency';
import { SendMoneyModal } from './SendMoneyModal';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { BillSplitCreationModal } from './BillSplitCreationModal';
import { BillSplitBubble } from './BillSplitBubble';
import { hapticFeedback } from '../utils/interaction';
import { AttachmentSheet } from './AttachmentSheet';
import { GalleryPicker } from './GalleryPicker';
import { ConfirmModal } from './ConfirmModal';
import { getMessagePreview } from '../utils/previews';
import { Header } from './Header';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const md = new MarkdownIt();

// --- AI System Instruction & Function Declarations ---
const sendMoneyFunctionDeclaration: FunctionDeclaration = {
  name: 'sendMoney',
  parameters: {
    type: Type.OBJECT,
    description: 'Initiates a money transfer to a specified recipient from the user\'s contacts.',
    properties: {
      recipientName: {
        type: Type.STRING,
        description: 'The name of the person to send money to. This should match a name in the user\'s contacts.',
      },
      amount: {
        type: Type.NUMBER,
        description: 'The amount of money to send.',
      },
    },
    required: ['recipientName', 'amount'],
  },
};

const aiSystemInstruction = `You are Ouma-Ge AI, a helpful assistant within a chat and payment app. Your primary functions are:
1.  Answering questions and providing information using Google Maps.
2.  Helping users send money to their contacts by using the sendMoney function.
When a user asks to send money, pay someone, or a similar request, you MUST use the sendMoney function. Do not ask for confirmation in text; the function call itself will trigger a confirmation UI.
For generic greetings, introduce yourself and briefly mention your capabilities (location info and payments). Be helpful and concise.`;


const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

type MessageGrouping = 'single' | 'start' | 'middle' | 'end';

type RenderableItem = 
    | { type: 'message'; message: Message; grouping: MessageGrouping; }
    | { type: 'date_separator'; date: string; id: string; };

const GiftBubble: React.FC<{ message: Message, isCurrentUser: boolean }> = ({ message, isCurrentUser }) => {
    const { giftDetails } = message;
    if (!giftDetails) return null;

    const navigate = useNavigate();

    return (
        <div className="w-64">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-3 rounded-lg border border-white/10 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-white">
                    <GiftIcon size={20} className="text-yellow-300" />
                    <p className="font-bold text-sm">
                        {isCurrentUser ? "You sent a gift!" : "You received a gift!"}
                    </p>
                </div>
                <div 
                    onClick={() => navigate(`/product/${giftDetails.productId}`)}
                    className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-md cursor-pointer hover:bg-gray-900/80"
                >
                    <img src={giftDetails.productImageUrl} alt={giftDetails.productName} className="w-12 h-12 object-cover rounded" />
                    <div className="overflow-hidden">
                        <p className="text-white font-semibold text-sm truncate">{giftDetails.productName}</p>
                    </div>
                </div>
                {giftDetails.message && (
                    <p className="text-gray-300 text-sm italic border-l-2 border-yellow-400 pl-2">
                        "{giftDetails.message}"
                    </p>
                )}
            </div>
        </div>
    );
};

interface MessageBubbleProps {
    item: Extract<RenderableItem, { type: 'message' }>;
    isCurrentUser: boolean;
    onSetReply: (message: Message) => void;
    onViewImage: (imageUrl: string) => void;
    usersMap: Map<string, User>;
    chat: Chat;
    onConfirmAiAction: (request: AiActionRequest) => void;
    onCancelAiAction: (request: AiActionRequest) => void;
    onConfirmAiServiceRequest: (request: AiServiceRequestData) => void;
    onCancelAiServiceRequest: (request: AiServiceRequestData) => void;
    onOpenRedEnvelope: (message: Message) => void;
    onOpenMenu: (event: React.MouseEvent | React.TouchEvent, message: Message) => void;
    onPayBillSplit: (message: Message, participant: BillSplitParticipant) => void;
    currentUser: User;
    onRetryMessage: (message: Message) => void;
    onViewProfile: (user: User) => void;
}
    
const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ item, isCurrentUser, onSetReply, onViewImage, usersMap, chat, onConfirmAiAction, onCancelAiAction, onConfirmAiServiceRequest, onCancelAiServiceRequest, onOpenRedEnvelope, onOpenMenu, onPayBillSplit, currentUser, onRetryMessage, onViewProfile }) => {
    const { message, grouping } = item;
    const bubbleRef = useRef<HTMLDivElement>(null);
    const { touchHandlers, transform, iconOpacity } = useSwipeToReply({
        onSwipe: () => onSetReply(message),
        isCurrentUser,
    });
    
    const prevStatusRef = useRef(message.status);
    const [isAnimating, setIsAnimating] = useState(false);
    const longPressTimer = useRef<number | null>(null);
    const navigate = useNavigate();

    const handlePressStart = (e: React.TouchEvent) => {
        longPressTimer.current = window.setTimeout(() => {
            onOpenMenu(e, message);
        }, 500);
    };

    const handlePressEnd = () => {
        if (longPressTimer.current !== null) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };
    
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenMenu(e, message);
    };

    const handleBubbleClick = (e: React.MouseEvent) => {
        if (message.status === 'failed') {
            e.preventDefault();
            e.stopPropagation();
            onRetryMessage(message);
        }
    };

    useEffect(() => {
        if (prevStatusRef.current !== message.status && (message.status === 'delivered' || message.status === 'read' || message.status === 'seen')) {
          setIsAnimating(true);
          const timer = setTimeout(() => setIsAnimating(false), 500);
          return () => clearTimeout(timer);
        }
        prevStatusRef.current = message.status;
    }, [message.status]);
    
    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const repliedToMessage = message.replyTo ? chat.messages.find(m => m.id === message.replyTo) : null;
    const repliedToSender = repliedToMessage ? usersMap.get(repliedToMessage.senderId) : null;
    const isReplyingToCurrentUser = repliedToSender?.id === currentUser.id;

    const handleReplyClick = () => {
        if (repliedToMessage) {
            const element = document.getElementById(`message-${repliedToMessage.id}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element?.classList.add('highlight-message');
            setTimeout(() => {
                element?.classList.remove('highlight-message');
            }, 1500);
        }
    };

    const renderContent = () => {
        if (message.isDeleted) {
            return <p className="italic text-muted-foreground">Message deleted</p>;
        }
        const textContent = (message.text || '') + (message.isStreaming ? '...' : '');
        switch (message.type) {
            case 'text':
                return (
                    <div>
                        <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: md.render(textContent) }} />
                        {message.groundingChunks && message.groundingChunks.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-secondary-foreground/20">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">Sources</h4>
                                <ul className="space-y-2">
                                    {message.groundingChunks.map((chunk, index) => {
                                        if (chunk.maps?.uri) {
                                            return (
                                                <li key={`map-${index}`}>
                                                    <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{chunk.maps.title || chunk.maps.uri}</span>
                                                    </a>
                                                </li>
                                            );
                                        }
                                        if (chunk.web?.uri) {
                                            return (
                                                <li key={`web-${index}`}>
                                                    <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                                        <Globe className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                                                    </a>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'image':
                return (
                    <button onClick={() => onViewImage(message.imageUrl!)} className="block">
                        <img src={message.imageUrl} alt="Sent" className="rounded-lg max-w-xs max-h-80 object-cover" />
                    </button>
                );
            case 'payment': {
                if (!message.paymentDetails) return null;
                const { amount, currency } = message.paymentDetails;
                return isCurrentUser ? (
                    <div className="w-60 text-primary-foreground">
                        <div className="bg-gradient-to-br from-primary to-brand-600 p-3 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2 border-b border-white/20 pb-2 mb-2">
                                <WalletIcon size={20} />
                                <p className="font-bold">Payment Sent</p>
                            </div>
                            <p className="text-4xl font-bold">{getCurrencySymbol(currency)}{amount.toLocaleString()}</p>
                            <p className="text-sm opacity-90">to {chat.participants.find(p => p.id !== currentUser.id)?.name}</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-60 text-card-foreground">
                        <div className="bg-card p-3 rounded-lg shadow-md border border-border">
                            <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
                                <WalletIcon size={20} />
                                <p className="font-bold">Payment Received</p>
                            </div>
                            <p className="text-3xl font-bold">{getCurrencySymbol(currency)}{amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">from {usersMap.get(message.senderId)?.name}</p>
                        </div>
                    </div>
                );
            }
            case 'voice':
                return <VoiceMessagePlayer audioUrl={message.voiceUrl!} duration={message.duration!} />;
            case 'system':
                // This case is handled outside the bubble now
                return null;
            case 'ai_action_request':
                return message.aiActionRequest && <AiActionCard request={message.aiActionRequest} onConfirm={onConfirmAiAction} onCancel={onCancelAiAction} />;
            case 'ai_service_request_confirmation':
                return message.aiServiceRequestData && <AiServiceRequestCard request={message.aiServiceRequestData} onConfirm={onConfirmAiServiceRequest} onCancel={onCancelAiServiceRequest} />;
            case 'red_envelope':
                return message.redEnvelopeData && <RedEnvelopeBubble message={message} isCurrentUser={isCurrentUser} onOpen={onOpenRedEnvelope} />;
            case 'booking_request': {
                const { bookingRequestData } = message;
                if (!bookingRequestData) return null;
                return (
                    <div className="w-64">
                        <div className="bg-card p-3 rounded-lg shadow-md border border-border">
                            <div className="flex items-center gap-2 border-b border-border pb-2 mb-2">
                                <CalendarDays size={20} className="text-primary"/>
                                <p className="font-bold">Booking Request</p>
                            </div>
                            <p className="font-semibold text-sm truncate">{bookingRequestData.serviceTitle}</p>
                            <p className="text-sm text-muted-foreground">{bookingRequestData.date} at {bookingRequestData.time}</p>
                            {bookingRequestData.note && <p className="text-xs text-muted-foreground italic mt-1">Note: "{bookingRequestData.note}"</p>}
                        </div>
                    </div>
                );
            }
            case 'bill_split_request':
                return message.billSplitRequestData && <BillSplitBubble message={message} onPay={onPayBillSplit} currentUser={currentUser} />;
            case 'gift':
                return <GiftBubble message={message} isCurrentUser={isCurrentUser} />;
            case 'call_history': {
                const { callHistoryData } = message;
                if (!callHistoryData) return null;
                const { type, duration, status } = callHistoryData;
                const isMissed = status === 'missed';
                let text = '';
                if (isMissed) {
                    text = isCurrentUser ? 'Call unanswered' : 'Missed call';
                } else {
                    text = isCurrentUser ? 'Outgoing call' : 'Incoming call';
                }
                // FIX: Replaced non-existent `VideoCameraIcon` with the correct `VideoIcon`.
                const Icon = type === 'video' ? VideoIcon : Phone;
                const missedColor = 'text-destructive';
                return (
                    <div className={`w-64 p-3 rounded-lg shadow-md flex items-center gap-3 ${isCurrentUser ? 'bg-white/10 text-white' : 'bg-card text-card-foreground border border-border'}`}>
                        <Icon className={`h-6 w-6 flex-shrink-0 ${isMissed ? missedColor : (isCurrentUser ? 'text-white/70' : 'text-muted-foreground')}`} />
                        <div className="flex-1">
                            <p className={`font-semibold ${isMissed ? missedColor : ''}`}>{text}</p>
                            {!isMissed && duration > 0 && <p className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-muted-foreground'}`}>{formatDuration(duration)}</p>}
                        </div>
                         {isMissed && !isCurrentUser && (
                            <button 
                                onClick={() => navigate(`/call/${type}/${chat.id}`)}
                                className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded-md"
                            >
                                Call Back
                            </button>
                        )}
                    </div>
                );
            }
            default:
                return null;
        }
    };
    
    const sender = usersMap.get(message.senderId);
    
    const isSpecialBubble = ['payment', 'image', 'voice', 'ai_action_request', 'ai_service_request_confirmation', 'red_envelope', 'bill_split_request', 'gift', 'call_history', 'booking_request'].includes(message.type);
    const hasReactions = message.reactions && Object.values(message.reactions).some((users: string[]) => users.length > 0);

    return (
        <div
            id={`message-${message.id}`}
            ref={bubbleRef}
            className={`relative w-full ${message.status === 'failed' ? 'cursor-pointer' : ''} animate-message-pop-in`}
            onClick={handleBubbleClick}
            {...touchHandlers}
            onContextMenu={handleContextMenu}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            style={{ transformOrigin: isCurrentUser ? 'bottom right' : 'bottom left' }}
        >
            <div style={{ opacity: iconOpacity }} className={`absolute top-1/2 -translate-y-1/2 transition-opacity ${isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'}`}>
                <Reply className="h-5 w-5 text-muted-foreground" />
            </div>

            <div
                style={{ transform }}
                className={`transition-transform duration-200 flex flex-col my-0.5 px-4 ${isCurrentUser ? 'items-end' : 'items-start'} ${hasReactions ? 'pb-5' : ''}`}
                onTouchStart={e => e.stopPropagation()}
            >
                <div className={`relative flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isCurrentUser && sender ? (
                        <button onClick={() => onViewProfile(sender)} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full">
                            <Avatar user={sender} size="sm" className="h-8 w-8 self-end" />
                        </button>
                    ) : !isCurrentUser ? (
                        <div className="w-8 flex-shrink-0" />
                    ) : null }
                    <div className="max-w-xs md:max-w-md">
                        {!isCurrentUser && chat.isGroup && (grouping === 'start' || grouping === 'single') && (
                            <button onClick={() => sender && onViewProfile(sender)} className="text-xs text-muted-foreground mb-1 ml-3 hover:underline focus:underline focus:outline-none">
                                {sender?.name}
                            </button>
                        )}
                        <div
                            className={`rounded-2xl shadow-md overflow-hidden ${
                                message.isDeleted ? 'bg-muted' : 
                                !isSpecialBubble ? (isCurrentUser ? 'bg-gradient-to-br from-primary to-brand-600 text-primary-foreground' : 'bg-secondary text-secondary-foreground') : ''
                            } ${
                                !isCurrentUser ? 'rounded-bl-sm' : 
                                (grouping === 'end' || grouping === 'single' ? 'rounded-br-sm' : '')
                            }`}
                        >
                            {repliedToMessage && !message.isDeleted && (
                                <button
                                    onClick={handleReplyClick}
                                    className={`w-full text-left p-2 border-b ${isCurrentUser ? 'bg-black/10 border-white/20' : 'bg-muted border-border'} hover:bg-black/20`}
                                    aria-label={`Reply to ${repliedToSender?.name}`}
                                >
                                    <p className={`font-bold text-xs ${isCurrentUser ? 'text-primary-foreground/80' : 'text-primary'}`}>
                                        {isReplyingToCurrentUser ? 'You' : repliedToSender?.name}
                                    </p>
                                    <p className={`text-xs truncate ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {repliedToMessage.isDeleted ? 'Message deleted' : getMessagePreview(repliedToMessage, currentUser.id)}
                                    </p>
                                </button>
                            )}
                            <div className={isSpecialBubble ? '' : (message.isDeleted ? 'px-3 py-2' : 'px-3 py-2')}>
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                     {hasReactions && (
                        <div className={`absolute -bottom-1 flex gap-1 ${isCurrentUser ? 'right-0' : 'left-10'}`}>
                            {Object.entries(message.reactions!).map(([emoji, userIds]) => (
                                (userIds as string[]).length > 0 && (
                                    <div key={emoji} className="flex items-center bg-card/80 backdrop-blur-lg border border-border rounded-full px-1.5 py-0.5 text-xs shadow-sm">
                                        <span>{emoji}</span>
                                        <span className="ml-1 text-card-foreground font-semibold">{(userIds as string[]).length}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {!message.isDeleted &&
                    <div className={`flex items-center text-xs mt-1 ${isCurrentUser ? 'pr-2' : 'pl-10'}`}>
                        {message.isEdited && <span className="text-muted-foreground/70 mr-2">(edited)</span>}
                        <span className="text-muted-foreground/80">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isCurrentUser && message.status !== 'failed' && <ReadReceiptIcon status={message.status} className={`ml-1 h-4 w-4 ${isAnimating ? 'animate-receipt-pop' : ''}`} />}
                        {isCurrentUser && message.status === 'failed' && (
                            <div className="ml-1 flex items-center gap-1 text-destructive text-xs font-semibold">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Failed</span>
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    );
});

const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1">
        <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot"></div>
        <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot"></div>
        <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot"></div>
    </div>
);

const ImageViewer: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
        <img src={imageUrl} alt="Full screen view" className="max-w-full max-h-full object-contain" />
        <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full">
            <X size={24} />
        </button>
    </div>
);

type CallState = { active: boolean; type: 'audio' | 'video' | null };

const ChatScreen: React.FC<{
    chatId: string;
    currentUser: User;
    onBack: () => void;
    onViewProfile: (user: User, chat?: Chat | null) => void;
    usersMap: Map<string, User>;
    onInitiatePinProtectedPayment: (recipient: User, amount: number) => void;
    onTransactionComplete: () => void;
}> = ({ chatId, currentUser, onBack, onViewProfile, usersMap, onInitiatePinProtectedPayment, onTransactionComplete }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [viewedImage, setViewedImage] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [menuState, setMenuState] = useState<{ event: React.MouseEvent | React.TouchEvent, message: Message } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Message | null>(null);
    
    // Attachment/modal states
    const [isAttachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
    const [isCameraViewOpen, setCameraViewOpen] = useState(false);
    const [isGalleryPickerOpen, setGalleryPickerOpen] = useState(false);
    const [isSendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
    const [isRedEnvelopeModalOpen, setRedEnvelopeModalOpen] = useState(false);
    const [isBillSplitModalOpen, setBillSplitModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const genAiChatRef = useRef<GenAiChat | null>(null);
    const navigate = useNavigate();

    const otherParticipant = useMemo(() => {
        if (!chat || chat.isGroup) return null;
        return chat.participants.find(p => p.id !== currentUser.id);
    }, [chat, currentUser.id]);

    const isAiChat = useMemo(() => {
        return chat?.participants.some(p => p.isAi) || false;
    }, [chat]);

    const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    const fetchChatAndMessages = useCallback(async () => {
        const chatData = await api.getChatById(chatId);
        if (chatData) {
            setChat(chatData);
            setMessages(chatData.messages);
        }
    }, [chatId]);

    // Initial data fetch
    useEffect(() => {
        fetchChatAndMessages();
    }, [fetchChatAndMessages]);

    // Mark messages as read when chat is opened
    useEffect(() => {
        if (!chat) return;

        const hasUnreadFromOthers = chat.messages.some(
            msg => msg.senderId !== currentUser.id && msg.status !== 'read' && msg.status !== 'seen'
        );

        if (hasUnreadFromOthers) {
            const timer = setTimeout(() => {
                api.markChatAsRead(chat.id, currentUser.id).then(didUpdate => {
                    if (didUpdate) {
                        fetchChatAndMessages();
                    }
                });
            }, 1000); // A 1-second delay feels more natural

            return () => clearTimeout(timer);
        }
    }, [chat, currentUser.id, fetchChatAndMessages]); // Rerun when chat data changes


    useEffect(() => {
      scrollToBottom('auto');
    }, [messages, scrollToBottom]);

    // Initialize AI chat
    useEffect(() => {
        if (isAiChat) {
            genAiChatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: aiSystemInstruction,
                    tools: [{ functionDeclarations: [sendMoneyFunctionDeclaration] }],
                },
                // history: chat?.messages.map(...) // Can prime with history
            });
        }
        return () => { genAiChatRef.current = null; };
    }, [isAiChat, chatId]);

    const handleSendMessage = useCallback(async (text: string, imageUrl?: string, voiceUrl?: string, duration?: number) => {
        if (!chat) return;
        
        // --- EDIT LOGIC ---
        if (editingMessage) {
            setIsSending(true);
            try {
                const success = await api.editMessage(chat.id, editingMessage.id, text);
                if (success) {
                    setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, text, isEdited: true } : m));
                } else {
                    toast.error("Failed to edit message.");
                }
            } catch (e) {
                toast.error("Failed to edit message.");
            } finally {
                setIsSending(false);
                setNewMessage('');
                setEditingMessage(null);
            }
            return;
        }


        // --- SEND NEW MESSAGE LOGIC ---
        const tempId = `temp-${Date.now()}`;
        let messageType: Message['type'] = 'text';
        if (imageUrl) messageType = 'image';
        if (voiceUrl) messageType = 'voice';

        const optimisticMessage: Message = {
            id: tempId,
            senderId: currentUser.id,
            text,
            timestamp: Date.now(),
            type: messageType,
            status: 'sending',
            replyTo: replyTo?.id,
            chatId,
            imageUrl,
            voiceUrl,
            duration
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setReplyTo(null);
        setIsSending(true);

        // --- AI CHAT LOGIC ---
        if (isAiChat && genAiChatRef.current) {
            setIsAiTyping(true);
            try {
                const result = await genAiChatRef.current.sendMessageStream({ message: text });
                
                // Set the real ID for the user's message now that API call succeeded
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'sent' } : m)); 

                const streamTempId = `stream-temp-${Date.now()}`;
                let streamedText = '';
                
                for await (const chunk of result) {
                    streamedText += chunk.text;
                    const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    const streamingMessage: Message = {
                        id: streamTempId,
                        senderId: 'ai-assistant',
                        text: streamedText,
                        timestamp: Date.now(),
                        type: 'text',
                        status: 'delivered',
                        isStreaming: true,
                        groundingChunks: Array.isArray(groundingChunks) ? (groundingChunks as GroundingChunk[]) : [],
                    };
                     setMessages(prev => {
                        const existing = prev.find(m => m.id === streamTempId);
                        if (existing) {
                            return prev.map(m => m.id === streamTempId ? streamingMessage : m);
                        }
                        return [...prev, streamingMessage];
                    });
                }
                
                // Finalize streaming message
                 setMessages(prev => prev.map(m => m.id === streamTempId ? { ...m, isStreaming: false } : m));

            } catch (e) {
                console.error(e);
                toast.error("AI Assistant is having trouble right now.");
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
            } finally {
                setIsAiTyping(false);
                setIsSending(false);
            }
            return;
        }

        // --- REGULAR CHAT LOGIC ---
        try {
            // Simulate sending different message types
            let sentMessage: Message;
            if (messageType === 'text') {
                sentMessage = await api.sendMessage(chat.id, text, currentUser.id, replyTo?.id);
            } else if (messageType === 'image' && imageUrl) {
                await api.sendImageMessage(chat.id, currentUser.id, imageUrl);
            } // voice messages would be handled here too
            
            // In a real app, you'd get the final message back from the server
            // Here we just update the status of our optimistic message
            setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: 'sent' } : m)));

        } catch (e) {
             setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: 'failed' } : m)));
             if (navigator.onLine) {
                 toast.error('Failed to send message.');
             } else {
                 toast('You are offline. Message queued.', { icon: '⏳' });
                 await db.addMessageToQueue(optimisticMessage);
             }
        } finally {
            setIsSending(false);
        }
    }, [chat, currentUser.id, replyTo, isAiChat, editingMessage]);


    const handleAttachmentSelect = (option: 'camera' | 'gallery' | 'red_envelope' | 'bill_split' | 'send_money') => {
        setAttachmentSheetOpen(false);
        switch (option) {
            case 'camera': setCameraViewOpen(true); break;
            case 'gallery': setGalleryPickerOpen(true); break;
            case 'send_money': if (otherParticipant) setSendMoneyModalOpen(true); break;
            case 'red_envelope': setRedEnvelopeModalOpen(true); break;
            case 'bill_split': setBillSplitModalOpen(true); break;
        }
    };
    
    // ... other handlers for modals, messages actions etc.
    
    const renderableItems: RenderableItem[] = useMemo(() => {
        const items: RenderableItem[] = [];
        let lastDate: Date | null = null;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const messageDate = new Date(message.timestamp);
            if (!lastDate || !isSameDay(lastDate, messageDate)) {
                items.push({ type: 'date_separator', date: formatDateSeparator(messageDate), id: `date-${message.timestamp}` });
            }
            
            const prevMessage = messages[i - 1];
            const nextMessage = messages[i + 1];
            const isPrevSameSender = prevMessage && prevMessage.senderId === message.senderId && !prevMessage.isDeleted;
            const isNextSameSender = nextMessage && nextMessage.senderId === message.senderId && !nextMessage.isDeleted;

            let grouping: MessageGrouping = 'single';
            if (isPrevSameSender && isNextSameSender) grouping = 'middle';
            else if (isPrevSameSender) grouping = 'end';
            else if (isNextSameSender) grouping = 'start';
            
            items.push({ type: 'message', message, grouping });
            lastDate = messageDate;
        }
        return items;
    }, [messages]);


    if (!chat) {
        return <div className="flex h-full items-center justify-center bg-background"><p>Loading chat...</p></div>;
    }
    
    const chatTitle = chat.isGroup ? chat.name : otherParticipant?.name;
    const chatSubtitle = isAiChat 
        ? "AI Assistant" 
        : (chat.isGroup 
            ? `${chat.participants.length} members` 
            : (isOtherUserTyping ? 'typing...' : otherParticipant?.statusMessage)
        );
        
    const headerAvatarUser = useMemo(() => {
        if (!chat) return null;
        if (chat.isGroup) {
            // A generic object that looks like a User for the Avatar component
            return { 
                id: chat.id, 
                name: chat.name || 'Group', 
                avatarUrl: '/logo.jpg',
                presence: 'offline', // dummy presence
                phone: '',
                wallet: { balance: 0, currency: 'BDT', provider: 'Bkash' },
                kycStatus: 'Verified',
                statusMessage: `${chat.participants.length} members`,
                isAi: false,
                username: 'group',
                balances: {},
                joinedDate: chat.creatorId || ''
            } as User;
        }
        return otherParticipant;
    }, [chat, otherParticipant]);

    return (
        <div className="flex flex-col h-full bg-background chat-background">
            {/* --- Modals and Overlays --- */}
            {viewedImage && <ImageViewer imageUrl={viewedImage} onClose={() => setViewedImage(null)} />}
            {isAttachmentSheetOpen && <AttachmentSheet onClose={() => setAttachmentSheetOpen(false)} onSelect={handleAttachmentSelect} showSendMoney={!!otherParticipant} />}
            {isCameraViewOpen && <CameraView onClose={() => setCameraViewOpen(false)} onPictureTaken={(dataUrl) => { handleSendMessage('', dataUrl); setCameraViewOpen(false); }} />}
            {isGalleryPickerOpen && <GalleryPicker onClose={() => setGalleryPickerOpen(false)} onSend={(imageUrl) => { handleSendMessage('', imageUrl); setGalleryPickerOpen(false); }} />}
            {isSendMoneyModalOpen && otherParticipant && <SendMoneyModal currentUser={currentUser} isOpen={true} onClose={() => setSendMoneyModalOpen(false)} recipient={otherParticipant} onAmountConfirm={(amount, currency) => { if(otherParticipant) onInitiatePinProtectedPayment(otherParticipant, amount); setSendMoneyModalOpen(false); }} />}
            {isRedEnvelopeModalOpen && <SendRedEnvelopeModal isOpen={true} onClose={() => setRedEnvelopeModalOpen(false)} onSend={async (amount, greeting) => { await api.sendRedEnvelope(chat.id, currentUser.id, amount, greeting); setRedEnvelopeModalOpen(false); onTransactionComplete(); }} />}
            {isBillSplitModalOpen && <BillSplitCreationModal isOpen={true} onClose={() => setBillSplitModalOpen(false)} participants={chat.participants} currentUser={currentUser} onCreate={async (title, total, participants) => { await api.sendBillSplitRequest(chat.id, { creatorId: currentUser.id, title, totalAmount: total, participants: participants.map(p => ({...p, paid: false})) }); setBillSplitModalOpen(false); }} />}
            {menuState && <MessageActions message={menuState.message} currentUserIsSender={menuState.message.senderId === currentUser.id} onClose={() => setMenuState(null)} onReact={(emoji) => { api.reactToMessage(chat.id, menuState.message.id, emoji, currentUser.id).then(() => fetchChatAndMessages()); setMenuState(null); }} onReply={() => { setEditingMessage(null); setReplyTo(menuState.message); setMenuState(null); }} onEdit={() => { setReplyTo(null); setEditingMessage(menuState.message); setNewMessage(menuState.message.text || ''); setMenuState(null); }} onDelete={() => { setConfirmDelete(menuState.message); setMenuState(null); }} onCopy={() => { navigator.clipboard.writeText(menuState.message.text || ''); toast.success('Copied to clipboard'); setMenuState(null); }} position={{ top: ('touches' in menuState.event ? menuState.event.touches[0].clientY : menuState.event.clientY) - 200 }} />}
            {confirmDelete && <ConfirmModal isOpen={true} onClose={() => setConfirmDelete(null)} onConfirm={async () => { await api.deleteMessage(chat.id, confirmDelete.id); setConfirmDelete(null); fetchChatAndMessages(); }} title="Delete Message" description="Are you sure you want to delete this message? This cannot be undone." confirmText="Delete" isDestructive />}

            <Header
                title={chatTitle || ''}
                subtitle={chatSubtitle}
                avatarUser={headerAvatarUser}
                onBack={onBack}
                onTitleClick={() => onViewProfile(otherParticipant || currentUser, chat)}
                rightAction={!isAiChat && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/call/audio/${chatId}`)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><Phone size={22} /></button>
                        {/* FIX: Replaced non-existent `VideoCameraIcon` with the correct `VideoIcon`. */}
                        <button onClick={() => navigate(`/call/video/${chatId}`)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><VideoIcon size={22} /></button>
                    </div>
                )}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
                    {renderableItems.map(item => {
                         if (item.type === 'date_separator') {
                            return (
                                <div key={item.id} className="text-center text-xs font-semibold text-muted-foreground my-4">
                                    <span className="bg-background px-2">{item.date}</span>
                                </div>
                            );
                        }
                        if (item.message.type === 'system') {
                            return <div key={item.message.id} className="text-center text-xs text-muted-foreground my-2 italic">{item.message.text}</div>;
                        }

                        return <MessageBubble
                            key={item.message.id}
                            item={item}
                            isCurrentUser={item.message.senderId === currentUser.id}
                            onSetReply={setReplyTo}
                            onViewImage={setViewedImage}
                            usersMap={usersMap}
                            chat={chat}
                            currentUser={currentUser}
                            onOpenMenu={(e, msg) => setMenuState({ event: e, message: msg })}
                            onRetryMessage={(msg) => handleSendMessage(msg.text || '')}
                            onViewProfile={(user) => onViewProfile(user, chat)}
                            // Pass down all other handlers
                            onConfirmAiAction={() => {}}
                            onCancelAiAction={() => {}}
                            onConfirmAiServiceRequest={() => {}}
                            onCancelAiServiceRequest={() => {}}
                            onOpenRedEnvelope={() => {}}
                            onPayBillSplit={() => {}}
                        />;
                    })}
                </div>
                 {(isAiTyping || isOtherUserTyping) && (
                    <div className="px-8 py-2">
                        <TypingIndicator />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border">
                <div className="max-w-md mx-auto p-2">
                    {replyTo && (
                         <div className="flex items-center justify-between bg-muted rounded-t-lg p-2 mx-1 animate-fade-in-up">
                            <div className="border-l-4 border-primary pl-2 overflow-hidden">
                                <p className="font-bold text-sm text-primary">{replyTo.senderId === currentUser.id ? 'You' : usersMap.get(replyTo.senderId)?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{getMessagePreview(replyTo, currentUser.id)}</p>
                            </div>
                            <button onClick={() => { setReplyTo(null); setEditingMessage(null); }} className="p-1"><X size={16}/></button>
                        </div>
                    )}
                     {editingMessage && (
                         <div className="flex items-center justify-between bg-muted rounded-t-lg p-2 mx-1">
                             <div className="border-l-4 border-yellow-500 pl-2 overflow-hidden">
                                <p className="font-bold text-sm text-yellow-500">Editing Message</p>
                                <p className="text-xs text-muted-foreground truncate">{editingMessage.text}</p>
                            </div>
                             <button onClick={() => { setEditingMessage(null); setNewMessage('') }} className="p-1"><X size={16}/></button>
                         </div>
                    )}
                    <div className="flex items-end gap-2 p-2">
                        <button onClick={() => setAttachmentSheetOpen(true)} className="p-2 text-muted-foreground hover:bg-muted rounded-full"><PaperclipIcon /></button>
                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(newMessage); } }}
                            placeholder="Type a message..."
                            className="flex-1 bg-secondary rounded-2xl px-4 py-2 resize-none border-none focus:ring-2 focus:ring-ring focus:outline-none max-h-24"
                            rows={1}
                        />
                        <button onClick={() => handleSendMessage(newMessage)} disabled={isSending || !newMessage.trim()} className="p-3 bg-primary text-primary-foreground rounded-full disabled:opacity-50 transition-transform hover:scale-105 active:scale-95">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ChatScreen;