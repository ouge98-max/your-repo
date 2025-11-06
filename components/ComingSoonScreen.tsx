import React from 'react';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from './icons';

const ComingSoonScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header title="Coming Soon" onBack={() => navigate(-1)} />
            <main className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <SparklesIcon className="h-20 w-20 text-brandGreen-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Feature Under Construction</h2>
                <p className="text-gray-600 mt-2 max-w-sm">Our team is working hard to bring this feature to you. Please check back later!</p>
                <button onClick={() => navigate(-1)} className="mt-8 w-full max-w-xs bg-brandGreen-600 text-white font-bold py-3 rounded-lg hover:bg-brandGreen-700">
                    Go Back
                </button>
            </main>
        </div>
    );
};

export default ComingSoonScreen;
