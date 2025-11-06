import React, { useState, useEffect } from 'react';
import { User, ServiceRequest, Offer } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { Link } from 'react-router-dom';

interface MyJobsScreenProps {
  currentUser: User;
  onBack: () => void;
  usersMap: Map<string, User>;
}

type Tab = 'client' | 'provider';

const JobCard: React.FC<{ request: ServiceRequest, otherUser: User | undefined, role: Tab }> = React.memo(({ request, otherUser, role }) => {
    const statusColor = {
        Open: 'bg-blue-500/20 text-blue-300',
        InProgress: 'bg-yellow-500/20 text-yellow-300',
        Completed: 'bg-green-500/20 text-green-300',
        Cancelled: 'bg-red-500/20 text-red-300',
    };

    const renderSubtitle = () => {
        if (role === 'client') {
            if (request.status === 'Open') {
                return <p className="text-sm text-gray-400 mt-1">Awaiting offers...</p>;
            }
            if (request.status === 'InProgress' && otherUser) {
                return <p className="text-sm text-gray-400 mt-1">Working with {otherUser.name}</p>;
            }
        } else { // role === 'provider'
            if (otherUser) {
                 if (request.status === 'InProgress') {
                    return <p className="text-sm text-gray-400 mt-1">Working for {otherUser.name}</p>;
                }
                if (request.status === 'Completed') {
                    return <p className="text-sm text-gray-400 mt-1">Completed for {otherUser.name}</p>;
                }
            }
        }
        return null;
    };
    
    return (
        <Link to={`/service-request/${request.id}`} className="block bg-gray-900/50 border border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-white pr-4">{request.title}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${statusColor[request.status]}`}>{request.status === 'InProgress' ? 'In Progress' : request.status}</span>
            </div>
            {renderSubtitle()}
        </Link>
    );
});

const MyJobsScreen: React.FC<MyJobsScreenProps> = ({ currentUser, onBack, usersMap }) => {
    const [activeTab, setActiveTab] = useState<Tab>('client');
    const [jobs, setJobs] = useState<{ asClient: ServiceRequest[], asProvider: ServiceRequest[] }>({ asClient: [], asProvider: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getServiceRequestsForUser(currentUser.id).then(data => {
            setJobs(data);
            setLoading(false);
        });
    }, [currentUser.id]);

    const requestsToShow = activeTab === 'client' ? jobs.asClient : jobs.asProvider;
    
    return (
        <div className="flex flex-col h-screen">
            <Header title="My Jobs" onBack={onBack} />
            <div className="p-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800 rounded-lg">
                    <button onClick={() => setActiveTab('client')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${activeTab === 'client' ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-400'}`}>As Client ({jobs.asClient.length})</button>
                    <button onClick={() => setActiveTab('provider')} className={`px-2 py-1.5 rounded-md text-sm font-semibold ${activeTab === 'provider' ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-400'}`}>As Provider ({jobs.asProvider.length})</button>
                </div>
            </div>
            <main className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <p className="text-center text-gray-400">Loading jobs...</p>
                ) : requestsToShow.length === 0 ? (
                    <p className="text-center text-gray-500 py-16">No jobs found in this category.</p>
                ) : (
                    <div className="space-y-3">
                        {requestsToShow.map(request => {
                            let otherUser: User | undefined;
                            // For provider role, we know the client from clientId
                            if (activeTab === 'provider') {
                                otherUser = usersMap.get(request.clientId);
                            }
                            // For client role, we can't easily get the provider without another API call.
                            // The JobCard will handle the 'otherUser' being undefined.
                            return <JobCard key={request.id} request={request} otherUser={otherUser} role={activeTab} />;
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyJobsScreen;
