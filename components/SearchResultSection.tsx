import React from 'react';

interface SearchResultSectionProps {
    title: string;
    children: React.ReactNode;
}

export const SearchResultSection: React.FC<SearchResultSectionProps> = ({ title, children }) => {
    return (
        <section>
            <h2 className="text-xs font-bold uppercase text-gray-500 px-3 mb-2">{title}</h2>
            <ul className="bg-white border border-gray-200 rounded-2xl p-2">
                {children}
            </ul>
        </section>
    );
};