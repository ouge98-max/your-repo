

import React, { useState } from 'react';
import { User, ServiceCategory, ALL_SERVICE_CATEGORIES, ServiceRequest } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LocationPickerModal } from './LocationPickerModal';
import { MapPinIcon as MapPin } from './icons';

interface CreateServiceRequestScreenProps {
  currentUser: User;
}

const CreateServiceRequestScreen: React.FC<CreateServiceRequestScreenProps> = ({ currentUser }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ServiceCategory>('Other');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [location, setLocation] = useState<ServiceRequest['location'] | undefined>(undefined);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in the title and description.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.createServiceRequest({
                clientId: currentUser.id,
                title,
                category,
                description,
                budget: budget || undefined,
                location: location,
            });
            toast.success('Service request posted!');
            navigate('/discover'); // Navigate back to discover to see the post
        } catch (error) {
            toast.error('Failed to post request.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <LocationPickerModal
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onConfirm={(loc) => {
                    setLocation(loc);
                    setIsPickerOpen(false);
                }}
            />
            <div className="flex flex-col h-screen bg-gray-950">
                <Header title="Post a Service Request" onBack={() => navigate('/discover')} />
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300">Request Title</label>
                        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                            placeholder="What do you need help with?" required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                        <select name="category" id="category" value={category} onChange={(e) => setCategory(e.target.value as any)}
                            className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        >
                            {ALL_SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                            className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                            placeholder="Describe your problem or what you need done in detail..." required
                        />
                    </div>
                    <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-300">Your Budget (Optional)</label>
                        <input type="text" name="budget" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)}
                            className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                            placeholder="e.g., ৳5,000, Negotiable"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Location (Optional)</label>
                        {location ? (
                            <div className="mt-1 flex items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-700">
                                <p className="text-sm text-gray-200 truncate">{location.address}</p>
                                <button type="button" onClick={() => setIsPickerOpen(true)} className="text-xs font-semibold text-brandGreen-400">Change</button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setIsPickerOpen(true)} className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-gray-300 font-semibold rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
                                <MapPin className="h-5 w-5" />
                                Set Location
                            </button>
                        )}
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full bg-brandGreen-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brandGreen-700 disabled:opacity-50">
                            {isSubmitting ? 'Posting...' : 'Post Request'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateServiceRequestScreen;
