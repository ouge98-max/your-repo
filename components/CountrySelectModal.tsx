import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { MagnifyingGlassIcon } from './icons';

export const COUNTRIES = [
    { code: 'USA', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'GBR', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'CAN', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'IND', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'AUS', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'DEU', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'JPN', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
    { code: 'ARE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
    { code: 'SGP', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
    { code: 'MYS', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
];

export interface Country {
    code: string;
    name: string;
    currency: string;
    flag: string;
}

interface CountrySelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (country: Country) => void;
}

export const CountrySelectModal: React.FC<CountrySelectModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCountries = useMemo(() => 
        COUNTRIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-fade-in">
            <Header title="Select Country" onBack={onClose} />
            <div className="p-4 border-b border-border">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search country..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border-input rounded-lg"
                        autoFocus
                    />
                </div>
            </div>
            <ul className="flex-1 overflow-y-auto">
                {filteredCountries.map(country => (
                    <li key={country.code}>
                        <button onClick={() => onSelect(country)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted">
                            <span className="text-2xl">{country.flag}</span>
                            <span className="font-semibold text-foreground">{country.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
