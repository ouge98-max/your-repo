import React from 'react';

const SkeletonItem: React.FC = () => (
    <div className="flex items-center p-3">
        <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-10 text-right space-y-2">
            <div className="h-3 bg-gray-200 rounded ml-auto w-full"></div>
            <div className="h-4 w-4 bg-gray-200 rounded-full ml-auto"></div>
        </div>
    </div>
);

export const ChatListSkeleton: React.FC = () => {
    return (
        <div role="status" className="animate-pulse space-y-1">
            {[...Array(8)].map((_, i) => (
                <SkeletonItem key={i} />
            ))}
            <span className="sr-only">Loading chats...</span>
        </div>
    );
};