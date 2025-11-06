import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Chat, Story, Message } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserPlusIcon, Plus, ScanIcon, PencilIcon, ChatBubbleIcon as MessageSquare, UsersIcon } from './icons';
import { StoryViewer } from './StoryViewer';
import { getMessagePreview } from '../utils/previews';
import { AddContactModal } from './AddContactModal';
import { useAppContext } from '../contexts/AppContext';

const ChatListItem: React.FC<{ chat: Chat, currentUserId: string, isActive: boolean }> = React.memo(({ chat, currentUserId, isActive }) => {
    const otherParticipant = !chat.isGroup ? chat.participants.find(p => p.id !== currentUserId) : null;
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    const displayName = chat.isGroup ? chat.name : otherParticipant?.name;
    const avatarUser = chat.isGroup ? (chat.participants.find(p => p.id !== currentUserId) || chat.participants[0]) : otherParticipant;

    return (
        <li>
            <Link to={`/chats/${chat.id}`} className={`flex items-center p-3 cursor-pointer rounded-lg transition-colors ${isActive ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-muted'}`}>
                {avatarUser && <Avatar user={avatarUser} size="md" className="mr-4" />}
                <div className="flex-1 overflow-hidden">
                    <p className={`font-semibold truncate ${isActive ? 'text-foreground' : 'text-foreground'}`}>{displayName}</p>
                    <p className={`text-sm truncate ${isActive ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{getMessagePreview(lastMessage, currentUserId)}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground flex flex-col items-end space-y-1 shrink-0 ml-2">
                    <span className="whitespace-nowrap">{lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    {chat.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                    )}
                </div>
            </Link>
        </li>
    );
});

export const ChatListScreen: React.FC = () => {
    const { currentUser, chats, refreshChats } = useAppContext();
    const [stories, setStories] = useState<Story[]>([]);
    const [viewingStoryForUser, setViewingStoryForUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    type ChatFilter = 'all' | 'unread' | 'groups' | 'contacts';
    const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');

    useEffect(() => {
        const fetchStories = () => { api.getStories().then(setStories); };
        fetchStories();
        const interval = setInterval(fetchStories, 30000); // Poll less frequently
        return () => clearInterval(interval);
    }, []);

    // Add real-time fetching logic for when the tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User has returned to the tab, refresh chats for any new messages
                // that might have arrived while they were away.
                refreshChats();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Initial fetch on mount in case cached data is stale
        refreshChats();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [refreshChats]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortedChats = useMemo(() => {
        return [...chats].sort((a, b) => {
            const timeA = a.messages[a.messages.length - 1]?.timestamp || 0;
            const timeB = b.messages[b.messages.length - 1]?.timestamp || 0;
            return timeB - timeA;
        });
    }, [chats]);

    const filteredChats = useMemo(() => {
        if (!currentUser) return [];
        
        let intermediateChats = sortedChats;

        if (activeFilter === 'unread') {
            intermediateChats = sortedChats.filter(chat => chat.unreadCount > 0);
        } else if (activeFilter === 'groups') {
            intermediateChats = sortedChats.filter(chat => chat.isGroup);
        } else if (activeFilter === 'contacts') {
            intermediateChats = sortedChats.filter(chat => !chat.isGroup);
        }
        
        if (!searchTerm) return intermediateChats;

        const lowercasedTerm = searchTerm.toLowerCase();
        return intermediateChats.filter(chat => {
            const name = chat.isGroup ? chat.name : chat.participants.find(p => p.id !== currentUser.id)?.name;
            const lastMessage = chat.messages[chat.messages.length - 1];
            return name?.toLowerCase().includes(lowercasedTerm) || lastMessage?.text?.toLowerCase().includes(lowercasedTerm);
        });
    }, [sortedChats, searchTerm, currentUser, activeFilter]);
    
    const handleViewStory = (user: User) => {
        const story = stories.find(s => s.userId === user.id);
        if (story && story.items.length > 0) {
            if (!story.seen) {
                api.markStoryAsSeen(user.id).then(() => {
                    setStories(prev => prev.map(s => s.userId === user.id ? {...s, seen: true} : s));
                });
            }
            setViewingStoryForUser(user);
        }
    };
    
    const activeChatId = location.pathname.startsWith('/chats/') ? location.pathname.split('/').pop() : null;

    if (!currentUser) {
        return null;
    }

    const noResultsText = () => {
        if (searchTerm) return `No results for "${searchTerm}".`;
        switch (activeFilter) {
            case 'unread': return 'You have no unread messages.';
            case 'groups': return 'You are not in any groups.';
            case 'contacts': return 'You have no one-on-one chats.';
            default: return 'Start a new conversation!';
        }
    };
    
    const HeaderActions = () => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate('/scanner')} className="text-muted-foreground p-2 rounded-full hover:bg-muted" aria-label="Scan QR code">
            <ScanIcon className="h-6 w-6" />
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-muted-foreground p-2 rounded-full hover:bg-muted" aria-label="More options">
            <Plus className="h-6 w-6" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-popover rounded-xl shadow-lg z-20 border border-border animate-fade-in-up origin-top-right">
              <ul className="p-2 text-sm text-popover-foreground">
                <li><button onClick={() => { navigate('/send'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"><MessageSquare size={18}/> New Chat</button></li>
                <li><button onClick={() => { navigate('/chats/new'); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"><UsersIcon size={18}/> New Group</button></li>
                <li><button onClick={() => { setIsAddContactModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted"><UserPlusIcon size={18}/> Add Contact</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );

    const filterButtons: { key: ChatFilter, label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'unread', label: 'Unread' },
        { key: 'groups', label: 'Groups' },
        { key: 'contacts', label: 'Contacts' },
    ];

    return (
        <div className="flex flex-col h-full relative">
            <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setIsAddContactModalOpen(false)} currentUser={currentUser} />
            <div className="md:hidden">
                <Header title="Chats" rightAction={<HeaderActions />} />
            </div>

            {viewingStoryForUser && (
                <StoryViewer
                    stories={stories.filter(s => s.items.length > 0)}
                    initialUser={viewingStoryForUser}
                    onClose={() => setViewingStoryForUser(null)}
                    onNextUser={handleViewStory}
                    onPrevUser={handleViewStory}
                />
            )}
            <main className="flex-1 overflow-y-auto">
                 {stories.length > 0 && (
                    <div className="pt-4 px-4 border-b border-border">
                        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                            {stories.map(story => (
                                <button key={story.userId} onClick={() => handleViewStory(story.user)} className="flex flex-col items-center space-y-1.5 flex-shrink-0 w-20">
                                    <div className="relative">
                                        <Avatar user={story.user} size="md" className="h-16 w-16" />
                                        <div className={`absolute -inset-1 rounded-full border-2 ${story.seen ? 'border-border' : 'border-primary'}`} />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate w-full">{story.user.name.split(' ')[0]}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}
                <div className="max-w-md mx-auto p-4 md:max-w-none md:p-0 md:px-4 md:pt-4">
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" /></div>
                        <input type="search" placeholder="Search chats..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>

                    <div className="mb-4">
                        <div className="flex space-x-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide md:mx-0 md:px-0">
                            {filterButtons.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 transition-colors ${activeFilter === filter.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredChats.length > 0 ? (
                        <ul className="space-y-1">
                            {filteredChats.map(chat => (
                                <ChatListItem key={chat.id} chat={chat} currentUserId={currentUser.id} isActive={chat.id === activeChatId} />
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center py-16">
                            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
                            <p className="text-lg font-semibold text-foreground mt-4">No Chats Found</p>
                            <p className="text-muted-foreground">{noResultsText()}</p>
                        </div>
                    )}
                </div>
            </main>
             <button
                onClick={() => navigate('/send')}
                className="absolute bottom-20 right-4 md:hidden z-20 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105 animate-fab-pop-in"
                aria-label="New Message"
            >
                <PencilIcon size={28} className="text-primary-foreground" />
            </button>
        </div>
    );
};
