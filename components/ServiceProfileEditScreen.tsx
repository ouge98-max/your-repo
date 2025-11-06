import React, { useState, useEffect } from 'react';
import { User, ServiceProviderProfile, ALL_SERVICE_CATEGORIES } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import toast from 'react-hot-toast';

interface ServiceProfileEditScreenProps {
  user: User;
  onBack: () => void;
  onProfileUpdate: () => void;
}

const ServiceProfileEditScreen: React.FC<ServiceProfileEditScreenProps> = ({ user, onBack, onProfileUpdate }) => {
    const [profile, setProfile] = useState<Partial<ServiceProviderProfile>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [skillsInput, setSkillsInput] = useState('');

    useEffect(() => {
        if (user.serviceProviderProfileId) {
            api.getServiceProviderProfileById(user.serviceProviderProfileId).then(data => {
                if (data) {
                    setProfile(data);
                    setSkillsInput(data.skills.join(', '));
                }
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [user.serviceProviderProfileId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const profileData = {
            title: profile.title || '',
            category: profile.category || 'Other',
            description: profile.description || '',
            pricing: profile.pricing || '',
            skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
            portfolioImages: profile.portfolioImages || [],
        };

        try {
            await api.createOrUpdateServiceProviderProfile(user.id, profileData);
            toast.success('Service profile saved!');
            onProfileUpdate();
            onBack();
        } catch (error) {
            toast.error('Failed to save profile.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
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

    return (
        <div className="flex flex-col h-screen bg-gray-950">
            <Header title={user.serviceProviderProfileId ? "Edit Service Profile" : "Create Service Profile"} onBack={onBack} />
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">Service Title</label>
                    <input type="text" name="title" id="title" value={profile.title || ''} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="e.g., Expert Math Tutor" required
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select name="category" id="category" value={profile.category || 'Other'} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                    >
                        {ALL_SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea name="description" id="description" value={profile.description || ''} onChange={handleChange} rows={5}
                        className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="Describe your service in detail..." required
                    />
                </div>
                 <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Skills</label>
                    <input type="text" name="skills" id="skills" value={skillsInput} onChange={e => setSkillsInput(e.target.value)}
                        className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="e.g., Python, Graphic Design, Plumbing"
                    />
                     <p className="text-xs text-gray-500 mt-1">Separate skills with a comma.</p>
                </div>
                 <div>
                    <label htmlFor="pricing" className="block text-sm font-medium text-gray-300">Pricing / Rates</label>
                    <input type="text" name="pricing" id="pricing" value={profile.pricing || ''} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brandGreen-500 focus:border-brandGreen-500"
                        placeholder="e.g., ৳1000/hour or Project-based" required
                    />
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={isSaving} className="w-full bg-brandGreen-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brandGreen-700 disabled:opacity-50">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceProfileEditScreen;