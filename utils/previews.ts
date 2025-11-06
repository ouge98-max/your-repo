
import { Message } from '../types';

export const getMessagePreview = (message: Message | undefined, currentUserId: string): string => {
    if (!message) return '';
    switch (message.type) {
        case 'text':
            return message.text || '';
        case 'image':
            return '📷 Photo';
        case 'voice':
            return '🎤 Voice message';
        case 'payment':
            if (message.senderId === currentUserId) {
                return `💸 Payment Sent`;
            }
            return `💸 Payment Received`;
        case 'call_history': {
            const icon = message.callHistoryData?.type === 'video' ? '📹' : '📞';
            const amISender = message.senderId === currentUserId;

            if (message.callHistoryData?.status === 'missed') {
                return amISender ? `${icon} Call unanswered` : `${icon} Missed call`;
            }
            
            return amISender ? `${icon} Outgoing call` : `${icon} Incoming call`;
        }
        case 'ai_action_request':
            return '🤖 AI Action Required';
        case 'red_envelope':
            return '🧧 Red Envelope';
        case 'ai_service_request_confirmation':
            return '🤖 AI Service Request';
        case 'booking_request':
            return '🗓️ Booking Request';
        case 'bill_split_request':
            return '✂️ Bill Split Request';
        case 'gift':
            return '🎁 Gift';
        default:
            return message.text || '...';
    }
};
