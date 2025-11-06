

import React from 'react';
import { NavLink } from 'react-router-dom';
import { WalletIcon, ChatBubbleIcon, ClockIcon, UserCircleIcon, SparklesIcon, ArrowRightOnRectangleIcon } from './icons';
import { User } from '../types';
import { Avatar } from './Avatar';
import { useAppContext } from '../contexts/AppContext';

const NavItem: React.FC<{ to: string, label: string, Icon: React.FC<any> }> = ({ to, label, Icon }) => (
    <NavLink
        to={to}
        end={to === '/'} // Ensures the 'Pay' tab is only active on the exact root path
        className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full p-3 rounded-lg transition-colors duration-200 group focus-visible ${
                isActive ? 'bg-primary/10' : 'hover:bg-accent'
            }`
        }
        aria-label={label}
    >
        {({ isActive }) => (
            <>
                <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'}`} />
                <span className={`text-xs mt-1 font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'}`}>{label}</span>
            </>
        )}
    </NavLink>
);

export const DesktopSidebar: React.FC = () => {
    const { currentUser, handleLogout: onLogout } = useAppContext();

    if (!currentUser) {
        return null;
    }

    return (
        <div className="hidden md:flex flex-col items-center w-24 bg-card/50 dark:bg-card/30 backdrop-blur-xl border-r border-border p-4 space-y-4">
            <NavLink to="/" aria-label="Home">
                <img src="/logo.jpg" alt="Ouma-Ge Logo" className="h-12 w-12" />
            </NavLink>
            <nav className="flex flex-col w-full space-y-2 mt-4 flex-1" role="navigation" aria-label="Main navigation">
                <NavItem to="/" label="Pay" Icon={WalletIcon} />
                <NavItem to="/chats" label="Chats" Icon={ChatBubbleIcon} />
                <NavItem to="/history" label="History" Icon={ClockIcon} />
                <NavItem to="/discover" label="Discover" Icon={SparklesIcon} />
            </nav>
             <div className="w-full flex flex-col items-center space-y-4">
                <NavLink to="/me" className="p-1 rounded-full hover:ring-2 hover:ring-primary transition-shadow" aria-label="Profile">
                    <Avatar user={currentUser} size="sm"/>
                </NavLink>
                <button 
                    onClick={onLogout} 
                    className="p-3 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors focus-visible"
                    aria-label="Log Out"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6"/>
                </button>
            </div>
        </div>
    );
};