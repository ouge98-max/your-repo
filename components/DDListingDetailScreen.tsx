import React, { useState, useEffect } from 'react';
import { User, DDListing } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import toast from 'react-hot-toast';
import { MapPinIcon, ChatBubbleIcon } from './icons';
import { getCurrencySymbol } from '../utils/currency';

interface DDListingDetailScreenProps {
    currentUser: User;
    usersMap: Map<string, User>;
}

const DDListingDetailScreen: React.FC<DDListingDetailScreenProps> = ({ currentUser, usersMap }) => {
    const { listingId } = useParams<{ listingId: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<DDListing | null>(null);
    const [seller, setSeller] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!listingId) {
            setIsLoading(false);
            return;
        }
        api.getDDListingById(listingId)
            .then(data => {
                if (data) {
                    setListing(data);
                    setSeller(usersMap.get(data.sellerId) || null);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load listing:", err);
                toast.error("Could not load listing details.");
                setIsLoading(false);
            });
    }, [listingId, usersMap]);

    const handleContactSeller = async () => {
        if (!seller) return;
        toast.loading(`Starting chat with ${seller.name}...`);
        try {
            const chat = await api.getOrCreateChat(currentUser.id, seller.id);
            toast.dismiss();
            navigate(`/chats/${chat.id}`);
        } catch(e) {
            toast.dismiss();
            toast.error("Could not open chat.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-950 text-white">
                <Header title="Loading Listing..." onBack={() => navigate(-1)} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!listing || !seller) {
        return (
            <div className="flex flex-col h-screen bg-gray-950 text-white">
                <Header title="Not Found" onBack={() => navigate(-1)} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400">Listing not found.</p>
                </div>
            </div>
        );
    }

    const isOwnListing = currentUser.id === seller.id;
    const formattedPrice = isNaN(parseFloat(listing.price)) ? listing.price : `${getCurrencySymbol('BDT')}${listing.price}`;

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white">
            <Header title="Listing Details" onBack={() => navigate(-1)} />
            <main className="flex-1 overflow-y-auto pb-24">
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-80 object-cover" />
                
                <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-semibold text-red-400">{listing.category}</p>
                    <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                    <p className="text-3xl font-bold text-brandGreen-400 mt-2">{formattedPrice}</p>
                </div>

                <div className="p-4 space-y-6">
                    {listing.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{listing.description}</p>
                        </div>
                    )}

                    {listing.location && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
                            <div className="flex items-start gap-3 text-gray-300">
                                <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <span>{listing.location.address}</span>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Listed By</h3>
                        <Link to={`/profile/view/${seller.id}`} className="flex items-center gap-3 bg-gray-900 p-3 rounded-lg border border-white/10 hover:bg-gray-800 transition-colors">
                            <Avatar user={seller} />
                            <div>
                                <p className="font-semibold text-white">{seller.name}</p>
                                <p className="text-xs text-gray-500">{isOwnListing ? 'This is you' : 'View Profile'}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
            {!isOwnListing && (
                 <footer className="sticky bottom-0 bg-gray-950/80 backdrop-blur-xl border-t border-white/10 p-4">
                    <button onClick={handleContactSeller} className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700">
                        <ChatBubbleIcon className="h-5 w-5" /> Contact Seller
                    </button>
                </footer>
            )}
        </div>
    );
};

export default DDListingDetailScreen;