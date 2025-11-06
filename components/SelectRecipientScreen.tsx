import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { MagnifyingGlassIcon } from './icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';

interface SelectRecipientScreenProps {
    currentUser: User;
    onSelectRecipient: (recipient: User) => void;
}

const LoadingSkeleton: React.FC = () => (
    <div className="p-4 space-y-6 animate-pulse">
        {/* Recent Skeleton */}
        <div>
            <div className="h-4 bg-muted rounded w-20 mb-3"></div>
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-muted"></div>
                        <div className="h-3 bg-muted rounded w-10 mt-2"></div>
                    </div>
                ))}
            </div>
        </div>
        {/* List Skeleton */}
        <div>
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="space-y-1 bg-card rounded-lg p-2">
                {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center p-2">
                        <div className="h-10 w-10 rounded-full bg-muted mr-4"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'online', label: 'Online' },
    { key: 'merchants', label: 'Merchants' },
    { key: 'verified', label: 'Verified' },
] as const;

type FilterKey = typeof filterOptions[number]['key'];

const SelectRecipientScreen: React.FC<SelectRecipientScreenProps> = ({ currentUser, onSelectRecipient }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [recentPeers, setRecentPeers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        Promise.all([
            api.getAllUsers(),
            api.getTransactions()
        ]).then(([allUsers, allTransactionsResult]) => {
            const otherUsers = allUsers.filter(u => u.id !== currentUser.id && !u.isAi);
            
            const recentPeerIds = new Set<string>();
            for (const tx of allTransactionsResult.transactions) {
                if (tx.peer.id !== currentUser.id && !tx.peer.isAi) {
                    recentPeerIds.add(tx.peer.id);
                }
                if (recentPeerIds.size >= 4) break;
            }
            
            const recentUsers = Array.from(recentPeerIds)
                .map(id => allUsers.find(u => u.id === id))
                .filter((u): u is User => !!u);

            setRecentPeers(recentUsers);

            const recentIdSet = new Set(recentUsers.map(u => u.id));
            setUsers(otherUsers.filter(u => !recentIdSet.has(u.id)));

            setLoading(false);
        });
    }, [currentUser.id]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (activeFilter === 'online') return user.presence === 'online';
                if (activeFilter === 'merchants') return user.isMerchant;
                if (activeFilter === 'verified') return user.kycStatus === 'Verified';
                return true; // 'all'
            })
            .filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone.includes(searchTerm)
            );
    }, [users, searchTerm, activeFilter]);


    const handleSelect = (user: User) => {
        const { purpose, productId } = location.state || {};

        if (purpose === 'gift' && productId) {
            navigate(`/gift/confirm/${productId}/${user.id}`);
        } else {
            onSelectRecipient(user); // Original money sending flow
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header title="Select Recipient" onBack={() => navigate(-1)} />
            <div className="border-b border-border">
                <div className="p-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card border border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            autoFocus
                        />
                    </div>
                </div>
                <div className="px-4 pb-3">
                    <div className="flex space-x-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                        {filterOptions.map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 transition-colors ${
                                    activeFilter === filter.key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {loading ? <LoadingSkeleton /> : (
                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                    {recentPeers.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2 flex items-center gap-2">
                                <Clock size={14}/> Recent
                            </h3>
                            <div className="grid grid-cols-4 gap-4 text-center">
                                {recentPeers.map(user => (
                                    <button key={user.id} onClick={() => handleSelect(user)} className="cursor-pointer flex flex-col items-center group">
                                        <Avatar user={user} size="md" className="group-hover:scale-105 transition-transform" />
                                        <p className="text-xs text-muted-foreground mt-2 truncate w-full">{user.name.split(' ')[0]}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">All Contacts</h3>
                        {filteredUsers.length > 0 ? (
                            <ul className="divide-y divide-border bg-card rounded-lg border border-border">
                                {filteredUsers.map(user => (
                                    <li key={user.id}>
                                        <button onClick={() => handleSelect(user)} className="w-full flex items-center p-3 hover:bg-muted rounded-lg text-left">
                                            <Avatar user={user} size="sm" className="mr-4" />
                                            <div>
                                                <p className="font-semibold text-foreground">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-muted-foreground pt-8">No contacts found for the selected filter.</p>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default SelectRecipientScreen;