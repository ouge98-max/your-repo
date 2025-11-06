import React from 'react';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { TrainFront, Bus } from './icons';

const ServiceCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    path: string;
    navigate: (path: string) => void;
}> = ({ icon, title, path, navigate }) => (
    <button onClick={() => navigate(path)} className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors">
        <div className="p-3 bg-secondary rounded-lg">{icon}</div>
        <div>
            <p className="font-semibold text-card-foreground text-lg">{title}</p>
        </div>
    </button>
);

const TicketsScreen: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header title="Book Tickets" onBack={() => navigate(-1)} />
            <main className="flex-1 p-4">
                <div className="max-w-md mx-auto space-y-3">
                    <ServiceCard 
                        icon={<TrainFront className="h-8 w-8 text-orange-500" />}
                        title="Train Tickets"
                        path="/train-ticket"
                        navigate={navigate}
                    />
                    <ServiceCard 
                        icon={<Bus className="h-8 w-8 text-lime-500" />}
                        title="Bus Tickets"
                        path="/bus-ticket"
                        navigate={navigate}
                    />
                </div>
            </main>
        </div>
    );
}

export default TicketsScreen;