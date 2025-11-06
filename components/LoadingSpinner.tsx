import React from 'react';
import { Loader2Icon } from './icons';

const LoadingSpinner: React.FC = () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-950">
        <Loader2Icon className="h-10 w-10 animate-spin text-brandGreen-400" />
    </div>
);

export default LoadingSpinner;
