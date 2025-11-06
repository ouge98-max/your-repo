import React, { useState, useEffect, useMemo } from 'react';
import { ServiceRequest, User, ALL_SERVICE_CATEGORIES, ServiceCategory } from '../types';
import { api } from '../services/mockApi';
import { Avatar } from './Avatar';
import { MagnifyingGlassIcon, SparklesIcon, Briefcase, SlidersHorizontal, X } from './icons';
import { Link, useNavigate } from 'react-router-dom';

type ServiceRequestStatus = ServiceRequest['status'];

const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const ServiceRequestCard: React.FC<{ request: ServiceRequest, client: User }> = ({ request, client }) => {
    const statusInfo = {
        Open: { text: 'Open', color: 'bg-blue-500/20 text-blue-300' },
        InProgress: { text: 'In Progress', color: 'bg-yellow-500/20 text-yellow-300' },
        Completed: { text: 'Completed', color: 'bg-green-500/20 text-green-300' },
        Cancelled: { text: 'Cancelled', color: 'bg-red-500/20 text-red-300' },
    };
    return (
        <Link to={`/service-request/${request.id}`} className="block bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-brandGreen-500/30 transition-all duration-200">
            <div>
                 <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-brandGreen-400">{request.category}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo[request.status].color}`}>{statusInfo[request.status].text}</span>
                 </div>
                 <h3 className="font-bold text-white mt-1">{request.title}</h3>
            </div>
            <p className="text-sm text-gray-300 line-clamp-2">{request.description}</p>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <Avatar user={client} size="sm" className="h-8 w-8"/>
                    <span className="text-sm font-semibold text-gray-200">{client.name}</span>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-200">{request.budget || 'Inquire'}</p>
                    <p className="text-xs text-gray-500">{timeAgo(request.timestamp)}</p>
                </div>
            </div>
        </Link>
    );
};

const ServiceRequestCardSkeleton: React.FC = () => (
    <div className="bg-gray-900/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-5 bg-gray-700 rounded-full w-20"></div>
        </div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="text-right">
                <div className="h-5 bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-700 rounded w-12 mt-1"></div>
            </div>
        </div>
    </div>
);

interface FilterPanelProps {
    onClose: () => void;
    activeFilters: { category: string; status: ServiceRequestStatus | 'All' };
    onApply: (newFilters: { category: string; status: ServiceRequestStatus | 'All' }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, activeFilters, onApply }) => {
    const [tempFilters, setTempFilters] = useState(activeFilters);
    const statusOptions: (ServiceRequestStatus | 'All')[] = ['All', 'Open', 'InProgress', 'Completed'];

    const handleReset = () => {
        const resetState = { category: 'All', status: 'Open' as const };
        setTempFilters(resetState);
        onApply(resetState);
        onClose();
    };
    
    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-40 animate-fade-in" onClick={onClose}>
            <div
                className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl shadow-lg p-4 max-h-[80vh] flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Filter Jobs</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {/* Status filter */}
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {statusOptions.map(status => (
                                <button key={status} onClick={() => setTempFilters(f => ({ ...f, status }))}
                                className={`px-3 py-1.5 text-sm rounded-full border ${tempFilters.status === status ? 'bg-brandGreen-600 border-brandGreen-500 text-white font-semibold' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                                >
                                    {status === 'InProgress' ? 'In Progress' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Category filter */}
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Category</h3>
                        <div className="flex flex-wrap gap-2">
                            {(['All', ...ALL_SERVICE_CATEGORIES] as (ServiceCategory | 'All')[]).map(category => (
                                <button key={category} onClick={() => setTempFilters(f => ({ ...f, category }))}
                                className={`px-3 py-1.5 text-sm rounded-full border ${tempFilters.category === category ? 'bg-brandGreen-600 border-brandGreen-500 text-white font-semibold' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto border-t border-white/10 flex-shrink-0">
                    <button onClick={handleReset} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg">Reset</button>
                    <button onClick={handleApply} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg">Apply</button>
                </div>
            </div>
        </div>
    );
};

const ServiceRequestFeed: React.FC<{ usersMap: Map<string, User>; initialSearchTerm?: string; }> = ({ usersMap, initialSearchTerm = '' }) => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<{ category: string; status: ServiceRequestStatus | 'All' }>({ category: 'All', status: 'Open' });
    const navigate = useNavigate();

    useEffect(() => {
        api.getServiceRequests().then(data => {
            setRequests(data);
            setLoading(false);
        });
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || req.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filters.category === 'All' || req.category === filters.category;
            const matchesStatus = filters.status === 'All' || req.status === filters.status;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [requests, searchTerm, filters]);
    
    const isFilterActive = filters.category !== 'All' || filters.status !== 'Open';

    return (
        <div className="space-y-4 animate-fade-in-up">
             {isFilterOpen && (
                <FilterPanel 
                    onClose={() => setIsFilterOpen(false)} 
                    activeFilters={filters}
                    onApply={setFilters}
                />
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                />
            </div>
            
            <div className="flex justify-between items-center">
                 <button 
                    onClick={() => navigate('/chats/chat-ai', { state: { initialAction: 'createServiceRequest' } })}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                 >
                    <SparklesIcon className="h-5 w-5" /> Post a job with AI
                </button>
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 font-semibold rounded-lg border transition-colors ${
                        isFilterActive
                            ? 'bg-brandGreen-500/20 text-brandGreen-300 border-brandGreen-500/30'
                            : 'bg-white/10 text-gray-200 border-white/20'
                    }`}
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {isFilterActive && <div className="h-2 w-2 bg-brandGreen-400 rounded-full"></div>}
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    <ServiceRequestCardSkeleton />
                    <ServiceRequestCardSkeleton />
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="space-y-3">
                    {filteredRequests.map(request => {
                        const client = usersMap.get(request.clientId);
                        if (!client) return null;
                        return <ServiceRequestCard key={request.id} request={request} client={client} />;
                    })}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-16">
                     <Briefcase className="h-16 w-16 mx-auto" />
                     <p className="font-semibold mt-4">No jobs match your criteria.</p>
                     <p className="text-sm">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
};

export default ServiceRequestFeed;