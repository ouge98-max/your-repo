import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ServicesFeed from './ServicesFeed';
import ServiceRequestFeed from './ServiceRequestFeed';

type ServicesSubTab = 'providers' | 'requests';

const ServiceDiscoveryScreen: React.FC<{ usersMap: Map<string, User> }> = ({ usersMap }) => {
    const [servicesSubTab, setServicesSubTab] = useState<ServicesSubTab>('providers');
    const navigate = useNavigate();
    const location = useLocation();
    const initialSearchTerm = location.state?.searchTerm || '';

    useEffect(() => {
        // Clear the search term from location state after using it
        // so it doesn't persist on tab switches.
        if (location.state?.searchTerm) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    return (
        <div className="flex flex-col h-full bg-gray-950">
             <button
                onClick={() => navigate('/service-request/new')}
                className="fixed bottom-20 right-4 md:hidden z-20 w-14 h-14 bg-brandGreen-600 rounded-full flex items-center justify-center shadow-lg shadow-brandGreen-500/30 transition-transform hover:scale-105 animate-fab-pop-in"
                aria-label="New Service Request"
            >
                <Plus size={28} className="text-white" />
            </button>
            <Header title="Service Marketplace" onBack={() => navigate('/explore')} rightAction={
                <button onClick={() => navigate('/service-request/new')} className="hidden md:flex items-center gap-2 bg-brandGreen-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                    <Plus size={18} /> New Request
                </button>
            } />
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                 <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-lg">
                    <button onClick={() => setServicesSubTab('providers')} className={`py-1.5 rounded-md text-sm font-semibold ${servicesSubTab === 'providers' ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}>Find Providers</button>
                    <button onClick={() => setServicesSubTab('requests')} className={`py-1.5 rounded-md text-sm font-semibold ${servicesSubTab === 'requests' ? 'bg-gray-700 shadow text-white' : 'text-gray-400'}`}>Find Jobs</button>
                </div>
                {servicesSubTab === 'providers' ? <ServicesFeed usersMap={usersMap} initialSearchTerm={initialSearchTerm} /> : <ServiceRequestFeed usersMap={usersMap} initialSearchTerm={initialSearchTerm} />}
            </main>
        </div>
    )
};

export default ServiceDiscoveryScreen;