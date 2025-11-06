import React from 'react';
import { WalletIcon, ChatBubbleIcon, UserCircleIcon, SparklesIcon } from './icons';

export type Tab = 'wallet' | 'chats' | 'explore' | 'profile';

interface BottomNavBarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    totalUnreadCount?: number;
}

const NavItem: React.FC<{
    tabName: Tab;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    unreadCount?: number;
}> = ({ tabName, label, Icon, activeTab, setActiveTab, unreadCount }) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => setActiveTab(tabName)}
            className="relative flex flex-col items-center justify-center w-full space-y-1 touch-target touch-feedback"
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
        >
             <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {unreadCount && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 -translate-y-2 translate-x-2 transform rounded-full bg-destructive text-xs font-bold text-destructive-foreground ring-2 ring-background flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{label}</span>
        </button>
    );
};


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab, totalUnreadCount }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 z-50 safe-area-bottom">
            <nav className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-4">
                 <NavItem tabName="wallet" label="Wallet" Icon={WalletIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                 <NavItem tabName="chats" label="Chats" Icon={ChatBubbleIcon} activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={totalUnreadCount} />
                 <NavItem tabName="explore" label="Explore" Icon={SparklesIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
                 <NavItem tabName="profile" label="Profile" Icon={UserCircleIcon} activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
        </footer>
    );
};
