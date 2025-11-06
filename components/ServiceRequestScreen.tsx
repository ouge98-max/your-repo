import React, { useState, useEffect } from 'react';
import { User, OumaGeService } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plane, Briefcase, Building2 } from './icons';

const serviceIcons: { [key: string]: React.FC<any> } = {
    Plane: Plane,
    Briefcase: Briefcase,
    Building2: Building2,
};

interface ServiceRequestScreenProps {
    currentUser: User;
    onBack: () => void;
}

const ServiceRequestScreen: React.FC<ServiceRequestScreenProps> = ({ currentUser, onBack }) => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const [service, setService] = useState<OumaGeService | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!serviceId) {
            setIsLoading(false);
            return;
        }
        api.getOumaGeServiceById(serviceId).then(data => {
            if (data) {
                setService(data);
            }
            setIsLoading(false);
        });
    }, [serviceId]);
    
    const handleInquiry = async () => {
        if (!service) return;

        // Special handling for Job Board to link to the correct feed
        if (service.id === 'service-2') {
            navigate('/explore', { state: { initialTab: 'services', initialSubTab: 'requests' } });
            return;
        }

        const serviceAgent = await api.findUserByPhone('+8800000000001'); // The mock service agent phone
        if (!serviceAgent) {
            toast.error("Service agent is currently unavailable.");
            return;
        }
        const chat = await api.getOrCreateChat(currentUser.id, serviceAgent.id);
        // Pre-populate chat with a message
        await api.sendMessage(chat.id, `Hi, I'm interested in the "${service.name}" service.`, currentUser.id);
        navigate(`/chats/${chat.id}`);
    };

    if (isLoading) {
        return <div className="flex flex-col h-screen"><Header title="Loading..." onBack={onBack} /><p className="text-center text-gray-400 p-4">Loading service details...</p></div>;
    }

    if (!service) {
        return <div className="flex flex-col h-screen"><Header title="Not Found" onBack={onBack} /><p className="text-center text-red-400 p-4">Service not found.</p></div>;
    }
    
    const Icon = serviceIcons[service.iconName];

    return (
        <div className="flex flex-col h-screen">
            <Header title={service.name} onBack={onBack} />
            <main className="flex-1 overflow-y-auto p-6 flex flex-col">
                <div className="flex-1">
                    <div className="text-center">
                        <Icon className="h-16 w-16 text-brandGreen-400 mx-auto" />
                        <h1 className="mt-4 text-3xl font-bold text-white">{service.name}</h1>
                    </div>
                    <div className="mt-8 text-lg text-gray-300 text-center">
                        <p>{service.description}</p>
                    </div>
                </div>
                <button 
                    onClick={handleInquiry} 
                    className="w-full bg-brandGreen-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-brandGreen-600"
                >
                    {service.id === 'service-2' ? 'View Job Board' : 'Start Inquiry'}
                </button>
            </main>
        </div>
    );
};

export default ServiceRequestScreen;