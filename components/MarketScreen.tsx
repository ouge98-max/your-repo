import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { api } from '../services/mockApi';
import { MapIcon, LayoutGrid, MagnifyingGlassIcon, X, SlidersHorizontal } from './icons';
import MarketGridView from './MarketGridView';
import MarketMapView from './MarketMapView';
import { Link } from 'react-router-dom';


type MarketView = 'grid' | 'map';

const FilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    applyFilters: (filters: any) => void;
    activeFilters: any;
    categories: string[];
}> = ({ isOpen, onClose, applyFilters, activeFilters, categories }) => {
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
        const resetFilters = { category: 'All', minPrice: '', maxPrice: '', sort: 'newest' };
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
                <div className="space-y-6 overflow-y-auto pr-2">
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
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Category</h3>
                        <select
                            value={tempFilters.category}
                            onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
                            className="w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-300 mb-2">Price Range (BDT)</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Min price"
                                value={tempFilters.minPrice}
                                onChange={(e) => setTempFilters({ ...tempFilters, minPrice: e.target.value })}
                                className="w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md"
                            />
                            <input
                                type="number"
                                placeholder="Max price"
                                value={tempFilters.maxPrice}
                                onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: e.target.value })}
                                className="w-full bg-gray-800 text-white px-3 py-2 border border-gray-600 rounded-md"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pt-4 mt-4 border-t border-white/10">
                    <button onClick={handleReset} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg">Reset</button>
                    <button onClick={handleApply} className="w-full bg-brandGreen-600 text-white font-bold py-3 rounded-lg">Apply Filters</button>
                </div>
            </div>
        </div>
    );
};


const MarketScreen: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [marketView, setMarketView] = useState<MarketView>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ category: 'All', minPrice: '', maxPrice: '', sort: 'newest' });

    useEffect(() => {
        api.getProducts().then(setProducts);
    }, []);

    const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
    
    const isFilterActive = filters.category !== 'All' || filters.minPrice !== '' || filters.maxPrice !== '' || filters.sort !== 'newest';

    const filteredProducts = useMemo(() => {
        let sortedProducts = [...products];

        // Apply sorting
        if (filters.sort === 'price_asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_desc') {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else { // 'newest'
            // Mock newest by sorting by ID descending
            sortedProducts.sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]));
        }

        return sortedProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filters.category === 'All' || product.category === filters.category;
            const minPrice = parseFloat(filters.minPrice);
            const maxPrice = parseFloat(filters.maxPrice);
            const matchesMinPrice = isNaN(minPrice) || product.price >= minPrice;
            const matchesMaxPrice = isNaN(maxPrice) || product.price <= maxPrice;

            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
        });
    }, [products, searchTerm, filters]);


    return (
        <div>
             <FilterPanel 
                isOpen={showFilters} 
                onClose={() => setShowFilters(false)} 
                applyFilters={setFilters}
                activeFilters={filters}
                categories={categories}
            />
            <div className="flex justify-between gap-2 mb-4">
                 <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brandGreen-500"
                    />
                </div>
                <button 
                    onClick={() => setShowFilters(true)} 
                    className={`relative p-2 rounded-lg border transition-colors ${isFilterActive ? 'bg-brandGreen-500/20 border-brandGreen-500' : 'bg-gray-800 border-gray-700'}`}
                    aria-label="Filters"
                >
                    <SlidersHorizontal className={`h-5 w-5 ${isFilterActive ? 'text-brandGreen-400' : 'text-gray-300'}`} />
                    {isFilterActive && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-brandGreen-400 rounded-full border-2 border-gray-950"></div>}
                </button>
                <button 
                    onClick={() => setMarketView('grid')} 
                    className={`p-2 rounded-lg ${marketView === 'grid' ? 'bg-brandGreen-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                    aria-label="Grid view"
                >
                    <LayoutGrid className="h-5 w-5" />
                </button>
                <button 
                    onClick={() => setMarketView('map')} 
                    className={`p-2 rounded-lg ${marketView === 'map' ? 'bg-brandGreen-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                    aria-label="Map view"
                >
                    <MapIcon className="h-5 w-5" />
                </button>
            </div>
            {marketView === 'grid' ? <MarketGridView products={filteredProducts} /> : <MarketMapView products={filteredProducts} />}
        </div>
    );
};

export default MarketScreen;
