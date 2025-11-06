import React, { useState, useEffect } from 'react';
import { ServiceProviderProfile, User } from '../types';
import { api } from '../services/mockApi';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { MagnifyingGlassIcon } from './icons';
import { Link } from 'react-router-dom';

const ServiceProviderCard: React.FC<{ profile: ServiceProviderProfile, user: User }> = ({ profile, user }) => {
    return (
        <Link to={`/service-provider/${profile.id}`} className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:shadow-lg hover:border-brandGreen-500/30 transition-all duration-200">
            <Avatar user={user} size="lg" />
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-brandGreen-400">{profile.category}</p>
                <h3 className="font-bold text-white truncate">{profile.title}</h3>
                <p className="text-sm text-gray-300 truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={profile.rating} />
                    <span className="text-xs text-gray-400">({profile.reviewCount} reviews)</span>
                </div>
            </div>
        </Link>
    );
};

const ServicesFeed: React.FC<{ usersMap: Map<string, User>; initialSearchTerm?: string; }> = ({ usersMap, initialSearchTerm = '' }) => {
    const [profiles, setProfiles] = useState<ServiceProviderProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    useEffect(() => {
        api.getAllServiceProviderProfiles().then(data => {
            setProfiles(data);
            setLoading(false);
        });
    }, []);

    const filteredProfiles = profiles.filter(profile => {
        const user = usersMap.get(profile.userId);
        return (
            profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
            user?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) {
        return <p className="text-center text-gray-400 p-4">Loading services...</p>;
    }

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search services, skills, or providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                />
            </div>
            <div className="space-y-3">
                {filteredProfiles.map(profile => {
                    const user = usersMap.get(profile.userId);
                    if (!user) return null;
                    return <ServiceProviderCard key={profile.id} profile={profile} user={user} />;
                })}
            </div>
        </div>
    );
};

export default ServicesFeed;