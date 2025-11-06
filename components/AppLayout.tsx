import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNavBar, Tab } from './BottomNavBar';
import { DesktopSidebar } from './DesktopSidebar';
import { useAppContext } from '../contexts/AppContext';

const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalUnreadCount } = useAppContext();
    
    const getActiveTab = (): Tab => {
        const path = location.pathname;
        if (path.startsWith('/wallet')) return 'wallet';
        if (path.startsWith('/chats') || path === '/') return 'chats';
        if (path.startsWith('/explore')) return 'explore';
        if (path.startsWith('/me') || path.startsWith('/profile')) return 'profile';
        return 'chats'; // Default fallback
    }
    
    const activeTab = getActiveTab();

    const handleSetActiveTab = (tab: Tab) => {
        const path = tab === 'profile' ? '/me' : `/${tab}`;
        navigate(path);
    }

    const hideNavBarPaths = [
        /^\/chats\/.+/, // Hides bottom nav bar when inside a specific chat screen on mobile
        /^\/call\//, // Hides nav bar during video/audio calls
    ];

    const shouldHideNavBar = hideNavBarPaths.some(pathRegex => pathRegex.test(location.pathname));

    return (
        <div className="flex flex-col h-full md:grid md:grid-cols-[auto_1fr] md:max-w-6xl md:mx-auto md:h-[95vh] md:my-[2.5vh] md:rounded-2xl md:overflow-hidden md:shadow-2xl md:bg-card md:border md:border-border">
            {/* Skip to content link for keyboard users */}
            <a href="#main-content" className="skip-link">Skip to content</a>
            {/* Desktop-only Sidebar for primary navigation */}
            <DesktopSidebar />
            
            {/* Main Content Area */}
            <div className="flex flex-col h-full flex-1 min-w-0 bg-background md:bg-transparent">
                <main id="main-content" className="flex-1 overflow-y-auto safe-area-top">
                    <Outlet />
                </main>
                
                {/* Mobile-only Bottom Navigation Bar */}
                {!shouldHideNavBar && (
                    <div className="md:hidden">
                        <BottomNavBar activeTab={activeTab} setActiveTab={handleSetActiveTab} totalUnreadCount={totalUnreadCount} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppLayout;
