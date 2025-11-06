import React, { useState } from 'react';
import { User } from '../types';
import { Header } from './Header';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Briefcase, CameraIcon, TagIcon, LayoutGrid, ShoppingBagIcon, MagnifyingGlassIcon,
    DevicePhoneMobileIcon, Receipt, PiggyBank, BookUserIcon, Globe, Car, UtensilsCrossed, Ticket, VideoIcon
} from './icons';
import { useCart } from '../contexts/CartContext';

// Section Component
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <section className={className}>
        <h2 className="px-2 mb-3 text-lg font-bold text-foreground">{title}</h2>
        {children}
    </section>
);

// Marketplace Card (smaller version of old DiscoveryCard)
const MarketplaceCard: React.FC<{ title: string, description: string, icon: React.FC<any>, to: string, bgClassName: string }> = ({ title, description, icon: Icon, to, bgClassName }) => (
    <Link 
        to={to} 
        className={`group relative block p-4 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-40 flex flex-col justify-end ${bgClassName}`}
    >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
        <div className="relative">
            <div className="bg-white/20 p-2 rounded-full inline-block mb-2">
                <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-white/80 text-xs">{description}</p>
        </div>
    </Link>
);

// Service Icon Button
const ServiceButton: React.FC<{ title: string; icon: React.ReactNode; to: string }> = ({ title, icon, to }) => (
    <Link to={to} className="flex flex-col items-center justify-start gap-2 text-center group">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border group-hover:bg-muted group-hover:border-primary/20 transition-colors">
            {icon}
        </div>
        <span className="text-xs font-semibold text-muted-foreground w-20 truncate">{title}</span>
    </Link>
);


const DiscoverScreen: React.FC<{ currentUser: User; usersMap: Map<string, User> }> = ({ currentUser, usersMap }) => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate('/explore/services', { state: { searchTerm: searchTerm.trim() } });
        }
    };

    const renderHeaderRightAction = () => (
        <div className="flex items-center gap-2">
            <Link to="/cart" className="relative text-muted-foreground p-2 rounded-full hover:bg-muted" aria-label={`View cart with ${cartItemCount} items`}>
                <ShoppingBagIcon className="h-6 w-6"/>
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {cartItemCount > 9 ? '9+' : cartItemCount}
                    </span>
                )}
            </Link>
            <button onClick={() => navigate('/search')} className="text-muted-foreground p-2 rounded-full hover:bg-muted">
                <MagnifyingGlassIcon className="h-6 w-6"/>
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-background">
            <Header title="Explore" rightAction={renderHeaderRightAction()} />
            <main className="flex-1 overflow-y-auto p-4 space-y-8">
                
                <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search services and providers..."
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </form>

                {/* Featured: Community Moments */}
                <Link to="/explore/moments" className="group relative block p-6 rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-pink-500 to-orange-500">
                     <img src="https://picsum.photos/seed/moment-banner/800/300" alt="Community Moments" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative h-full flex flex-col justify-end">
                        <div className="bg-white/20 p-3 rounded-full inline-block mb-3 self-start">
                            <CameraIcon className="h-7 w-7 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Community Moments</h2>
                        <p className="text-white/80 text-sm">See what's happening around you.</p>
                    </div>
                </Link>

                <Section title="Essentials">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        <ServiceButton title="Recharge" icon={<DevicePhoneMobileIcon className="h-7 w-7 text-primary"/>} to="/recharge" />
                        <ServiceButton title="Pay Bill" icon={<Receipt className="h-7 w-7 text-primary"/>} to="/bill-payment" />
                        <ServiceButton title="Tickets" icon={<Ticket className="h-7 w-7 text-primary"/>} to="/tickets" />
                        <ServiceButton title="Savings" icon={<PiggyBank className="h-7 w-7 text-primary"/>} to="/me/savings" />
                    </div>
                </Section>
                
                <Section title="Marketplaces">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MarketplaceCard
                            to="/explore/news"
                            title="OumaGe News"
                            description="Watch the latest video news"
                            icon={VideoIcon}
                            bgClassName="bg-gradient-to-br from-blue-500 to-sky-600"
                        />
                        <MarketplaceCard
                            to="/explore/services"
                            title="Services"
                            description="Find pros or post jobs"
                            icon={Briefcase}
                            bgClassName="bg-gradient-to-br from-indigo-500 to-purple-600"
                        />
                        <MarketplaceCard
                            to="/explore/market"
                            title="Local Market"
                            description="Buy and sell nearby"
                            icon={TagIcon}
                            bgClassName="bg-gradient-to-br from-brand-500 to-teal-500"
                        />
                         <MarketplaceCard
                            to="/explore/dd"
                            title="Dark Dhaka"
                            description="Hyper-local listings"
                            icon={LayoutGrid}
                            bgClassName="bg-gradient-to-br from-gray-700 to-gray-900"
                        />
                    </div>
                </Section>
                
                <Section title="Government & More">
                    <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        <ServiceButton title="Passport Fee" icon={<BookUserIcon className="h-7 w-7 text-primary"/>} to="/passport-fee" />
                        <ServiceButton title="Global Transfer" icon={<Globe className="h-7 w-7 text-primary"/>} to="/international-transfer" />
                    </div>
                </Section>
                
                <Section title="More to Explore">
                     <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                        <ServiceButton title="Food" icon={<UtensilsCrossed className="h-7 w-7 text-red-500"/>} to="/coming-soon" />
                        <ServiceButton title="Rides" icon={<Car className="h-7 w-7 text-blue-500"/>} to="/coming-soon" />
                    </div>
                </Section>

            </main>
        </div>
    );
};

export default DiscoverScreen;