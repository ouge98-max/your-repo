

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { MagnifyingGlassIcon, Loader2Icon } from './icons';
import { api } from '../services/mockApi';
import { SearchResult } from '../types';
import { useDebounce } from '../utils/hooks';
import { User } from '../types';
import { SearchResultItem } from './SearchResultItem';
import { SearchResultSection } from './SearchResultSection';
import toast from 'react-hot-toast';
import { getMessagePreview } from '../utils/previews';

interface GlobalSearchScreenProps {
    usersMap: Map<string, User>;
    currentUser: User;
}

const GlobalSearchScreen: React.FC<GlobalSearchScreenProps> = ({ usersMap, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsLoading(true);
            api.globalSearch(debouncedSearchTerm, currentUser.id)
                .then(res => {
                    setResults(res);
                })
                .catch(err => {
                    console.error("Global search failed:", err);
                    toast.error("Search failed. Please try again.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setResults(null);
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, currentUser.id]);

    const hasResults = results && (results.users.length > 0 || results.chats.length > 0 || results.products.length > 0 || (results.moments && results.moments.length > 0));

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <Header title="Search" onBack={() => navigate(-1)} />
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search contacts, messages, products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                        autoFocus
                    />
                </div>
            </div>
            <main className="flex-1 overflow-y-auto p-4">
                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2Icon className="h-8 w-8 animate-spin text-brandGreen-500" />
                    </div>
                )}
                {!isLoading && debouncedSearchTerm && !hasResults && (
                    <div className="text-center py-16 text-gray-500">
                        <p className="font-semibold">No results found for "{debouncedSearchTerm}"</p>
                        <p className="text-sm">Try searching for something else.</p>
                    </div>
                )}
                {!isLoading && hasResults && results && (
                    <div className="space-y-6 animate-fade-in">
                        {results.users.length > 0 && (
                            <SearchResultSection title="Contacts">
                                {results.users.map(user => (
                                    <SearchResultItem
                                        key={user.id}
                                        user={user}
                                        title={user.name}
                                        subtitle={user.phone}
                                        onClick={() => navigate(`/profile/view/${user.id}`)}
                                    />
                                ))}
                            </SearchResultSection>
                        )}
                        {results.chats.length > 0 && (
                            <SearchResultSection title="Chats & Messages">
                                {results.chats.map(chat => (
                                    <SearchResultItem
                                        key={chat.id}
                                        chat={chat}
                                        usersMap={usersMap}
                                        currentUser={currentUser}
                                        title={chat.isGroup ? chat.name || 'Group Chat' : usersMap.get(chat.participants.find(p => p.id !== currentUser.id)?.id || '')?.name || 'Chat'}
                                        subtitle={chat.matchedMessage ? `"${chat.matchedMessage.text}"` : getMessagePreview(chat.messages[chat.messages.length - 1], currentUser.id)}
                                        onClick={() => navigate(`/chats/${chat.id}`)}
                                    />
                                ))}
                            </SearchResultSection>
                        )}
                        {results.moments && results.moments.length > 0 && (
                            <SearchResultSection title="Moments & Videos">
                                {results.moments.map(moment => (
                                    <SearchResultItem
                                        key={moment.id}
                                        moment={moment}
                                        title={moment.text || (moment.videoUrl ? 'Video Post' : 'Photo Post')}
                                        subtitle={`by ${moment.author.name}`}
                                        onClick={() => navigate('/explore/moments')}
                                    />
                                ))}
                            </SearchResultSection>
                        )}
                         {results.products.length > 0 && (
                            <SearchResultSection title="Marketplace">
                                {results.products.map(product => (
                                    <SearchResultItem
                                        key={product.id}
                                        product={product}
                                        title={product.name}
                                        subtitle={`৳${product.price.toLocaleString()}`}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    />
                                ))}
                            </SearchResultSection>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GlobalSearchScreen;
