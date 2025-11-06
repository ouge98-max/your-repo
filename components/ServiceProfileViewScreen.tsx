

import React, { useState, useEffect } from 'react';
import { User, ServiceProviderProfile, Review } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { BriefcaseBusinessIcon as BriefcaseIcon, ShieldCheckIcon, Check } from './icons';
import { BookingModal } from './BookingModal';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

interface ServiceProfileViewScreenProps {
  profileId: string;
  usersMap: Map<string, User>;
  onBack: () => void;
  currentUser: User;
}

const ServiceProfileViewScreen: React.FC<ServiceProfileViewScreenProps> = ({ profileId, usersMap, onBack, currentUser }) => {
    const [profile, setProfile] = useState<ServiceProviderProfile | null>(null);
    const [provider, setProvider] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.getServiceProviderProfileById(profileId).then(data => {
            if (data) {
                setProfile(data);
                setProvider(usersMap.get(data.userId) || null);
                api.getReviewsForProvider(data.userId).then(setReviews);
            }
            setIsLoading(false);
        });
    }, [profileId, usersMap]);

    const handleRequestBooking = async (details: { date: string; time: string; note: string; }) => {
        if (!provider || !profile) return;
        try {
            const chat = await api.requestBooking(currentUser.id, provider.id, {
                serviceTitle: profile.title,
                ...details,
            });
            setIsBookingModalOpen(false);
            toast.success("Booking request sent! You can coordinate with the provider in your chat.");
            navigate(`/chats/${chat.id}`);
        } catch (error) {
            toast.error("Failed to send booking request.");
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Loading Profile..." onBack={onBack} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (!profile || !provider) {
         return (
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Profile Not Found" onBack={onBack} />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400">Could not find this service provider.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {profile && provider && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    onSubmit={handleRequestBooking}
                    provider={provider}
                    serviceTitle={profile.title}
                />
            )}
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Service Profile" onBack={onBack} />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center">
                            <Avatar user={provider} size="xl" />
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <h1 className="text-2xl font-bold text-white">{provider.name}</h1>
                                {provider.kycStatus === 'Verified' && (
                                    <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                                        <ShieldCheckIcon className="h-4 w-4" />
                                        Verified
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">Member since {new Date(provider.joinedDate).getFullYear()}</p>
                            <p className="text-gray-300 mt-1">"{provider.statusMessage}"</p>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto px-4 pb-24 space-y-4">
                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm text-center">
                            <p className="font-semibold text-brandGreen-400">{profile.category}</p>
                            <h2 className="text-xl font-bold text-white mt-1">{profile.title}</h2>
                            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
                               <div className="flex items-center gap-2">
                                    <StarRating rating={profile.rating} />
                                    <span>({profile.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Check size={16} className="text-brandGreen-400" />
                                    <span>{profile.jobsCompleted} Jobs Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-200 mb-2">Description</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{profile.description}</p>
                        </div>

                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-200 mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-medium border border-gray-700">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-200 mb-2">Pricing</h3>
                            <p className="text-gray-300">{profile.pricing}</p>
                        </div>

                         {profile.portfolioImages && profile.portfolioImages.length > 0 && (
                            <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-semibold text-gray-200 mb-3">Portfolio</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {profile.portfolioImages.map((img, index) => (
                                        <img key={index} src={img} alt={`Portfolio image ${index + 1}`} className="rounded-lg object-cover w-full h-32" />
                                    ))}
                                </div>
                            </div>
                         )}

                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-200 mb-4">Reviews ({reviews.length})</h3>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map(review => {
                                        const author = usersMap.get(review.authorId);
                                        return (
                                            <div key={review.id} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                                                {author ? (
                                                    <Link to={`/profile/view/${author.id}`} className="flex items-center gap-3 mb-2 group">
                                                        <Avatar user={author} size="sm" />
                                                        <div>
                                                            <p className="font-semibold text-sm text-white group-hover:underline">{author.name}</p>
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-white">Anonymous</p>
                                                            <StarRating rating={review.rating} />
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-gray-300 text-sm">{review.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No reviews yet.</p>
                            )}
                        </div>
                    </div>
                </main>
                <footer className="sticky bottom-0 bg-gray-950/80 backdrop-blur-xl border-t border-white/10 p-4">
                     <button onClick={() => setIsBookingModalOpen(true)} className="w-full max-w-md mx-auto bg-brandGreen-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl hover:bg-brandGreen-700 flex items-center justify-center gap-2">
                        <BriefcaseIcon className="h-5 w-5" />
                        Book Service
                    </button>
                </footer>
            </div>
        </>
    );
};

export default ServiceProfileViewScreen;
