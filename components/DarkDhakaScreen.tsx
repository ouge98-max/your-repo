import React, { useState, useEffect, useMemo } from 'react';
import { DDListing, User } from '../types';
import { api } from '../services/mockApi';
import { Header } from './Header';
import { MagnifyingGlassIcon, Plus, SlidersHorizontal, X, LayoutGrid, MapIcon } from './icons';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Avatar } from './Avatar';
import { getCurrencySymbol } from '../utils/currency';
import DDMapView from './DDMapView';

const FilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    applyFilters: (filters: any) => void;
    activeFilters: any;
}> = ({ isOpen, onClose, applyFilters, activeFilters }) => {
    const [tempFilters, setTempFilters] = useState(activeFilters);

    useEffect(() => {
        setTempFilters(activeFilters);
    }, [activeFilters]);

    if (!isOpen) return null;

    const handleApply = () => {
        applyFilters(tempFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { category: 'All', sort: 'newest' };
        applyFilters(resetFilters);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-40 animate-fade-in" onClick={onClose}>
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl shadow-lg p-4 max-h-[80vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Category</h3>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Goods', 'Delivery', 'Service'].map(cat => (
                                <button key={cat} onClick={() => setTempFilters({ ...tempFilters, category: cat })}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${tempFilters.category === cat ? 'bg-brandGreen-600 border-brandGreen-500 text-white font-semibold' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                                >
                                    {cat === 'All' ? 'All Categories' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Sort By</h3>
                        <div className="flex flex-wrap gap-2">
                             {[{key: 'newest', label: 'Newest First'}, {key: 'price_asc', label: 'Price: Low to High'}, {key: 'price_desc', label: 'Price: High to Low'}].map(sort => (
                                <button key={sort.key} onClick={() => setTempFilters({ ...tempFilters, sort: sort.key })}
                                    className={`px-3 py-1.5 text-sm rounded-full border ${tempFilters.sort === sort.key ? 'bg-brandGreen-600 border-brandGreen-500 text-white font-semibold' : 'bg-gray-800 border-gray-700 text-gray-300'}`}
                                >
                                    {sort.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pt-4 mt-6 border-t border-white/10">
                    <button onClick={handleReset} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg">Reset</button>
                    <button onClick={handleApply} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg">Apply Filters</button>
                </div>
            </div>
        </div>
    );
};

const DarkDhakaScreen: React.FC<{ currentUser: User; usersMap: Map<string, User> }> = ({ currentUser, usersMap }) => {
    const [listings, setListings] = useState<DDListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ category: 'All', sort: 'newest' });
    const [view, setView] = useState<'list' | 'map'>('list');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.getDDListings()
            .then(data => setListings(data))
            .catch(err => toast.error("Could not load listings."))
            .finally(() => setLoading(false));
    }, []);
    
    const isFilterActive = filters.category !== 'All' || filters.sort !== 'newest';

    const filteredListings = useMemo(() => {
        let sorted = [...listings];
        if (filters.sort === 'price_asc') {
            sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.price.replace(/[^0-9.-]+/g,"")));
        } else if (filters.sort === 'price_desc') {
            sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9.-]+/g,"")) - parseFloat(a.price.replace(/[^0-9.-]+/g,"")));
        }

        return sorted.filter(listing => {
            const matchesCategory = filters.category === 'All' || listing.category === filters.category;
            const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || (listing.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [listings, searchTerm, filters]);

    const renderListView = () => (
        filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map(listing => {
                     const seller = usersMap.get(listing.sellerId);
                     const formattedPrice = isNaN(parseFloat(listing.price)) ? listing.price : `${getCurrencySymbol('BDT')}${listing.price}`;
                     return (
                        <Link to={`/explore/dd/${listing.id}`} key={listing.id} className="block bg-gray-900 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-shadow border border-white/10 hover:border-brandGreen-500/30">
                            <div className="relative">
                                <img src={listing.imageUrl} alt={listing.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent w-full p-2">
                                    <p className="font-bold text-lg text-brandGreen-300">{formattedPrice}</p>
                                </div>
                                 <span className="absolute top-2 right-2 text-xs font-bold bg-red-500/80 text-white px-2 py-0.5 rounded-full">{listing.category}</span>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-white truncate">{listing.title}</h3>
                                {seller && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Avatar user={seller} size="sm" className="h-6 w-6" />
                                        <span className="text-xs font-semibold text-gray-300">{seller.name}</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                     )
                })}
            </div>
        ) : (
            <p className="text-center text-gray-500 p-16">No listings found.</p>
        )
    );

    return (
        <div className="flex flex-col h-full bg-gray-950">
             <FilterPanel 
                isOpen={showFilters} 
                onClose={() => setShowFilters(false)} 
                applyFilters={setFilters}
                activeFilters={filters}
            />
             <button
                onClick={() => navigate('/explore/dd/new')}
                className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-20 w-14 h-14 bg-brandGreen-600 rounded-full flex items-center justify-center shadow-lg shadow-brandGreen-500/30 transition-transform hover:scale-105"
                aria-label="Create New Dark Dhaka Listing"
            >
                <Plus size={28} className="text-white" />
            </button>
            <Header title="Dark Dhaka" onBack={() => navigate('/explore')} />
            
            <div className="p-4 space-y-3 border-b border-white/10">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="search" placeholder="Search listings..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                    />
                </div>
                <div className="flex justify-between items-center gap-2">
                    <button 
                        onClick={() => setShowFilters(true)} 
                        className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-2 font-semibold rounded-lg hover:bg-white/20 transition-colors border ${
                            isFilterActive
                                ? 'bg-brandGreen-500/20 text-brandGreen-300 border-brandGreen-500/30'
                                : 'bg-white/10 text-gray-200 border-white/20'
                        }`}
                    >
                        <SlidersHorizontal className="h-5 w-5" />
                        Filters {isFilterActive && <div className="h-2 w-2 bg-brandGreen-400 rounded-full"></div>}
                    </button>
                    <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg">
                        <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-700' : 'text-gray-400'}`}><LayoutGrid size={20}/></button>
                        <button onClick={() => setView('map')} className={`p-2 rounded-md ${view === 'map' ? 'bg-gray-700' : 'text-gray-400'}`}><MapIcon size={20}/></button>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <p className="text-center text-gray-400 p-8">Loading listings...</p>
                ) : view === 'list' ? (
                    renderListView()
                ) : (
                    <DDMapView listings={filteredListings} />
                )}
            </main>
        </div>
    );
};

export default DarkDhakaScreen;
