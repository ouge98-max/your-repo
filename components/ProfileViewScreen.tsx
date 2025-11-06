import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { Avatar } from './Avatar';
import { api } from '../services/mockApi';

interface ProfileViewScreenProps {
  user: User;
  onBack: () => void;
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


const ProfileViewScreen: React.FC<ProfileViewScreenProps> = ({ user, onBack }) => {
  const [vatInfo, setVatInfo] = useState<{ name: string; rate: number } | null>(null);

  useEffect(() => {
    if (user.isMerchant && user.vatCategoryId) {
        api.getVatCategoryInfo(user.vatCategoryId).then(setVatInfo);
    }
  }, [user]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header title="Profile" onBack={onBack} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto p-6">
            <div className="flex flex-col items-center mb-8">
                <Avatar user={user} size="xl" />
                <h2 className="mt-4 text-2xl font-bold text-foreground">{user.name}</h2>
                 {user.isMerchant && (
                    <div className="text-center mt-2">
                        <p className="text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 rounded-full px-3 py-1">Merchant Account</p>
                        {vatInfo && <p className="text-xs text-muted-foreground mt-1">{vatInfo.name} ({(vatInfo.rate * 100).toFixed(1)}% VAT)</p>}
                    </div>
                 )}
                <p className="text-muted-foreground mt-1">{user.phone}</p>
                 <p className="text-foreground/80 mt-2 text-center italic">"{user.statusMessage}"</p>
                <div className="mt-2 flex items-center justify-center gap-4">
                    <KycStatusBadge status={user.kycStatus} />
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.presence === 'online' ? 'bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-300' :
                        user.presence === 'busy' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' :
                        'bg-gray-200 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                    }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${
                            user.presence === 'online' ? 'bg-green-500' :
                            user.presence === 'busy' ? 'bg-yellow-500' :
                            'bg-gray-500'
                        }`}></div>
                        <span>{user.presence.charAt(0).toUpperCase() + user.presence.slice(1)}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-card-foreground mb-4">Details</h3>
                <ul className="space-y-4">
                   <li className="flex justify-between items-start">
                       <span className="text-sm font-medium text-muted-foreground">Bio</span>
                       <span className="text-sm text-card-foreground text-right max-w-[70%]">{user.bio || 'Not set'}</span>
                   </li>
                   <li className="flex justify-between items-center">
                       <span className="text-sm font-medium text-muted-foreground">KYC Status</span>
                       <span className={`text-sm font-semibold ${user.kycStatus === 'Verified' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>{user.kycStatus}</span>
                   </li>
                   <li className="flex justify-between items-center">
                       <span className="text-sm font-medium text-muted-foreground">Joined</span>
                       <span className="text-sm text-card-foreground">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : 'N/A'}</span>
                   </li>
                </ul>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileViewScreen;