import React, { useState } from 'react';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { Cog, Sun, BellRing, ShieldIcon, Info, ChevronRight, MessageCircle } from './icons';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { ToggleSwitch } from './ToggleSwitch';
import toast from 'react-hot-toast';

const InfoListItem: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void, rightContent?: React.ReactNode }> = ({ icon, title, subtitle, onClick, rightContent }) => {
    const content = (
        <>
            <div className="p-2 bg-secondary rounded-full mr-4">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-card-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {rightContent ? rightContent : (onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />)}
        </>
    );

    const commonClasses = "w-full px-4 py-3 flex items-center text-left";

    return (
        <li>
            {onClick ? (
                 <button onClick={onClick} className={`${commonClasses} hover:bg-secondary/50 transition-colors rounded-lg`}>
                    {content}
                </button>
            ) : (
                <div className={commonClasses}>
                    {content}
                </div>
            )}
        </li>
    );
}

const SettingsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Mock state

    const handleToggleNotifications = () => {
        setNotificationsEnabled(prev => {
            const newState = !prev;
            toast.success(`Notifications ${newState ? 'Enabled' : 'Disabled'}`);
            return newState;
        });
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <Header title="App Settings" onBack={() => navigate(-1)} />
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* General Settings */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground px-4 pt-4">General</h3>
                    <ul className="divide-y divide-border">
                        <InfoListItem 
                            icon={<Sun className="h-5 w-5 text-yellow-500" />} 
                            title="Appearance" 
                            subtitle={`Using ${theme} mode`}
                            rightContent={<ThemeToggle />} 
                        />
                        <InfoListItem 
                            icon={<MessageCircle className="h-5 w-5 text-blue-500" />} 
                            title="Chat Background" 
                            subtitle="Customize your chat experience"
                            onClick={() => toast.success("This feature is coming soon!")}
                        />
                    </ul>
                </div>

                {/* Notifications */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground px-4 pt-4">Notifications</h3>
                    <ul className="divide-y divide-border">
                        <li className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-secondary rounded-full mr-0"><BellRing className="h-5 w-5 text-purple-500" /></div>
                                <div>
                                    <p className="font-semibold text-card-foreground">App Notifications</p>
                                    <p className="text-sm text-muted-foreground">Receive alerts and updates</p>
                                </div>
                            </div>
                            <ToggleSwitch checked={notificationsEnabled} onChange={handleToggleNotifications} />
                        </li>
                    </ul>
                </div>

                {/* Privacy & Security */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground px-4 pt-4">Privacy & Security</h3>
                    <ul className="divide-y divide-border">
                        <InfoListItem 
                            icon={<ShieldIcon className="h-5 w-5 text-brandGreen-500" />} 
                            title="Security Center" 
                            subtitle="Manage account security settings"
                            onClick={() => navigate('/me/security')} 
                        />
                        <InfoListItem 
                            icon={<Info className="h-5 w-5 text-gray-500" />} 
                            title="Privacy Policy" 
                            subtitle="Understand how your data is used"
                            onClick={() => toast.success("This will open the privacy policy in a new tab.")}
                        />
                    </ul>
                </div>

                {/* About */}
                <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                    <h3 className="text-lg font-semibold text-foreground px-4 pt-4">About</h3>
                    <ul className="divide-y divide-border">
                        <InfoListItem 
                            icon={<Cog className="h-5 w-5 text-brandGreen-500" />} 
                            title="Version" 
                            subtitle="1.0.0 (MVP)"
                        />
                        <InfoListItem 
                            icon={<Info className="h-5 w-5 text-gray-500" />} 
                            title="Terms of Service" 
                            subtitle="Read our terms and conditions"
                            onClick={() => toast.success("This will open the terms of service in a new tab.")}
                        />
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default SettingsScreen;