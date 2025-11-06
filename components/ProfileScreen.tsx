import React, { useState } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRightOnRectangleIcon, CalendarDays as CalendarDaysIcon, ShieldIcon, BuildingLibraryIcon,
    Briefcase as BriefcaseIcon, BriefcaseBusinessIcon, QrCodeIcon, Banknote, ShieldCheckIcon as ShieldCheck, PencilIcon as Pencil, CreditCardIcon, Sun, ChevronRight, Cog,
    // FIX: Import ClockIcon directly as it is exported with this alias from './icons'
    ClockIcon
} from './icons';
import { QrCodeModal } from './QrCodeModal';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar } from './Avatar'; // Added import for Avatar

interface ProfileScreenProps {
  user: User;
  onProfileUpdate: () => void;
  onLogout: () => void;
}

const KycStatusBadge: React.FC<{ status: User['kycStatus'] }> = ({ status }) => {
    const statusMap = {
        'Not Verified': { text: 'Not Verified', color: 'bg-red-200 text-red-800 dark:bg-red-500/20 dark:text-red-300' },
        'Pending': { text: 'Pending', color: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
        'Verified': { text: 'Verified', color: 'bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{text}</span>;
};

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
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onProfileUpdate, onLogout }) => {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} user={user} />
            <Header
                title="Me"
                rightAction={
                    <button onClick={() => navigate('/me/settings')} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                        <Cog className="h-6 w-6" />
                    </button>
                }
            />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-md mx-auto p-4 space-y-8 pb-8">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <Avatar user={user} size="lg" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <button onClick={() => navigate('/me/edit')} className="p-1 text-muted-foreground hover:text-foreground"><Pencil size={16}/></button>
                            </div>
                            <p className="text-muted-foreground">{user.phone}</p>
                             <div className="mt-1">
                                <KycStatusBadge status={user.kycStatus} />
                            </div>
                        </div>
                        <button onClick={() => setIsQrModalOpen(true)} className="p-2 text-muted-foreground hover:text-foreground"><QrCodeIcon className="h-7 w-7" /></button>
                    </div>

                    {/* Options List */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                        <ul className="divide-y divide-border">
                            <InfoListItem icon={<ClockIcon className="h-5 w-5 text-cyan-500" />} title="Transaction History" subtitle="View past transactions" onClick={() => navigate('/history')} />
                            <InfoListItem icon={<Banknote className="h-5 w-5 text-green-500" />} title="Monthly Budget" subtitle="Track your spending" onClick={() => navigate('/me/budget')} />
                            <InfoListItem icon={<CalendarDaysIcon className="h-5 w-5 text-blue-500" />} title="Scheduled Payments" subtitle="Manage recurring tasks" onClick={() => navigate('/me/recurring-tasks')} />
                            <InfoListItem icon={<BuildingLibraryIcon className="h-5 w-5 text-purple-500" />} title="Tax Center" subtitle="View your tax ledger" onClick={() => navigate('/me/tax-center')} />
                            <InfoListItem icon={<CreditCardIcon className="h-5 w-5 text-sky-500" />} title="Payment Methods" subtitle="Manage linked accounts & cards" onClick={() => navigate('/me/payment-methods')} />
                            <InfoListItem icon={<ShieldIcon className="h-5 w-5 text-yellow-500" />} title="Security Center" subtitle="Manage PIN, 2FA, and devices" onClick={() => navigate('/me/security')} />
                            <InfoListItem icon={<BriefcaseIcon className="h-5 w-5 text-indigo-500" />} title="My Jobs" subtitle="Track your service activity" onClick={() => navigate('/me/jobs')} />
                             <InfoListItem 
                                icon={<Cog className="h-5 w-5 text-slate-500" />} 
                                title="App Settings" 
                                subtitle="General application preferences"
                                onClick={() => navigate('/me/settings')} 
                            />
                        </ul>
                    </div>

                    {/* Service Provider Profile */}
                     <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                        <InfoListItem 
                            icon={<BriefcaseBusinessIcon className="h-5 w-5 text-teal-500" />} 
                            title="Service Provider Profile" 
                            subtitle={user.serviceProviderProfileId ? "Edit your public profile" : "Offer your skills"} 
                            onClick={() => navigate('/me/service-profile/edit')} 
                        />
                    </div>
                    
                    {/* KYC Section */}
                    {user.kycStatus !== 'Verified' && (
                        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                           <InfoListItem 
                                icon={<ShieldCheck className="h-5 w-5 text-brandGreen-500" />} 
                                title="Verify Your Identity" 
                                subtitle={user.kycStatus === 'Not Verified' ? "Complete KYC to unlock all features" : "Your verification is pending"}
                                onClick={() => navigate('/me/kyc')} 
                            />
                        </div>
                    )}

                    {/* Logout */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl">
                        <ul>
                            <li>
                                <button onClick={onLogout} className="w-full px-4 py-3 flex items-center text-left hover:bg-destructive/10 transition-colors rounded-lg">
                                    <div className="p-2 bg-destructive/20 rounded-full mr-4"><ArrowRightOnRectangleIcon className="h-5 w-5 text-destructive" /></div>
                                    <div className="font-semibold text-destructive">Log Out</div>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileScreen;