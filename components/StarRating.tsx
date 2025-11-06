import React from 'react';
import { StarIcon } from './icons';

export const StarRating: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => {
    return (
        <div className={`flex items-center ${className}`}>
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                const fill = rating >= starValue ? 'currentColor' : 'none';
                return <StarIcon key={index} className="h-4 w-4 text-yellow-400" fill={fill} />;
            })}
        </div>
    );
};