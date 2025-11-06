import React from 'react';
import { User } from '../types';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { Plus } from './icons';
import MomentsScreen from './MomentsScreen';

const MomentsDiscoveryScreen: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-gray-950 text-gray-200">
             <button
                onClick={() => navigate('/explore/new')}
                className="fixed bottom-20 right-4 md:hidden z-20 w-14 h-14 bg-brandGreen-600 rounded-full flex items-center justify-center shadow-lg shadow-brandGreen-500/30 transition-transform hover:scale-105 animate-fab-pop-in"
                aria-label="New Moment"
            >
                <Plus size={28} className="text-white" />
            </button>
            <Header title="Community Moments" onBack={() => navigate('/explore')} rightAction={
                <button onClick={() => navigate('/explore/new')} className="hidden md:flex items-center gap-2 bg-brandGreen-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                    <Plus size={18} /> New Moment
                </button>
            } />
            <main className="flex-1 overflow-y-auto p-4">
                <MomentsScreen currentUser={currentUser} />
            </main>
        </div>
    )
};

export default MomentsDiscoveryScreen;