import React from 'react';
import { User, Chat, Product, MomentPost } from '../types';
import { Avatar } from './Avatar';
import { ShoppingBagIcon, VideoIcon } from './icons';

interface SearchResultItemProps {
    title: string;
    subtitle: string;
    onClick: () => void;
    user?: User;
    chat?: Chat;
    product?: Product;
    moment?: MomentPost;
    usersMap?: Map<string, User>;
    currentUser?: User;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ title, subtitle, onClick, user, chat, product, moment, usersMap, currentUser }) => {
    
    const getAvatar = () => {
        if (user) return <Avatar user={user} size="sm" />;
        if (product) return <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />;
        if (moment) {
            if (moment.videoUrl) {
                return <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center"><VideoIcon className="h-5 w-5 text-gray-500" /></div>;
            }
            if (moment.imageUrls && moment.imageUrls.length > 0) {
                return <img src={moment.imageUrls[0]} alt="Moment" className="h-10 w-10 rounded-lg object-cover" />;
            }
            return <Avatar user={moment.author} size="sm" />;
        }
        if (chat && currentUser) {
             const otherParticipant = !chat.isGroup ? chat.participants.find(p => p.id !== currentUser.id) : null;
             const avatarUser = chat.isGroup ? (chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0]) : otherParticipant;
             if (avatarUser) return <Avatar user={avatarUser} size="sm" />;
        }
        return <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center"><ShoppingBagIcon className="h-5 w-5 text-gray-400" /></div>;
    }

    return (
        <li
            onClick={onClick}
            className="flex items-center p-3 -mx-3 hover:bg-gray-100 cursor-pointer rounded-lg"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
        >
            <div className="mr-4 flex-shrink-0">
                {getAvatar()}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">{title}</p>
                <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            </div>
        </li>
    );
};
