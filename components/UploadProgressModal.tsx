import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, Loader2Icon } from './icons';

const UploadProgressModal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Uploading...');

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + Math.random() * 10;
                if (newProgress >= 100) {
                    clearInterval(timer);
                    setStatus('Processing...');
                    setTimeout(() => {
                        setStatus('Complete!');
                        setTimeout(onComplete, 800);
                    }, 1200);
                    return 100;
                }
                return newProgress;
            });
        }, 200);

        return () => clearInterval(timer);
    }, [onComplete]);
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white animate-fade-in">
            {status === 'Complete!' ? (
                <CheckCircleIcon className="h-16 w-16 text-brandGreen-400 animate-check-pop" />
            ) : (
                <Loader2Icon className="h-16 w-16 text-brandGreen-400 animate-spin" />
            )}
            <p className="text-lg font-semibold mt-4">{status}</p>
            <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden">
                <div className="bg-brandGreen-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default UploadProgressModal;